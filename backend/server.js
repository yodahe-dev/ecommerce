require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { sequelize } = require('./models');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/product'); // Import product routes
const cartRoutes = require("./routes/Cart");
const paymentRoutes = require("./routes/payment");
const  likeProduct = require('./routes/like');
const ratingRoutes = require('./routes/rating'); // Import rating routes
const orderRoutes = require('./routes/order'); // Import order routes

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));

app.use(helmet());
app.use(express.json());
app.use('/api', authRoutes);
app.use('/api', productRoutes); 
app.use("/api/cart", cartRoutes);
app.use("/api", paymentRoutes);
app.use("/api", likeProduct);
app.use("/api", ratingRoutes);
app.use('/api', orderRoutes); 



const PORT = process.env.PORT || 5000;
sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});