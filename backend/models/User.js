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
      totalInvested: { type: Number, default: 0 }, // Total invested amount
      totalBorrowed: { type: Number, default: 0 }, // Total borrowed amount
      totalInterestEarned: { type: Number, default: 0 }, // Interest earned from investments
      totalInterestPaid: { type: Number, default: 0 }, // Interest paid on loans
      lastTransactionDate: { type: Date },
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