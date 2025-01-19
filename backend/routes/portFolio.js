const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User'); 
const Loan = require('../models/Loan'); 
const LoanFunding = require('../models/LoanFunding'); 
const { ObjectId } = mongoose.Types; // Importing ObjectId from mongoose.Types

const router = express.Router();

router.get('/:userId/portfolio', async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate total investment by the user
    const totalInvestment = await LoanFunding.aggregate([
      { $unwind: '$investors' },
      { $match: { 'investors.investorId': new mongoose.Types.ObjectId(userId) } }, // Corrected here
      {
        $group: {
          _id: null,
          totalInvestment: { $sum: '$investors.amountInvested' },
        },
      },
    ]);

    // Calculate total returns earned by the user
    const totalReturns = await LoanFunding.aggregate([
      { $unwind: '$investmentReturns' },
      { $match: { 'investmentReturns.investorId': new mongoose.Types.ObjectId(userId) } }, // Corrected here
      {
        $group: {
          _id: null,
          totalReturns: { $sum: '$investmentReturns.expectedReturn' },
        },
      },
    ]);

    // Fetch active loans for the user (those the user has applied for or funded)
    const activeLoans = await Loan.find({
      $or: [
        { applicant: new mongoose.Types.ObjectId(userId), status: { $in: ['pending', 'approved'] } }, // Corrected here
        { 'loanFunding.investors.investorId': new mongoose.Types.ObjectId(userId), status: { $in: ['pending', 'approved'] } }, // Corrected here
      ],
    });

    // Calculate average interest rate for all loans of the user
    const averageInterestRate = await Loan.aggregate([
      { $match: { applicant: new mongoose.Types.ObjectId(userId) } }, // Corrected here
      {
        $group: {
          _id: null,
          avgInterestRate: { $avg: '$interestRate' },
        },
      },
    ]);

    // Fetch all loan proposals (user can be an applicant or investor)
    const loanProposals = await Loan.find({
      $or: [
        { applicant: new mongoose.Types.ObjectId(userId) }, // Corrected here
        { 'loanFunding.investors.investorId': new mongoose.Types.ObjectId(userId) }, // Corrected here
      ],
    });

    // Construct response
    const response = {
      totalInvestment: totalInvestment.length ? totalInvestment[0].totalInvestment : 0,
      totalReturns: totalReturns.length ? totalReturns[0].totalReturns : 0,
      activeLoans: activeLoans,
      avgInterestRate: averageInterestRate.length ? averageInterestRate[0].avgInterestRate : 0,
      loanProposals: loanProposals,
    };

    return res.json(response);
  } catch (error) {
    console.error('Error getting user investment stats:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
