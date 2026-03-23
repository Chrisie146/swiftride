const prisma = require('../utils/prisma');
const { calculateDistance, calculateFareAndCommission } = require('../utils/fare');

exports.estimateFare = async (req, res) => {
  try {
    const { pickupLat, pickupLng, dropoffLat, dropoffLng } = req.body;
    if (!pickupLat || !pickupLng || !dropoffLat || !dropoffLng) {
      return res.status(400).json({ error: 'Missing coordinates' });
    }

    const distanceKm = calculateDistance(pickupLat, pickupLng, dropoffLat, dropoffLng);
    const fareDetails = calculateFareAndCommission(distanceKm);

    res.json({
      distanceKm: Math.round(distanceKm * 100) / 100,
      ...fareDetails
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.requestRide = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { pickupAddress, dropoffAddress, pickupLat, pickupLng, dropoffLat, dropoffLng, paymentMethod } = req.body;

    if (!pickupAddress || !dropoffAddress || !pickupLat || !pickupLng || !dropoffLat || !dropoffLng || !paymentMethod) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const distanceKm = calculateDistance(pickupLat, pickupLng, dropoffLat, dropoffLng);
    const { fareAmount, commissionAmt, driverEarning } = calculateFareAndCommission(distanceKm);

    const ride = await prisma.ride.create({
      data: {
        passengerId: userId,
        pickupAddress,
        dropoffAddress,
        pickupLat,
        pickupLng,
        dropoffLat,
        dropoffLng,
        distanceKm: Math.round(distanceKm * 100) / 100,
        fareAmount,
        commissionAmt,
        driverEarning,
        paymentMethod
      }
    });

    res.json(ride);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const rides = await prisma.ride.findMany({
      where: {
        passengerId: userId,
        status: 'COMPLETED'
      },
      orderBy: { completedAt: 'desc' },
      take: 20,
      include: { driver: true }
    });

    res.json(rides);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getRideById = async (req, res) => {
  try {
    const { id } = req.params;
    const ride = await prisma.ride.findUnique({
      where: { id },
      include: {
        passenger: true,
        driver: {
          include: { driverProfile: true }
        }
      }
    });

    if (!ride) return res.status(404).json({ error: 'Ride not found' });
    res.json(ride);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.cancelRide = async (req, res) => {
  try {
    const { id } = req.params;
    const ride = await prisma.ride.findUnique({ where: { id } });

    if (!ride) return res.status(404).json({ error: 'Ride not found' });
    if (!['REQUESTED', 'ACCEPTED'].includes(ride.status)) {
      return res.status(400).json({ error: 'Cannot cancel ride at this status' });
    }

    const updatedRide = await prisma.ride.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date()
      }
    });

    res.json(updatedRide);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.acceptRide = async (req, res) => {
  try {
    const { id } = req.params;
    const driverId = req.user.userId;

    const driverProfile = await prisma.driverProfile.findUnique({ where: { userId: driverId } });
    if (!driverProfile || driverProfile.status !== 'APPROVED') {
      return res.status(403).json({ error: 'Driver not approved' });
    }

    const ride = await prisma.ride.findUnique({ where: { id } });
    if (!ride || ride.status !== 'REQUESTED') {
      return res.status(400).json({ error: 'Ride no longer available' });
    }

    const updatedRide = await prisma.ride.update({
      where: { id },
      data: {
        status: 'ACCEPTED',
        driverId,
        acceptedAt: new Date()
      }
    });

    res.json(updatedRide);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.arriveRide = async (req, res) => {
  try {
    const { id } = req.params;
    const driverId = req.user.userId;

    const ride = await prisma.ride.findFirst({
      where: { id, driverId, status: 'ACCEPTED' }
    });

    if (!ride) return res.status(400).json({ error: 'Ride not found or invalid status' });

    const updatedRide = await prisma.ride.update({
      where: { id },
      data: {
        status: 'ARRIVED',
        arrivedAt: new Date()
      }
    });

    res.json(updatedRide);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.completeRide = async (req, res) => {
  try {
    const { id } = req.params;
    const driverId = req.user.userId;

    const ride = await prisma.ride.findFirst({
      where: { id, driverId, status: 'ARRIVED' }
    });

    if (!ride) return res.status(400).json({ error: 'Ride not found or invalid status' });

    const driverProfile = await prisma.driverProfile.findUnique({ where: { userId: driverId } });

    let isCash = ride.paymentMethod === 'CASH';
    let driverOwes = isCash ? ride.commissionAmt : 0;
    let settled = !isCash;

    const [updatedRide, commissionEntry] = await prisma.$transaction([
      prisma.ride.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          paymentStatus: isCash ? 'PENDING' : 'PAID'
        }
      }),
      prisma.commissionLedger.create({
        data: {
          driverId: driverProfile.id,
          rideId: ride.id,
          rideAmount: ride.fareAmount,
          commission: ride.commissionAmt,
          driverOwes,
          method: ride.paymentMethod,
          settled,
          settledAt: settled ? new Date() : null
        }
      })
    ]);

    await prisma.driverProfile.update({
      where: { id: driverProfile.id },
      data: { totalRides: { increment: 1 } }
    });

    res.json(updatedRide);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
