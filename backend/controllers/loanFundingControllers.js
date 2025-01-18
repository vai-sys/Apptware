const Loan = require('../models/Loan');
const LoanFunding = require('../models/LoanFunding');
const User = require('../models/User');


const getOpenLoansForInvestors = async (req, res) => {
    try {
      const openLoans = await LoanFunding.find({ status: 'open' })
        .populate({
          path: 'loanId',
          match: { status: 'approved' }, 
          select: 'applicant loanAmount purpose term interestRate',
        })
        .exec();
  

      const filteredLoans = openLoans.filter((loanFunding) => loanFunding.loanId !== null);
  
      res.status(200).json(filteredLoans);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  

  
  async function poolFunds(loanId, investorId, amount) {
    const session = await mongoose.startSession();
    session.startTransaction();
  
    try {
      
      const loan = await Loan.findById(loanId).session(session);
      if (!loan || loan.status !== 'approved') {
        throw new Error('Loan is not approved or does not exist.');
      }
  
  
      const loanFunding = await LoanFunding.findOne({ loanId }).session(session);
      if (!loanFunding) {
        throw new Error('Loan funding record not found.');
      }
      if (loanFunding.status === 'fully-funded') {
        throw new Error('Loan is already fully funded.');
      }
  
    
      const investor = await User.findById(investorId).session(session);
      if (!investor || investor.wallet.balance < amount) {
        throw new Error('Investor does not have sufficient balance.');
      }
  
 
      investor.wallet.balance -= amount;
      investor.wallet.totalInvested += amount;
      investor.wallet.transactions.push({
        type: 'loan_funding',
        amount,
        balanceAfterTransaction: investor.wallet.balance,
        userId: investorId,
      });
      await investor.save({ session });
  
      
      const borrower = await User.findById(loan.applicant).session(session);
      if (!borrower) {
        throw new Error('Borrower does not exist.');
      }
  
      borrower.wallet.balance += amount;
      borrower.wallet.totalBorrowed += amount;
      borrower.wallet.transactions.push({
        type: 'loan_disbursement',
        amount,
        balanceAfterTransaction: borrower.wallet.balance,
        userId: investorId,
      });
      await borrower.save({ session });
  
  
      loanFunding.totalAmountAllocated += amount;
      loanFunding.investors.push({
        investorId,
        amountInvested: amount,
        percentageContribution: (amount / loanFunding.totalAmountNeeded) * 100,
      });
  
      if (loanFunding.totalAmountAllocated >= loanFunding.totalAmountNeeded) {
        loanFunding.status = 'fully-funded';
        loan.status = 'disbursed';
        loan.disbursement = {
          date: new Date(),
        };
        await loan.save({ session });
      }
  
      await loanFunding.save({ session });
  
  
      await session.commitTransaction();
      session.endSession();
  
      return {
        success: true,
        message: 'Funds pooled successfully.',
        loanFunding,
      };
    } catch (error) {
  
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }
  

  
  

module.exports= {getOpenLoansForInvestors,poolFunds}
  
 
  