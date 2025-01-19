const express = require('express');
const router = express.Router();
const { authenticate, requireKYC } = require('../middleware/authMiddleware');
// const {getOpenLoansForInvestors}=require('../controllers/loanFundingControllers')
const { poolFunds, getOpenLoansForInvestors } = require('../controllers/loanFundingControllers');


router.post('/fund-loan', async (req, res) => {
    
  const { loanId, investorId, amount } = req.body;

  try {
    const result = await poolFunds(loanId, investorId, amount);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});



router.get('/open-loans',authenticate,requireKYC, getOpenLoansForInvestors);

module.exports=router;
