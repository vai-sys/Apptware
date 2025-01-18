const express = require('express');
const router = express.Router();
const { authenticate, requireKYC } = require('../middleware/authMiddleware');
const { uploadFields, handleUploadError } = require('../middleware/uploadMiddleware');
const { calculateCreditScore, applyForLoan,getLoan } = require('../controllers/loanController');


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

router.get('/get-loan',authenticate,getLoan);

module.exports = router;