require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { sequelize } = require('./models');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/post')
const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(helmet());
app.use(express.json());

app.use('/api', authRoutes); // user auth api
app.use('/api', postRoutes); // post CRUD api


sequelize.sync().then(() => {
  app.listen(5000, () => {
    console.log('Server running on port 5000');
  });
});
