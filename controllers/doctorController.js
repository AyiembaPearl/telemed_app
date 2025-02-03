const db = require('../config/db');
const bcyrypt = require('bcrypt');

// Register doctor
exports.registerDoctor = async (req, res) => {
  const { first_name, last_name, email, password, phone, specialization, schedule, termsAccepted } = req.body;

  try {
    const password_hash = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      `INSERT INTO doctors (first_name, last_name, email, password_hash, phone, specialization, schedule, termsAccepted)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [first_name, last_name, email, password_hash, phone, specialization, schedule, termsAccepted]
    );

    res.status(201).json({ message: 'Doctor registered successfully', doctor_id_id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Doctor Login
exports.loginDoctor = (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM doctors WHERE email = ?";
  db.query(sql, [email], (err, results) => {
      if (err || results.length === 0) {
          return res.status(401).json({ error: 'Invalid email or password' });
      }

      const doctor = results[0];
      if (!bcrypt.compareSync(password, doctor.password_hash)) {
          return res.status(401).json({ error: 'Invalid email or password' });
      }

      req.session.doctorId = doctor.id;
      res.status(200).json({ message: 'Login successful!' });
  });
};

// Doctor Logout
exports.logoutDoctor = (req, res) => {
  req.session.destroy(err => {
      if (err) {
          return res.status(500).json({ error: 'Could not log out' });
      }
      res.status(200).json({ message: 'Logged out successfully' });
  });
};

// View doctor profile
exports.viewProfile = async (req, res) => {
  const doctor_id = req.user.doctor_id;

  try {
    const [profile] = await db.query('SELECT * FROM doctors WHERE doctot_id = ?', [doctor_id]);
    res.json({ profile: profile[0] });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};


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
