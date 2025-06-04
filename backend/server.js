require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { sequelize } = require('./models');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/product');
const cartRoutes = require("./routes/Cart");
const  likeProduct = require('./routes/like');
const ratingRoutes = require('./routes/rating');
const orderRoutes = require('./routes/order');
const categoryRoutes = require('./routes/category');
const userUpdateRoutes = require('./routes/userUpdate');

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
app.use("/api", likeProduct);
app.use("/api", ratingRoutes);
app.use('/api', orderRoutes); 
app.use('/api', categoryRoutes);
app.use('/api', userUpdateRoutes);

const PORT = process.env.PORT || 5000;
sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});