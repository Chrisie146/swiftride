const prisma = require('../utils/prisma');

exports.getPendingDrivers = async (req, res) => {
  try {
    const drivers = await prisma.driverProfile.findMany({
      where: { status: 'PENDING' },
      include: { user: true }
    });
    res.json(drivers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.approveDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const driver = await prisma.driverProfile.update({
      where: { id },
      data: { status: 'APPROVED' }
    });
    res.json(driver);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.rejectDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const driver = await prisma.driverProfile.update({
      where: { id },
      data: { status: 'SUSPENDED' }
    });
    
    res.json({ message: 'Driver rejected', driver, reason });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getRides = async (req, res) => {
  try {
    const { status, limit } = req.query;
    const where = {};
    if (status) where.status = status;
    
    const rides = await prisma.ride.findMany({
      where,
      take: limit ? parseInt(limit) : undefined,
      orderBy: { requestedAt: 'desc' },
      include: {
        passenger: true,
        driver: true
      }
    });
    res.json(rides);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getRevenue = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0,0,0,0);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const rides = await prisma.ride.findMany({
      where: { status: 'COMPLETED' },
      select: { completedAt: true, commissionAmt: true }
    });

    let todayCommission = 0;
    let weekCommission = 0;
    
    for (const r of rides) {
      if (r.completedAt >= today) todayCommission += r.commissionAmt || 0;
      if (r.completedAt >= startOfWeek) weekCommission += r.commissionAmt || 0;
    }

    const ledgers = await prisma.commissionLedger.findMany({
      where: { settled: false }
    });

    const cashPending = ledgers.reduce((sum, l) => sum + l.driverOwes, 0);

    const totalRides = await prisma.ride.count({ where: { status: 'COMPLETED' } });

    res.json({
      todayCommission,
      weekCommission,
      cashPending,
      totalCompletedRides: totalRides,
      cashWarning: cashPending > 500
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.settleCommission = async (req, res) => {
  try {
    const { driverId } = req.params;
    
    await prisma.commissionLedger.updateMany({
      where: { driverId, settled: false },
      data: {
        settled: true,
        settledAt: new Date()
      }
    });

    res.json({ message: 'Commission settled for driver ' + driverId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getSettlements = async (req, res) => {
  try {
    const ledgers = await prisma.commissionLedger.findMany({
      where: { settled: false },
      include: {
        driver: {
          include: { user: true }
        }
      }
    });

    const grouped = {};
    for (const l of ledgers) {
      if (!grouped[l.driverId]) {
        grouped[l.driverId] = {
          driverId: l.driverId,
          driverName: l.driver.user.name,
          driverPhone: l.driver.user.phone,
          unsettledRidesCount: 0,
          totalOwed: 0
        };
      }
      grouped[l.driverId].unsettledRidesCount++;
      grouped[l.driverId].totalOwed += l.driverOwes;
    }

    res.json(Object.values(grouped));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
