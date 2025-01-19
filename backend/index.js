const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const authRoute = require('./routes/authRoute');
const kycRoute=require('./routes/kycRoute')
const loanRoute=require('./routes/loanRoute')
const loanFundingRoute=require("./routes/loanFundingRoute");

const walletRoute=require("./routes/walletRoute");



const portfolioRoute=require('./routes/portFolio')

const userRoutes = require('./routes/userRoutes');

const app = express();
connectDB();

const corsOptions = {
  origin: 'http://localhost:5173',  
  credentials: true,              
};
app.use(cors(corsOptions));
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.use('/api/auth', authRoute);
app.use('/api/kyc',kycRoute);
app.use('/api/loan',loanRoute)
app.use('/api/investor',loanFundingRoute);
app.use('/api/wallet',walletRoute);

app.use('/api',portfolioRoute)

app.use('/api', userRoutes);

app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
  res.status(200).send('API is running...');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
