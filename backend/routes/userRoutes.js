const express = require('express');
const router = express.Router();
const { getAllUsers } = require('../controllers/userControllers');

// Route to fetch all users
router.get('/users', getAllUsers);

module.exports = router;
