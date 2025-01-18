
const Loan=require("../models/Loan");
const LoanFunding=require("../models/LoanFunding");


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
  




  const contributeToLoan = async (req, res) => {
    const { loanId } = req.params;
    const { investorId, amount } = req.body;
  
    try {
      const loanFunding = await LoanFunding.findOne({ loanId });
  
      if (!loanFunding) {
        return res.status(404).json({ message: 'Loan not found for funding.' });
      }
  
      if (loanFunding.status !== 'open') {
        return res.status(400).json({ message: 'Loan is not open for funding.' });
      }
  
      if (loanFunding.totalAmountAllocated + amount > loanFunding.totalAmountNeeded) {
        return res.status(400).json({ message: 'Funding amount exceeds required goal.' });
      }
  

      loanFunding.totalAmountAllocated += amount;
      loanFunding.investors.push({
        investorId,
        amountInvested: amount,
        percentageContribution: (amount / loanFunding.totalAmountNeeded) * 100,
      });
  
   
      if (loanFunding.totalAmountAllocated === loanFunding.totalAmountNeeded) {
        loanFunding.status = 'fully-funded';
      }
  
      await loanFunding.save();
      res.status(200).json({ message: 'Investment successful', loanFunding });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  

  

module.exports= {getOpenLoansForInvestors,contributeToLoan}
  
 
  