const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../models/patient');
const { JWT_SECRET } = require('../config/db');

// Register patient
exports.registerAdmin = async (req, res) => {
  const { first_name, last_name, email, password, phone, username, role, termsAccepted } = req.body;

  try {
    const password_hash = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      `INSERT INTO admin (first_name, last_name, email, password_hash, phone, username, role, termsAccepted)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [first_name, last_name, email, password_hash, phone, username, role, termsAccepted]
    );

    res.status(201).json({ message: 'Admin registered successfully', admin_id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Admin login
exports.adminLogin = async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await db.query('SELECT * FROM admin WHERE username = ?', [username]);
    if (rows.length === 0) return res.status(400).json({ error: 'Admin not found' });

    const admin = rows[0];
    const match = await bcrypt.compare(password, admin.password_hash);

    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ admin_id: admin.admin_id, role: admin.role }, JWT_SECRET, { expiresIn: '2h' });
    res.json({ token, admin: { id: admin.admin_id, username: admin.username } });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Logout
exports.logoutAdmin = (req, res) => {
  req.session.destroy(err => {
      if (err) {
          return res.status(500).json({ error: 'Could not log out' });
      }
      res.status(200).json({ message: 'Logged out successfully' });
  });
};

// View admin profile
exports.viewProfile = async (req, res) => {
  const admin_id = req.user.admin_id;

  try {
    const [profile] = await db.query('SELECT * FROM admin WHERE admin_id = ?', [admin_id]);
    res.json({ profile: profile[0] });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all users (patients and doctors)
exports.getUsers = async (req, res) => {
  try {
    const [patients] = await db.query('SELECT patient_id, first_name, last_name, email FROM patients');
    const [doctors] = await db.query('SELECT doctor_id, first_name, last_name, specialization, email FROM doctors');
    res.json({ patients, doctors });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Verify Token Middleware
exports.verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ error: 'No token provided' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Unauthorized' });
    req.user = decoded;
    next();
  });
};
