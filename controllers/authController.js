const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../models/patient');
const { JWT_SECRET } = require('../config/db');

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
