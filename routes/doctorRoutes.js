const express = require('express');
const router = express.Router();
const { verifyToken } = require('../controllers/adminController');
const { viewSchedule } = require('../controllers/doctorController');

router.get('/schedule', verifyToken, viewSchedule);

module.exports = router;