// server.js
const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const hpp = require('hpp');




// Route files
const auth = require('./routes/auth');
const transactions = require('./routes/transactions');
const categories = require('./routes/categories');
const budgets = require('./routes/budgets');


require('dotenv').config();
// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

const app = express();

// Body parser
app.use(express.json());

// Set security headers
app.use(helmet());

// Prevent http param pollution
app.use(hpp());

// Enable CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Mount routers
app.use('/api/auth', auth);
app.use('/api/transactions', transactions);
app.use('/api/categories', categories);
app.use('/api/budgets', budgets);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});