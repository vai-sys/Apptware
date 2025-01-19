
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    roles: {
      type: [String],
      enum: ['Borrower', 'Investor', 'Admin'], 
      required: true,
      default: ['Borrower'], 
    },
    kycVerified: {
      type: Boolean,
      default: false, 
    },
    profileStatus: {
      type: String,
      enum: ['Pending', 'Active', 'Suspended'],
      default: 'Pending', 
    },
    wallet: {
      balance: { type: Number, default: 0 }, 
      totalInvested: { type: Number, default: 0 }, 
      totalBorrowed: { type: Number, default: 0 }, 
      totalInterestEarned: { type: Number, default: 0 },
      totalInterestPaid: { type: Number, default: 0 },
      lastTransactionDate: { type: Date },
      transactions: [
        {
          transactionId: {
            type: mongoose.Schema.Types.ObjectId,
            default: () => new mongoose.Types.ObjectId(), // Generates unique ObjectId for each transaction
          },
          
          type: { type: String, enum: ['loan_disbursement','deposit', 'withdrawal', 'loan_funding', 'loan_repayment', 'interest_payment', 'fee'], required: true },
          amount: { type: Number, required: true },
          balanceAfterTransaction: { type: Number }, 
          userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
          date: { type: Date, default: Date.now },
        }
      ],
    },
    
    contactNumber: {
      type: String,
      required: false,
      match: /^[0-9]{10}$/,
    },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      postalCode: { type: String },
      country: { type: String },
    },
    rejectionReason: {
      type: String,
      required: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {   
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

module.exports = User;



