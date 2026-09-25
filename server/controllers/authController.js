import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const getJwtSecret = () => process.env.JWT_SECRET || 'jira_workplace_jwt_secret_dev_key';

const generateToken = (user) => {
  return jwt.sign(
    {
      sub: user.id,
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role || 'Member',
    },
    getJwtSecret(),
    { expiresIn: '7d' }
  );
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const initials = name
      .trim()
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    const newUser = await User.create({
      id: `usr_${Date.now()}`,
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: 'Member',
      initials: initials || 'US',
      provider: 'email',
    });

    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        initials: newUser.initials,
      },
      token,
      message: 'Registration successful.',
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ success: false, message: 'No account found with this email.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect password.' });
    }

    const token = generateToken(user);

    return res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        initials: user.initials,
        avatar: user.avatar,
      },
      token,
      message: 'Login successful.',
    });
  } catch (error) {
    next(error);
  }
};

export const googleLogin = async (req, res, next) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ success: false, message: 'Google credential is required.' });
    }

    // Decode Google ID Token (JWT: header.payload.signature)
    let payload;
    try {
      const parts = credential.split('.');
      if (parts.length === 3) {
        const buff = Buffer.from(parts[1], 'base64');
        payload = JSON.parse(buff.toString('utf-8'));
      }
    } catch (e) {
      console.warn('Failed to parse Google JWT payload:', e.message);
    }

    if (!payload || !payload.email) {
      return res.status(400).json({ success: false, message: 'Invalid Google credential token.' });
    }

    const { email, name, picture, sub } = payload;
    const normalizedEmail = email.trim().toLowerCase();

    let user = await User.findOne({ email: normalizedEmail });

    const initials = (name || email.split('@')[0])
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    if (!user) {
      user = await User.create({
        id: `usr_${Date.now()}`,
        name: name || email.split('@')[0],
        email: normalizedEmail,
        avatar: picture || '',
        role: 'Member',
        initials: initials || 'GU',
        provider: 'google',
        googleId: sub,
      });
    } else {
      if (picture && !user.avatar) {
        user.avatar = picture;
        await user.save();
      }
    }

    const token = generateToken(user);

    return res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        initials: user.initials,
        avatar: user.avatar,
        provider: 'google',
      },
      token,
      message: 'Logged in successfully with Google account.',
    });
  } catch (error) {
    next(error);
  }
};

export const loginSocial = async (req, res, next) => {
  try {
    const { name, email, provider, avatar } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required for social login.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      const displayName = name || email.split('@')[0];
      const initials = displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();

      user = await User.create({
        id: `usr_${Date.now()}`,
        name: displayName,
        email: normalizedEmail,
        avatar: avatar || '',
        role: 'Member',
        initials: initials || 'US',
        provider: provider || 'social',
      });
    } else if (avatar && !user.avatar) {
      user.avatar = avatar;
      await user.save();
    }

    const token = generateToken(user);

    return res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        initials: user.initials,
        avatar: user.avatar,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findOne({ id: req.user.sub || req.user.id }).select('-passwordHash');

    if (!user) {
      return res.status(404).json({ authenticated: false, message: 'User not found' });
    }

    return res.json({
      authenticated: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        workTypeTitle: user.workTypeTitle || 'Software Development',
        initials: user.initials,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { role, workTypeTitle, email, name } = req.body;
    const userEmail = req.user?.email || email;
    const userId = req.user?.sub || req.user?.id;

    let user = null;
    if (userId) {
      user = await User.findOne({ id: userId });
    }
    if (!user && userEmail) {
      user = await User.findOne({ email: userEmail.trim().toLowerCase() });
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (role) user.role = role;
    if (workTypeTitle) user.workTypeTitle = workTypeTitle;
    if (name) user.name = name;
    await user.save();

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        workTypeTitle: user.workTypeTitle,
        initials: user.initials,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res) => {
  return res.json({ success: true, message: 'Logged out successfully.' });
};

