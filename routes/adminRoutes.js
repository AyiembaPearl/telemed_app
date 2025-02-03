const express = require('express');
const router = express.Router();
const { verifyToken } = require('../controllers/adminController');
const { getUsers } = require('../controllers/appointmentController');

router.get('/users', verifyToken, getUsers);

module.exports = router;