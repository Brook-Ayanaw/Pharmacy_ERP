const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// 👇 Replace this with your actual MongoDB Atlas connection string
const MONGO_URI = "mongodb+srv://Test:YourPassword@cluster0.vi1c1uw.mongodb.net/pharmacy_erp?retryWrites=true&w=majority&appName=Cluster0";
const PORT = 3000; // You can change this if needed

// Middleware
app.use(express.json());
app.use(cors({ origin: "*" }));

// MongoDB Connection
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// Routes
const testRoute = require('./routes/testing');
const supplierRoute = require('./routes/supplierRoute');
const productRoute = require('./routes/productsRoute');
const userRoute = require('./routes/usersRoute');
const saleRoute = require('./routes/saleRoute');
const roleRoute = require('./routes/rolesRoute');
const entityRoute = require('./routes/entityRoute');
const storeRoute = require('./routes/storeRoute');
const loginRoute = require('./routes/loginRoute');
const binCardRoute = require('./routes/binCardRoute');
const creditCustomerRoute = require('./routes/creditCustomerRoute');
const creditSellRoute = require('./routes/creditSellRoute');

// Apply routes
app.use('/test', testRoute);
app.use('/supplier', supplierRoute);
app.use('/product', productRoute);
app.use('/user', userRoute);
app.use('/sale', saleRoute);
app.use('/role', roleRoute);
app.use('/entity', entityRoute);
app.use('/store', storeRoute);
app.use('/login', loginRoute);
app.use('/binCard', binCardRoute);
app.use('/creditCustomer', creditCustomerRoute);
app.use('/creditSell', creditSellRoute);

// Home route
app.get('/', (req, res) => {
  res.send('🚀 Your Express server is running!');
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
