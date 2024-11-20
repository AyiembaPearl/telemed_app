const db = require('../config/db');

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
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
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
