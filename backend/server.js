import dotenv from 'dotenv';
dotenv.config({path:'./.env'});

if (!process.env.GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY not found in .env');
}

import cors from 'cors';
import express from 'express';
import connectDB from './config/connectDB.js';
import userRoutes from './routes/userRoutes.js';
import demoRoutes from './routes/demoRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import interviewRoutes from './routes/interviewRoutes.js';
import { startNgrok } from './utils/ngrok-config.js';
import ApiRoute from './routes/ApiRoute.js';



const PORT = process.env.PORT || 8000;

const app = express();
app.use(cors());
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

// Cache-control middleware for static assets
app.use((req, res, next) => {
  const staticExtRE = /\.(?:js|css|png|jpg|jpeg|webp|svg|gif|ico|woff2?|ttf|eot)$/i;
  if (req.path.startsWith('/assets/') || staticExtRE.test(req.path)) {
    // If filename looks fingerprinted (contains a hex hash), set a long TTL
    if (/[0-9a-f]{8,}\./i.test(req.path)) {
      res.set('Cache-Control', 'public, max-age=31536000, immutable');
    } else {
      // Shorter caching for non-fingerprinted assets
      res.set('Cache-Control', 'public, max-age=3600, must-revalidate');
    }
  }
  next();
});



// Raw body for webhook verification
app.use('/api/users/sync', express.raw({ type: 'application/json' }));

connectDB();

// Start ngrok for M-Pesa callbacks


// Routes
app.use('/api/users', userRoutes);
app.use('/api/demo', demoRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api',ApiRoute)

app.get('/', (req, res) => {
    res.send('hello from interviewwace backend');
})

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
})