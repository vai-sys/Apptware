// const express = require('express');
// const mongoose = require('mongoose');
// const User = require('../models/User');
// const Loan = require('../models/Loan');
// const LoanFunding = require('../models/LoanFunding');

// const router = express.Router();

// router.get('/:userId/portfolio', async (req, res) => {
//   try {
//     const userId = req.params.userId;

  
//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//       return res.status(400).json({ message: 'Invalid user ID' });
//     }


//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }


//     const totalInvestment = await LoanFunding.aggregate([
//       { $unwind: '$investors' },
//       { $match: { 'investors.investorId': new mongoose.Types.ObjectId(userId) } },
//       {
//         $group: {
//           _id: null,
//           totalInvestment: { $sum: '$investors.amountInvested' },
//         },
//       },
//     ]);

//     // Calculate total returns earned by the user
//     const totalReturns = await LoanFunding.aggregate([
//       { $unwind: '$investmentReturns' },
//       { $match: { 'investmentReturns.investorId': new mongoose.Types.ObjectId(userId) } },
//       {
//         $group: {
//           _id: null,
//           totalReturns: { $sum: '$investmentReturns.expectedReturn' },
//         },
//       },
//     ]);

//     // Fetch active loans for the user
//     const activeLoans = await Loan.find({
//       $or: [
//         { applicant: new mongoose.Types.ObjectId(userId), status: { $in: ['pending', 'approved'] } },
//         { 'loanFunding.investors.investorId': new mongoose.Types.ObjectId(userId), status: { $in: ['pending', 'approved'] } },
//       ],
//     });

//     // Calculate average interest rate for all loans of the user
//     const averageInterestRate = await Loan.aggregate([
//       { $match: { applicant: new mongoose.Types.ObjectId(userId) } },
//       {
//         $group: {
//           _id: null,
//           avgInterestRate: { $avg: '$interestRate' },
//         },
//       },
//     ]);

//     // Fetch all loan proposals (user can be an applicant or investor)
//     const loanProposals = await Loan.find({
//       $or: [
//         { applicant: new mongoose.Types.ObjectId(userId) },
//         { 'loanFunding.investors.investorId': new mongoose.Types.ObjectId(userId) },
//       ],
//     });

//     // Construct response
//     const response = {
//       totalInvestment: totalInvestment.length ? totalInvestment[0].totalInvestment : 0,
//       totalReturns: totalReturns.length ? totalReturns[0].totalReturns : 0,
//       activeLoans: activeLoans,
//       avgInterestRate: averageInterestRate.length ? averageInterestRate[0].avgInterestRate : 0,
//       loanProposals: loanProposals,
//     };

//     return res.json(response);
//   } catch (error) {
//     console.error('Error getting user investment stats:', error);
//     return res.status(500).json({ message: 'Internal Server Error' });
//   }
// });

// module.exports = router;



const express = require('express');
const mongoose = require('mongoose');
const Loan = require('../models/Loan');
const LoanFunding = require('../models/LoanFunding');
const User = require('../models/User');

const router = express.Router();

// API to fetch user statistics and loan details
router.get('/:userId/portfolio', async (req, res) => {
  try {
    const userId = req.params.userId;

    // Fetch user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Fetch all loans created by the user
    const loans = await Loan.find({ applicant: userId });

    // Fetch all investments made by the user
    const investments = await LoanFunding.find({
      'investors.investorId': userId,
    });

    // Calculate total investment and total returns earned
    let totalInvestment = 0;
    let totalReturnsEarned = 0;
    let totalAmountAllocated = 0;
    investments.forEach((investment) => {
      investment.investors.forEach((inv) => {
        if (inv.investorId.toString() === userId) {
          totalInvestment += inv.amountInvested;
          totalAmountAllocated += investment.totalAmountAllocated;
        }
      });

      investment.investmentReturns.forEach((ret) => {
        if (ret.investorId.toString() === userId && ret.isSettled) {
          totalReturnsEarned += ret.expectedReturn;
        }
      });
    });

    // Calculate average interest rate for loans funded by the user
    const avgInterestRate =
      investments.length > 0
        ?
          investments.reduce((sum, investment) => sum + investment.interestRate, 0) /
          investments.length
        : 0;

    // Get active loans of the user (status = approved or disbursed)
    const activeLoans = loans.filter(
      (loan) => loan.status === 'approved' || loan.status === 'disbursed'
    );

    // Prepare loan details with proposals
    const loanDetails = await Promise.all(
      loans.map(async (loan) => {
        const funding = await LoanFunding.findOne({ loanId: loan._id });
        return {
          loanId: loan._id,
          loanAmount: loan.loanAmount,
          term: loan.term,
          interestRate: loan.interestRate,
          totalAmountAllocated: funding ? funding.totalAmountAllocated : 0,
          status: loan.status,
          purpose: loan.purpose,
        };
      })
    );

    res.json({
      user: {
        name: user.name,
        email: user.email,
      },
      stats: {
        totalInvestment,
        totalReturnsEarned,
        avgInterestRate,
        totalAmountAllocated,
      },
      activeLoans,
      loanDetails,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

