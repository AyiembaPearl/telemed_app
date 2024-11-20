const express = require('express');
const router = express.Router();
const { verifyToken } = require('../controllers/authController');
const { getUsers } = require('../controllers/adminController');

router.get('/users', verifyToken, getUsers);

module.exports = router;