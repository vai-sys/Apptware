const express = require('express');
const router = express.Router();
const { authenticate, requireKYC } = require('../middleware/authMiddleware');
const {getOpenLoansForInvestors}=require('../controllers/loanFundingControllers')
const {contributeToLoan} =require("../controllers/loanFundingControllers")


router.get('/open-loans',authenticate,requireKYC, getOpenLoansForInvestors);
// router.post('/:loanId/invest',authenticate,requireKYC, contributeToLoan);

module.exports=router;
