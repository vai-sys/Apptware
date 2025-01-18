const mongoose = require('mongoose');

const LoanFundingSchema = new mongoose.Schema({
  loanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Loan',
    required: true,
    unique: true,
  },
  interestRate: {
    type: Number,
    required: true,
    min: 0,
  },
  totalAmountNeeded: {
    type: Number,
    required: true,
    min: 0,
  },
  totalAmountAllocated: {
    type: Number,
    required: true,
    default: 0,
  },
  investors: [
    {
      investorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      amountInvested: { type: Number, required: true, min: 0 },
      investedAt: { type: Date, default: Date.now },
      percentageContribution: { type: Number, min: 0, max: 100 },
    },
  ],
  investmentReturns: [
    {
      investorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      expectedReturn: { type: Number, required: true, min: 0 },
      returnDueDate: { type: Date, required: true },
      isSettled: { type: Boolean, default: false },
    },
  ],
  fundingDeadline: {
    type: Date,
    required: true,
  },
  fundingProgress: {
    type: Number,
    default: function () {
      return (this.totalAmountAllocated / this.totalAmountNeeded) * 100;
    },
  },
  status: {
    type: String,
    enum: ['open', 'fully-funded', 'closed'],
    default: 'open',
  },
  statusHistory: [
    {
      status: { type: String, enum: ['open', 'fully-funded', 'closed'], required: true },
      updatedAt: { type: Date, default: Date.now },
    },
  ],
  notifications: [
    {
      investorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      message: { type: String, required: true },
      sentAt: { type: Date, default: Date.now },
      read: { type: Boolean, default: false },
    },
  ],
  auditTrail: [
    {
      action: { type: String, required: true },
      performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      timestamp: { type: Date, default: Date.now },
    },
  ]


}, { timestamps: true });

module.exports = mongoose.model('LoanFunding', LoanFundingSchema);
