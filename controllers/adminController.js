const db = require('../config/db');

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
