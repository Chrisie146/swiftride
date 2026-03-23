const prisma = require('../utils/prisma');
const jwt = require('jsonwebtoken');

function signDriverToken(user) {
  return jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET || 'supersecretkey',
    { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
  );
}

exports.register = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { licenceNumber, vehicleMake, vehicleModel, vehicleColor, plateNumber } = req.body;

    if (!licenceNumber || !vehicleMake || !vehicleModel || !vehicleColor || !plateNumber) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user is already a driver
    const existing = await prisma.driverProfile.findUnique({ where: { userId } });
    if (existing) {
      return res.status(400).json({ error: 'Driver profile already exists' });
    }

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: userId },
        data: { role: 'DRIVER' }
      });

      const profile = await tx.driverProfile.create({
        data: {
          userId,
          licenceNumber,
          vehicleMake,
          vehicleModel,
          vehicleColor,
          plateNumber,
          status: 'PENDING'
        }
      });

      return { user, profile };
    });

    const token = signDriverToken(result.user);

    res.json({
      token,
      user: result.user,
      profile: result.profile
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const profile = await prisma.driverProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            role: true
          }
        }
      }
    });

    if (!profile) return res.status(404).json({ error: 'Driver profile not found' });

    res.json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { online, lat, lng } = req.body;

    const profile = await prisma.driverProfile.findUnique({ where: { userId } });
    if (!profile) return res.status(404).json({ error: 'Driver profile not found' });

    if (online && profile.status !== 'APPROVED') {
      return res.status(403).json({ error: 'Cannot go online. Status is not APPROVED.' });
    }

    const updated = await prisma.driverProfile.update({
      where: { userId },
      data: {
        isOnline: online,
        currentLat: typeof lat === 'number' ? lat : profile.currentLat,
        currentLng: typeof lng === 'number' ? lng : profile.currentLng
      }
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getRequests = async (req, res) => {
  try {
    const rides = await prisma.ride.findMany({
      where: { status: 'REQUESTED' },
      orderBy: { requestedAt: 'desc' },
      include: { passenger: { select: { name: true } } }
    });

    res.json(rides);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getEarnings = async (req, res) => {
  try {
    const userId = req.user.userId;
    const profile = await prisma.driverProfile.findUnique({ where: { userId } });
    if (!profile) return res.status(404).json({ error: 'Driver profile not found' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const rides = await prisma.ride.findMany({
      where: {
        driverId: userId,
        status: 'COMPLETED'
      }
    });

    let todayEarnings = 0;
    let weekEarnings = 0;
    let todayRides = 0;

    for (let ride of rides) {
      if (ride.completedAt >= startOfWeek) {
        weekEarnings += ride.driverEarning || 0;
        if (ride.completedAt >= today) {
          todayEarnings += ride.driverEarning || 0;
          todayRides++;
        }
      }
    }

    const ledgers = await prisma.commissionLedger.findMany({
      where: {
        driverId: profile.id,
        settled: false
      }
    });

    const cashOwed = ledgers.reduce((sum, l) => sum + l.driverOwes, 0);

    res.json({
      todayEarnings,
      weekEarnings,
      todayRides,
      cashOwed,
      rating: profile.rating,
      totalRides: profile.totalRides
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
