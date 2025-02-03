const db = require('../config/db');
const bcyrypt = require('bcrypt');

// Register patient
exports.registerPatient = async (req, res) => {
  const { first_name, last_name, email, password, phone, date_of_birth, gender, address, region, contact, termsAccepted } = req.body;

  try {
    const password_hash = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      `INSERT INTO patients (first_name, last_name, email, password_hash, phone, date_of_birth, gender, address, region, contact, termsAccepted)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [first_name, last_name, email, password_hash, phone, date_of_birth, gender, address, region, contact, termsAccepted]
    );

    res.status(201).json({ message: 'Patient registered successfully', patient_id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Patient Login
exports.loginPatient = (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM Patients WHERE email = ?";
  db.query(sql, [email], (err, results) => {
      if (err || results.length === 0) {
          return res.status(401).json({ error: 'Invalid email or password' });
      }

      const patient = results[0];
      if (!bcrypt.compareSync(password, patient.password_hash)) {
          return res.status(401).json({ error: 'Invalid email or password' });
      }

      req.session.patientId = patient.id;
      res.status(200).json({ message: 'Login successful!' });
  });
};

// Patient Logout
exports.logoutPatient = (req, res) => {
  req.session.destroy(err => {
      if (err) {
          return res.status(500).json({ error: 'Could not log out' });
      }
      res.status(200).json({ message: 'Logged out successfully' });
  });
};

// View patient profile
exports.viewProfile = async (req, res) => {
  const patient_id = req.user.patient_id;

  try {
    const [profile] = await db.query('SELECT * FROM patients WHERE patient_id = ?', [patient_id]);
    res.json({ profile: profile[0] });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
