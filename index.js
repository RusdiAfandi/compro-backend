const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const connectDB = require('./src/config/db');
const swaggerSpecs = require('./src/config/swagger');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// CORS Configuration - Support both local development and production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      process.env.FRONTEND_URL, // Set this in production
    ].filter(Boolean);
    
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      // In production, allow all origins (you can restrict this later)
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/menu', require('./src/routes/menuRoutes'));
app.use('/api/interests', require('./src/routes/interestsRoutes'));
app.use('/api/courses', require('./src/routes/courseRoutes'));
app.use('/api/simulation', require('./src/routes/simulationRoutes'));

// Default route
app.get('/', (req, res) => {
  res.send('API Mahasiswa Backend is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'production'} mode on port ${PORT}`);
});
