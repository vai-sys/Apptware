const mongoose = require('mongoose');

const LoanSchema = new mongoose.Schema({
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  loanAmount: {
    type: Number,
    required: true,
    min: 0,

  },
  loanCategory: {
    type: String,
    enum: ['personal', 'business'],
    required: true,
  },
  term: {
    type: Number,
    required: true,
    enum: [12, 24, 36, 48, 60],
  },
  purpose: {
    type: String,
    required: true,
    enum: ['education', 'medical', 'business', 'home improvement', 'other'],
  },
  interestRate: {
    type: Number,
    required: true,
    min: 0,
  },
  panNumber: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(pan) {
        return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan);
      },
      message: 'Invalid PAN number format',
    },
  },
  creditScore: {
    type: Number,
    min: 300,
    max: 850,
  },
  documents: {
    idProof: {
      type: String,
      required: true,
    },
    bankStatement: {
      type: String,
    },
    itr: {
      type: String,
      required: true,
    },
    utilityBill: {
      type: String,
      required: true,
    },
    businessLicense: {
      type: String,
    },
    businessContinuationProof: {
      type: String,
    },
    collateralDescription: {
      type: String,
    },
    collateralValue: {
      type: Number,
    },
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'disbursed'],
    default: 'pending',
  },
  approvalDetails: {
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvalDate: Date,
    comments: String,
  },
  repaymentSchedule: [{
    installmentNumber: Number,
    dueDate: Date,
    amount: Number,
    status: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  }],
  disbursement: {
    date: Date,
    accountNumber: String,
    bankName: String,
    ifscCode: String,
  },
  notifications: [{
    message: String,
    sentAt: Date,
    read: { type: Boolean, default: false },
  }],
  guarantor: {
    name: String,
    contactNumber: String,
    relationship: String,
  },
  auditTrail: [{
    action: String,
    performedBy: String,
    timestamp: Date,
  }],
}, {
  timestamps: true
});

module.exports = mongoose.model('Loan', LoanSchema);
