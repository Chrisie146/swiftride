const prisma = require('../utils/prisma');
const jwt = require('jsonwebtoken');
const axios = require('axios');

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function normalizePhone(phone) {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '27' + cleaned.slice(1);
  }
  if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }
  return cleaned;
}

exports.requestOtp = async (req, res) => {
  try {
    const { phone, name } = req.body;
    if (!phone) return res.status(400).json({ error: 'Phone number is required' });

    const normalizedPhone = normalizePhone(phone);
    
    let user = await prisma.user.findUnique({ where: { phone: normalizedPhone } });
    if (!user) {
      if (!name) return res.status(400).json({ error: 'Name is required for new users' });
      user = await prisma.user.create({
        data: {
          phone: normalizedPhone,
          name
        }
      });
    }

    const code = generateOTP();
    const expiresAt = new Date(Date.now() + parseInt(process.env.OTP_EXPIRY_MINUTES || 10) * 60000);

    await prisma.otpCode.create({
      data: {
        userId: user.id,
        code,
        expiresAt
      }
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[OTP] For ${normalizedPhone}: ${code}`);
    } else {
      await axios.post(
        'https://api.bulksms.com/v1/messages',
        {
          to: normalizedPhone,
          body: `Your SwiftRide OTP is ${code}. It expires in ${process.env.OTP_EXPIRY_MINUTES || 10} minutes.`
        },
        {
          auth: {
            username: process.env.BULKSMS_USERNAME,
            password: process.env.BULKSMS_PASSWORD
          }
        }
      );
    }

    res.json({ userId: user.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { userId, code } = req.body;
    if (!userId || !code) return res.status(400).json({ error: 'UserId and code are required' });

    const otp = await prisma.otpCode.findFirst({
      where: {
        userId,
        code,
        used: false,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!otp) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    await prisma.otpCode.update({
      where: { id: otp.id },
      data: { used: true }
    });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'supersecretkey',
      { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
    );

    res.json({ token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
