const User = require('../models/User');

const submitKYC = async (req, res) => {
    const { userId, firstName, lastName, dateOfBirth, gender } = req.body;
  
    if (!userId || !firstName || !lastName || !dateOfBirth || !gender ) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields for KYC submission',
      });
    }
  
    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }
  
     
      user.kycVerified = false;
      user.profileStatus = 'Pending'; 
      user.rejectionReason = null;
  
      await user.save();
  
      return res.status(201).json({
        success: true,
        message: 'KYC submitted successfully',
        data: {
          userId,
          firstName,
          lastName,
          dateOfBirth,
          gender,
          verificationStatus: 'Pending',
          profileStatus: user.profileStatus, 
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error submitting KYC',
        error: error.message,
      });
    }
  };

  




const verifyKYC = async (req, res) => {
  const { userId, verificationStatus, rejectionReason } = req.body;

  if (!userId || !verificationStatus) {
    return res.status(400).json({
      success: false,
      message: 'User ID and verification status are required',
    });
  }

  if (verificationStatus === 'Rejected' && !rejectionReason) {
    return res.status(400).json({
      success: false,
      message: 'Rejection reason is required for rejected KYC',
    });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.kycVerified = verificationStatus === 'Verified';
    user.profileStatus = verificationStatus === 'Verified' ? 'Active' : 'Suspended'; 
    user.rejectionReason = verificationStatus === 'Rejected' ? rejectionReason : null;

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'KYC verification updated successfully',
      data: {
        userId,
        verificationStatus,
        rejectionReason: verificationStatus === 'Rejected' ? rejectionReason : null,
        verificationDate: new Date(),
        profileStatus: user.profileStatus, 
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error verifying KYC',
      error: error.message,
    });
  }
};

const getKYCStatus = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: 'User ID is required',
    });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const kycStatus = {
      verificationStatus: user.kycVerified ? 'Verified' : 'Pending',
      rejectionReason: user.rejectionReason || null,
    };

    return res.status(200).json({
      success: true,
      message: 'Fetched KYC status',
      data: {
        userId,
        ...kycStatus,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching KYC status',
      error: error.message,
    });
  }
};

module.exports = {
  submitKYC,
  verifyKYC,
  getKYCStatus,
};
