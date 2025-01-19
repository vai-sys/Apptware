const User = require('../models/User'); // Ensure the correct path to your User model

// Controller to fetch all users
const getAllUsers = async (req, res) => {
  try {
    // Fetch all users from the database
    const users = await User.find();

    // Respond with the list of users
    res.status(200).json({
      success: true,
      message: 'Users fetched successfully.',
      data: users,
    });
  } catch (error) {
    // Handle any errors
    console.error('Error fetching users:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users.',
      error: error.message,
    });
  }
};

module.exports = {
  getAllUsers,
};
