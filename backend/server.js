const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const authRoutes = require('./routes/auth');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', authRoutes);

sequelize.sync().then(() => {
  app.listen(5000, () => console.log('Server running on port 5000'));
});
