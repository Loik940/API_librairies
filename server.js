require('dotenv').config({
  path: require('path').join(__dirname, '.env'),
  quiet: true,
});

const express = require('express');
const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
const bookRoutes = require('./src/routes/bookRoutes');
const { notFound, errorHandler } = require('./src/middlewares/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 3050;

app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);

app.use(notFound);
app.use(errorHandler);

async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
  });
}

startServer();
