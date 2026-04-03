import dotenv from 'dotenv';
dotenv.config({path:'./.env'});
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