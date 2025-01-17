const express = require('express');
const router = express.Router();
const { VerifyKYC, getKYCStatus } = require('../controllers/kycController');
const { authenticate, authorize, requireKYC } = require('../middleware/authMiddleware');


router.post('/verify', authenticate, VerifyKYC); 
router.get('/status/:userId', authenticate, requireKYC, getKYCStatus); 

module.exports = router;
