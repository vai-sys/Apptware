const express = require('express');
const router = express.Router();
const { submitKYC, verifyKYC, getKYCStatus } = require('../controllers/kycController');
const { authenticate, authorize, requireKYC } = require('../middleware/authMiddleware');


router.post('/submit', authenticate, submitKYC);
router.post('/verify', authenticate, authorize(['Admin']), verifyKYC); 
router.get('/status/:userId', authenticate, requireKYC, getKYCStatus); 

module.exports = router;
