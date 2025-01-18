const express = require('express');
const router = express.Router();
const { authenticate, requireKYC } = require('../middleware/authMiddleware');
const { uploadFields, handleUploadError } = require('../middleware/uploadMiddleware');
const { calculateCreditScore, applyForLoan } = require('../controllers/loanController');


router.post('/calculate/:userId', 
  authenticate,
  requireKYC,
  calculateCreditScore
);


router.post('/apply',
  authenticate,
  uploadFields,
  handleUploadError,
  applyForLoan
);

module.exports = router;