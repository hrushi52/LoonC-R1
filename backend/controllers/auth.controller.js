const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    const sql = 'SELECT * FROM admins WHERE email = ?';
    const admins = await db.query(sql, [email]);

    if (admins.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.'
      });
    }

    const admin = admins[0];
    const isPasswordValid = await bcrypt.compare(password, admin.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.'
      });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        admin: {
          id: admin.id,
          email: admin.email
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
};

const createAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    const checkSql = 'SELECT id FROM admins WHERE email = ?';
    const existing = await db.query(checkSql, [email]);

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Admin with this email already exists.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const insertSql = 'INSERT INTO admins (email, password_hash) VALUES (?, ?)';
    const result = await db.query(insertSql, [email, hashedPassword]);

    res.status(201).json({
      success: true,
      message: 'Admin created successfully.',
      data: {
        id: result.insertId,
        email
      }
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
};

module.exports = {
  login,
  createAdmin
};
