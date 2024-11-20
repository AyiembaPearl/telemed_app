const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const sequelize = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const patientRoutes = require('./routes/patientRoutes');
const doctorRoutes = require('./routes/doctorRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/doctor', doctorRoutes);

// MySQL Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'telemed_db',
});

db.connect(err => {
  if (err) throw err;
  console.log('Connected to MySQL');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});



// //Importing dependecies
// const express = require('express');
// const bcrypt = require('bcrypt');
// const mysql = require('mysql2');
// const bodyParser = require('body-parser');
// const cors = require('cors');
// const dotenv = require('dotenv');
// const jwt = require('jsonwebtoken');
// // const sequelize = require('./config/db');
// const path = require('path');
// // const app = require('./public/app')

// dotenv.config();
// const app = express();

// const db = mysql.createConnection({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME
// });

// //handle db connection errors
// db.connect((err) => {
//   if (err) {
//     console.error('Database connection failed.', err.stack);
//     return;
//   }
//   console.log('Connected to database');
// });

// app.use(cors({
//   origin: 'http://localhost:5000',
//   credentials: true
// }));
// app.use(bodyParser.json());
// app.use(express.static(path.join(__dirname, 'public')));

// // //JWT Middleware for protected routes
// const verifyToken = (req, res, next) => {
//   const token = req.headers['authorization'];
//   if (!token) return res.status(403).send('No token provided.');

//   const tokenParts = token.split(' ');
//   if (tokenParts[0] !== 'Bearer' || !tokenParts[1]) {
//     return res.status(403).send('Invalid token format');
//   }

//   jwt.verify(tokenParts[1], process.env.JWT_SECRET, (err, decoded) => {
//     if (err) return res.status(500).send('Failed to authenticate token.');
//     req.userId = decoded.id;
//     next();
//   });
// }; 
// // module.exports = verifyToken;

// //Syncing to database
// // sequelize.sync()
// //   .then(() => console.log('Database synced successfully'))
// //   .catch(err => console.log('Database sync error:', err));

// // //Routing
// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });

// // Registration for patients
// app.post('/api/patients/register', async (req, res) => {
//   const { first_name, last_name, email, password_hash, phone, date_of_birth, gender, address, region, contact, termsAccepted } = req.body;
//   if (!termsAccepted) {
//     return res.status(400).json({ error: 'You must accept the terms and conditions' });
//   }
//   // Hash the password
//   bcrypt.hash(password, 10, (err, hash) => {
//       if (err) return res.status(500).json({ error: err });

//       const query = 'INSERT INTO patients (first_name, last_name, email, password_hash, phone, date_of_birth, gender, address, region, contact, termsAccepted ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
//       db.query(query, [first_name, last_name, email, password_hash, phone, date_of_birth, gender, address, region, contact, termsAccepted], (err, results) => {
//           if (err) {
//               if (err.code === 'ER_DUP_ENTRY') {
//                   return res.status(400).json({ error: 'Email already in use' });
//               }
//               return res.status(500).json({ error: err });
//           }
//           res.status(201).json({ message: 'User registered successfully' });
//       });
//   });
// });

// // Register Doctor
// app.post('/api/doctors/register', async (req, res) => {
//   const { first_name, last_name, specialization, email, phone, schedule, password } = req.body;

//   try {
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const [rows] = await db.query('SELECT * FROM doctors WHERE email = ?', [email]);

//     if (rows.length > 0) {
//       return res.status(400).json({ error: 'Email already exists' });
//     }

//     const [result] = await db.query(
//       'INSERT INTO doctors (first_name, last_name, specialization, email, phone, schedule, password) VALUES (?, ?, ?, ?, ?, ?, ?)',
//       [first_name, last_name, specialization, email, phone, JSON.stringify(schedule), hashedPassword]
//     );

//     res.status(201).json({ message: 'Doctor registered successfully', doctor_id: result.insertId });
//   } catch (err) {
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// //Login for patients
// app.post('/login', (req, res) => {
//   const { email, password } = req.body;

//   const query = 'SELECT * FROM patients WHERE email = ?';
//   db.query(query, [email], (err, results) => {
//       if (err) return res.status(500).json({ error: err });

//       if (results.length === 0) {
//           return res.status(401).json({ error: 'Invalid email or password' });
//       }

//       const user = results[0];

//       // Compare password
//       bcrypt.compare(password, user.password_hash, (err, isMatch) => {
//           if (err) return res.status(500).json({ error: err });

//           if (!isMatch) {
//               return res.status(401).json({ error: 'Invalid email or password' });
//           }

//           // Generate token
//           const token = jwt.sign(
//               { id: user.id, email: user.email },
//               process.env.JWT_SECRET,
//               { expiresIn: '1h' }
//           );

//           res.status(200).json({ message: 'Login successful', token });
//       });
//   });
// });

// // Login Doctor
// app.post('/doctors', async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const [rows] = await db.query('SELECT * FROM doctors WHERE email = ?', [email]);

//     if (rows.length === 0) {
//       return res.status(400).json({ error: 'Doctor not found' });
//     }

//     const doctor = rows[0];
//     const match = await bcrypt.compare(password, doctor.password);

//     if (!match) {
//       return res.status(401).json({ error: 'Invalid credentials' });
//     }

//     const token = jwt.sign({ doctor_id: doctor.doctor_id }, SECRET_KEY, { expiresIn: '1h' });
//     res.json({ token, doctor: { id: doctor.doctor_id, name: `${doctor.first_name} ${doctor.last_name}`, specialization: doctor.specialization } });
//   } catch (err) {
//     res.status(500).json({ error: 'Server error' });
//   }
// });


// // Protected Route for patients
// app.get('/patient', verifyToken, async (req, res) => {
//   try {
//     const [rows] = await db.query('SELECT * FROM patients WHERE patient_id = ?', [req.user.patient_id]);
//     res.json({ profile: rows[0] });
//     res.send(`Hello User ${req.patient_id}, Welcome to your dashboard!`);
//   } catch (err) {
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // Protected Route for doctors
// app.get('/doctor', verifyToken, async (req, res) => {
//   try {
//     const [rows] = await db.query('SELECT * FROM doctors WHERE doctor_id = ?', [req.user.doctor_id]);
//     res.json({ profile: rows[0] });
//     res.send(`Hello User ${req.doctor_id}, Welcome to your dashboard!`);
//   } catch (err) {
//     res.status(500).json({ error: 'Server error' });
//   }
// });


// //Connecting to server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on port http://localhost:${PORT}`)
// });