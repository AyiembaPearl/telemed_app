//Importing dependecies
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const mysql = require('mysql2');
const pool = require('./config/db');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const path = require('path');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const doctorRoutes = require('./routes/doctorRoutes');

dotenv.config();
const app = express();

// app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '/')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/models/patient', patientRoutes);
app.use('/models/appointment', authRoutes);
app.use('/model/doctor', doctorRoutes);
app.use('/model/admin', doctorRoutes);
// Session Configuration
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true
}));

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

//handle db connection errors
db.connect((error) => {
  if (error) {
    console.error('Database connection failed.', error);
    return;
  }
  console.log('Connected to database');
});

// //JWT Middleware for protected routes
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).send('No token provided.');

  const tokenParts = token.split(' ');
  if (tokenParts[0] !== 'Bearer' || !tokenParts[1]) {
    return res.status(403).send('Invalid token format');
  }

  jwt.verify(tokenParts[1], process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(500).send('Failed to authenticate token.');
    req.userId = decoded.id;
    next();
  });
}; 

// //Routing
app.get('/', (req, res) => {
  res.send('Your health matters at remote healthcare vault!');
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Registration for patients
app.post('/public/patient/register.html', async (req, res) => {
  const { first_name, last_name, email, password_hash, phone, date_of_birth, gender, address, region, contact, termsAccepted } = req.body;
  if (!termsAccepted) {
    return res.status(400).json({ error: 'You must accept the terms and conditions' });
  }
  // Hash the password
  bcrypt.hash(password, 10, (err, hash) => {
      if (err) return res.status(500).json({ error: err });

      const query = 'INSERT INTO patients (first_name, last_name, email, password_hash, phone, date_of_birth, gender, address, region, contact, termsAccepted ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
      db.query(query, [first_name, last_name, email, password_hash, phone, date_of_birth, gender, address, region, contact, termsAccepted], (err, results) => {
          if (err) {
              if (err.code === 'ER_DUP_ENTRY') {
                  return res.status(400).json({ error: 'Email already in use' });
              }
              return res.status(500).json({ error: err });
          }
          res.status(201).json({ message: 'Patient registered successfully' });
      });
  });
});

// Register Doctor
app.post('/public/doctor/register.html', async (req, res) => {
  const { first_name, last_name, email, password, phone, specialization, schedule, termsAccepted } = req.body;
  if (!termsAccepted) {
    return res.status(400).json({ error: 'You must accept the terms and conditions' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [rows] = await db.query('SELECT * FROM doctors WHERE email = ?', [email]);

    if (rows.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const [result] = await db.query(
      'INSERT INTO doctors (first_name, last_name, email, password, phone, specialization, schedule, termsAccepted) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [first_name, last_name, email, hashedPassword, phone, specialization, JSON.stringify(schedule), termsAccepted]
    );

    res.status(201).json({ message: 'Doctor registered successfully', doctor_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Register Admin
app.post('/public/admin/register.html', async (req, res) => {
  const { first_name, last_name, email, password, phone, username, role, termsAccepted  } = req.body;
  if (!termsAccepted) {
    return res.status(400).json({ error: 'You must accept the terms and conditions' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [rows] = await db.query('SELECT * FROM admin WHERE username = ?', [username]);

    if (rows.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const [result] = await db.query(
      'INSERT INTO admin (first_name, last_name, email, password, phone, username, role, termsAccepted) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [first_name, last_name, email, password, phone, username, role, termsAccepted]
    );

    res.status(201).json({ message: 'Admin registered successfully', admin_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

//Login for patients
app.post('/public/patient/login.html', (req, res) => {
  const { email, password } = req.body;

  const query = 'SELECT * FROM patients WHERE email = ?';
  db.query(query, [email], (err, results) => {
      if (err) return res.status(500).json({ error: err });

      if (results.length === 0) {
          return res.status(401).json({ error: 'Invalid email or password' });
      }

      const user = results[0];

      // Compare password
      bcrypt.compare(password, user.password_hash, (err, isMatch) => {
          if (err) return res.status(500).json({ error: err });

          if (!isMatch) {
              return res.status(401).json({ error: 'Invalid email or password' });
          }

          // Generate token
          const token = jwt.sign(
              { id: user.id, email: user.email },
              process.env.JWT_SECRET,
              { expiresIn: '1h' }
          );

          res.status(200).json({ message: 'Login successful', token });
      });
  });
});

// Login Doctor
app.post('/public/doctor/login.html', async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.query('SELECT * FROM doctors WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(400).json({ error: 'Doctor not found' });
    }

    const doctor = rows[0];
    const match = await bcrypt.compare(password, doctor.password);

    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ doctor_id: doctor.doctor_id }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token, doctor: { id: doctor.doctor_id, name: `${doctor.first_name} ${doctor.last_name}`, specialization: doctor.specialization } });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login Admin
app.post('/public/admin/login.html', async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await db.query('SELECT * FROM admin WHERE username = ?', [username]);

    if (rows.length === 0) {
      return res.status(400).json({ error: 'User not found' });
    }

    const admin = rows[0];
    const match = await bcrypt.compare(password, admin.password);

    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ admin_id: admin.admin_id }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token, admin: { id: admin.admin_id, name: `${admin.first_name} ${admin.last_name}`, email: admin.email } });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});


// Protected Route for patients
app.get('/public/patient', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM patients WHERE patient_id = ?', [req.user.patient_id]);
    res.json({ profile: rows[0] });
    res.send(`Hello User ${req.patient_id}, Welcome to your portal!`);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Protected Route for doctors
app.get('/public/doctor', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM doctors WHERE doctor_id = ?', [req.user.doctor_id]);
    res.json({ profile: rows[0] });
    res.send(`Hello User ${req.doctor_id}, Welcome to your portal!`);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Protected Route for admin
app.get('/public/admin', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM admin WHERE admin_id = ?', [req.user.admin_id]);
    res.json({ profile: rows[0] });
    res.send(`Hello User ${req.admin_id}, Welcome to your portal!`);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});


//Connecting to server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`)
});