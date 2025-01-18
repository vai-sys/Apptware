const express = require('express');
const router = express.Router();
const { authenticate, requireKYC } = require('../middleware/authMiddleware');
const { uploadFields, handleUploadError } = require('../middleware/uploadMiddleware');
const { calculateCreditScore, applyForLoan,getLoan,getPendingLoans,reviewLoan } = require('../controllers/loanController');


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
router.get('/pending-loans',authenticate,getPendingLoans);
router.post('/review/:loanId',authenticate,reviewLoan)




module.exports = router;