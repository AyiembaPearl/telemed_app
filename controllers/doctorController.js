const db = require('../config/db');

// View doctor schedule
exports.viewSchedule = async (req, res) => {
  const doctor_id = req.user.doctor_id;

  try {
    const [schedule] = await db.query('SELECT * FROM doctors WHERE doctor_id = ?', [doctor_id]);
    res.json({ schedule: schedule[0] });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
