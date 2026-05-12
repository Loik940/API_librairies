const mongoose = require('mongoose');


const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB est bien connecte');
  } catch (error) {
    console.error('Il y a une erreur:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
