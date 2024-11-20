const express = require('express');
const router = express.Router();
const { registerPatient, viewProfile } = require('../controllers/patientController');
const { verifyToken } = require('../controllers/authController');

router.post('/register', registerPatient);
router.get('/profile', verifyToken, viewProfile);

module.exports = router;