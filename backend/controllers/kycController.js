const User = require('../models/User');
const VerifyKYC = async (req, res) => {
    const {
      userId,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      verificationStatus,
      rejectionReason,
    } = req.body;
  
    if (!userId || !firstName || !lastName || !dateOfBirth || !gender || !verificationStatus) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields for KYC submission or verification',
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
  
      if (verificationStatus === 'Rejected') {
        user.rejectionReason = rejectionReason || 'Reason not provided';
      } else {
        user.rejectionReason = null;
      }
  
      user.updatedAt = new Date();
  
      await user.save();
  
      return res.status(200).json({
        success: true,
        message: `KYC ${verificationStatus.toLowerCase()} successfully`,
        data: {
          userId,
          firstName,
          lastName,
          dateOfBirth,
          gender,
          verificationStatus,
          rejectionReason: user.rejectionReason,
          profileStatus: user.profileStatus,
          verificationDate: new Date(),
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error processing KYC',
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

    VerifyKYC,
  getKYCStatus,
};
