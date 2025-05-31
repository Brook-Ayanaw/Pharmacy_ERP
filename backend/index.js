const express = require('express');
const mongoose = require('mongoose');
const app = express();
const PORT = 3000;
const cors  = require('cors');
//routes
const testRoute = require('./routes/testing')
const supplierRoute = require('./routes/supplierRoute')
const productRoute = require('./routes/productsRoute')
const userRoute = require('./routes/usersRoute')
const saleRoute = require('./routes/saleRoute')
const roleRoute = require('./routes/rolesRoute')
const entityRoute = require('./routes/entityRoute')
const storeRoute = require('./routes/storeRoute')
const loginRoute = require('./routes/loginRoute')
const binCardRoute = require('./routes/binCardRoute')
const creditCustomerRoute = require('./routes/creditCustomerRoute')
const creditSellRoute = require('./routes/creditSellRoute')
// Middleware to parse JSON
app.use(express.json());
app.use(cors({ origin: "*" })); // Allow requests from any frontend
//Connect to MongoDB
if (mongoose.connection.readyState === 0) { 
    mongoose.connect('mongodb://127.0.0.1:27017/pharmacyERPNew', {
        serverSelectionTimeoutMS: 5000
    })
    .then(() => console.log('Connected to MongoDB ✅'))
    .catch((err) => console.error('❌ Could not connect to MongoDB', err));
} else {
    console.log("⚡️ Already connected to MongoDB.");
}

// Basic route
app.get('/', (req, res) => {
    res.send('Welcome to your Express server!');
});
//this is the routes on use
app.use('/test', testRoute);
app.use('/supplier', supplierRoute);
app.use('/product', productRoute);
app.use('/user',userRoute);
app.use('/sale',saleRoute);
app.use('/role',roleRoute);
app.use('/entity', entityRoute);
app.use('/store',storeRoute);
app.use('/login',loginRoute);
app.use('/binCard',binCardRoute);
app.use('/creditCustomer', creditCustomerRoute);
app.use('/creditSell', creditSellRoute);
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
