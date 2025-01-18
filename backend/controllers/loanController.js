const axios = require("axios")
const User = require('../models/User');
const Loan = require('../models/Loan');
const LoanFunding=require("../models/LoanFunding")


const calculatePaymentBehaviorScore = async (userId) => {
  try {
    const loans = await Loan.find({
      applicant: userId,
      status: { $in: ['approved', 'disbursed'] }
    });

    if (loans.length === 0) return 200;

    let totalPayments = 0;
    let onTimePayments = 0;

    loans.forEach(loan => {
      loan.repaymentSchedule.forEach(payment => {
        totalPayments++;
        if (payment.status === 'paid' && new Date(payment.dueDate) >= new Date()) {
          onTimePayments++;
        }
      });
    });

    if (totalPayments === 0) return 200;

    return Math.floor((onTimePayments / totalPayments) * 300);
  } catch (error) {
    throw new Error('Error calculating payment behavior score: ' + error.message);
  }
};

// Helper function to calculate utilization score
const calculateUtilizationScore = (wallet) => {
  try {
    const totalBorrowed = wallet.totalBorrowed || 0;
    const totalPaid = wallet.totalInterestPaid || 0;

    const utilizationRatio = totalPaid / (totalBorrowed || 1);

    if (utilizationRatio >= 0.8) return 200;
    if (utilizationRatio >= 0.6) return 150;
    if (utilizationRatio >= 0.4) return 100;
    if (utilizationRatio >= 0.2) return 50;
    return 0;
  } catch (error) {
    throw new Error('Error calculating utilization score: ' + error.message);
  }
};

// Helper function to calculate profile score
const calculateProfileScore = (user) => {
  try {
    let score = 0;

    if (user.kycVerified) score += 100;

    if (user.contactNumber) score += 20;
    if (user.address.street) score += 20;
    if (user.address.city) score += 20;
    if (user.address.postalCode) score += 20;
    if (user.profileStatus === 'Active') score += 20;

    return score;
  } catch (error) {
    throw new Error('Error calculating profile score: ' + error.message);
  }
};

// Helper function to calculate loan history score
const calculateLoanHistoryScore = async (userId) => {
  try {
    const completedLoans = await Loan.countDocuments({
      applicant: userId,
      status: 'disbursed'
    });

    if (completedLoans >= 3) return 150;
    if (completedLoans === 2) return 100;
    if (completedLoans === 1) return 50;
    return 0;
  } catch (error) {
    throw new Error('Error calculating loan history score: ' + error.message);
  }
};

// Helper function to get credit rating and interest rate
const getCreditRatingAndRate = (finalScore) => {
  let rating, baseInterestRate;

  if (finalScore >= 750) {
    rating = 'Excellent';
    baseInterestRate = 8;
  } else if (finalScore >= 650) {
    rating = 'Good';
    baseInterestRate = 10;
  } else if (finalScore >= 550) {
    rating = 'Fair';
    baseInterestRate = 12;
  } else {
    rating = 'Poor';
    baseInterestRate = 15;
  }

  return { rating, baseInterestRate };
};

// Helper function to generate recommendations
const generateRecommendations = (user, utilizationScore) => {
  const recommendations = [];

  if (!user.kycVerified) {
    recommendations.push('Complete KYC verification to improve credit score');
  }
  if (!user.contactNumber) {
    recommendations.push('Add contact information to improve profile strength');
  }
  if (utilizationScore < 100) {
    recommendations.push('Improve loan repayment ratio to increase credit score');
  }

  return recommendations;
};

// Main controller function to calculate credit score
const calculateCreditScore = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate individual components
    const paymentBehaviorScore = await calculatePaymentBehaviorScore(user._id);
    const utilizationScore = calculateUtilizationScore(user.wallet);
    const profileScore = calculateProfileScore(user);
    const loanHistoryScore = await calculateLoanHistoryScore(user._id);

    // Calculate final score
    const baseScore = 300;
    const additionalScore = Math.floor(
      paymentBehaviorScore + 
      utilizationScore + 
      profileScore + 
      loanHistoryScore
    ) / 850 * 550;

    const finalScore = Math.floor(baseScore + additionalScore);

    // Update credit score in all loans for the user
    await Loan.updateMany(
      { applicant: user._id },
      { creditScore: finalScore }
    );


    const { rating, baseInterestRate } = getCreditRatingAndRate(finalScore);


    const recommendations = generateRecommendations(user, utilizationScore);

    const response = {
      creditScore: finalScore,
      rating,
      baseInterestRate,
      components: {
        paymentBehaviorScore,
        utilizationScore,
        profileScore,
        loanHistoryScore
      },
      maxPossibleScore: 850,
      lastCalculated: new Date(),
      recommendations
    };

    res.json(response);
  } catch (error) {
    console.error('Error calculating credit score:', error);
    res.status(500).json({ 
      error: 'Error calculating credit score',
      details: error.message 
    });
  }
};




const applyForLoan = async (req, res) => {
  try {
    const {
      loanAmount,
      loanCategory,
      term,
      purpose,
      panNumber,
      guarantor,
      disbursement
    } = req.body;
    
   
    const documents = {};
    if (req.files) {
      Object.keys(req.files).forEach(key => {
        documents[key] = req.files[key][0].path;
      });
    }

    let interestRate = 0;
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      const paymentBehaviorScore = await calculatePaymentBehaviorScore(user._id);
      const utilizationScore = calculateUtilizationScore(user.wallet);
      const profileScore = calculateProfileScore(user);
      const loanHistoryScore = await calculateLoanHistoryScore(user._id);
  
   
      const baseScore = 300;
      const additionalScore = Math.floor(
        paymentBehaviorScore + 
        utilizationScore + 
        profileScore + 
        loanHistoryScore
      ) / 850 * 550;
  
      const finalScore = Math.floor(baseScore + additionalScore);
 
      await Loan.updateMany(
        { applicant: user._id },
        { creditScore: finalScore }
      );
  
    
      const { rating, baseInterestRate } = getCreditRatingAndRate(finalScore);
  
     
      const recommendations = generateRecommendations(user, utilizationScore);
   
      interestRate = baseInterestRate
    }
    catch(err)
    {
      console.log(err);
    }
   
    const loan = new Loan({
      applicant: req.user._id, 
      loanAmount,
      loanCategory,
      term,
      purpose,
      panNumber,
      documents,
      guarantor,
      interestRate,
      disbursement: {
        accountNumber: disbursement.accountNumber,
        bankName: disbursement.bankName,
        ifscCode: disbursement.ifscCode
      },
      auditTrail: [{
        action: 'Loan Application Created',
        performedBy: req.user._id,
        timestamp: new Date()
      }]
    });

    await loan.save();

   
    loan.notifications.push({
      message: 'Loan application submitted successfully',
      sentAt: new Date()
    });

    await loan.save();
    
    res.status(201).json({
      success: true,
      message: 'Loan application submitted successfully',
      data: loan
    });
    

  } catch (error) {
    console.error('Error in loan application:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing loan application',
      error: error.message
    });
  }
};

const getLoan = async (req, res) => {
  try {
  
    const data = await Loan.find();


    console.log(data);


    res.status(200).json({
      success: true,
      message: "Loans retrieved successfully",
      data: data,
    });
  } catch (err) {

    console.error("Error fetching loans:", err);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve loans",
      error: err.message,
    });
  }
};



const getPendingLoans = async (req, res) => {
  try {
    const pendingLoans = await Loan.find({ status: 'pending' }).populate('applicant', 'name email'); 
    res.status(200).json(pendingLoans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// const reviewLoan = async (req, res) => {
//   const { loanId } = req.params;
//   const { status, remark, approvedBy } = req.body;

//   try {
  
//     if (!['approved', 'rejected'].includes(status)) {
//       return res.status(400).json({ error: 'Invalid status. Must be "approved" or "rejected".' });
//     }

  
//     if (status === 'rejected' && (!remark || remark.trim() === '')) {
//       return res.status(400).json({ error: 'Remark is required when rejecting a loan.' });
//     }

//     const loan = await Loan.findById(loanId);
//     if (!loan) {
//       return res.status(404).json({ error: 'Loan not found.' });
//     }

  
//     loan.status = status;
//     loan.approvalDetails = {
//       approvedBy,
//       approvalDate: new Date(),
//       comments: remark || '', 
//     };

//     await loan.save();

//     res.status(200).json({
//       message: `Loan proposal has been ${status}.`,
//       loan,
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };




const reviewLoan = async (req, res) => {
  const { loanId } = req.params;
  const { status, remark, approvedBy } = req.body;

  try {
    // Validate the status input
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be "approved" or "rejected".' });
    }

    if (status === 'rejected' && (!remark || remark.trim() === '')) {
      return res.status(400).json({ error: 'Remark is required when rejecting a loan.' });
    }

  
    const loan = await Loan.findById(loanId);
    if (!loan) {
      return res.status(404).json({ error: 'Loan not found.' });
    }

   
    loan.status = status;
    loan.approvalDetails = {
      approvedBy,
      approvalDate: new Date(),
      comments: remark || '',
    };

    await loan.save();

   
    if (status === 'approved') {
      const fundingDeadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); 
      const loanFunding = new LoanFunding({
        loanId: loan._id, 
        interestRate: loan.interestRate, 
        totalAmountNeeded: loan.loanAmount, 
        fundingDeadline, 
        totalAmountAllocated: 0,
        status: 'open', 
        statusHistory: [
          { status: 'open', updatedAt: new Date() },
        ],
        notifications: [
          {
            message: `A new loan funding opportunity is available: Loan ID ${loan._id}`,
          },
        ],
        auditTrail: [
          {
            action: 'Loan approved and funding process initiated',
            performedBy: approvedBy,
            timestamp: new Date(),
          },
        ],
      });

      await loanFunding.save();
    }

 
    res.status(200).json({
      message: `Loan proposal has been ${status}.`,
      loan,
    });
  } catch (error) {

    res.status(500).json({ error: error.message });
  }
};






module.exports = {
  calculateCreditScore,applyForLoan,getLoan,getPendingLoans,reviewLoan
};





