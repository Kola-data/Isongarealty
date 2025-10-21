import express from 'express';
import cors from "cors";
import dotenv from 'dotenv';
import path from "path";
import userRouter from './services/UserManagement/router.js';
import propertyRouter from './services/PropertyManagement/router.js';
import authRouter from './services/auth/auth.js';
import requestedPropertyRouter from './services/RequestedPropertyManagement/router.js';
import profileRouter from './services/profileManagement/router.js';
import dashboardRouter from "./services/dashboard/router.js";
import cacheRouter from './routes/cache.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3200;

// ---------------- MIDDLEWARES ----------------
app.use(cors());
app.use(express.json({ limit: "10mb" })); // allow large JSON payloads
app.use(express.urlencoded({ extended: true })); // for form submissions

// Serve uploads folder statically
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ---------------- ROUTERS ----------------
app.use('/api/users', userRouter);
app.use('/api/properties', propertyRouter);
app.use('/api/auth', authRouter);
app.use('/api/requested-properties', requestedPropertyRouter);
app.use('/api/profile', profileRouter);
app.use("/api/dashboard", dashboardRouter);
app.use('/api/cache', cacheRouter);

// ---------------- ROOT & HEALTH CHECK ----------------
app.get('/', (req, res) => res.json({ message: 'Welcome to the API' }));
app.get('/health', (req, res) => res.json({ status: 'OK' }));

// ---------------- FALLBACK ROUTE ----------------
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// ---------------- GLOBAL ERROR HANDLER ----------------
app.use((err, req, res, next) => {
  console.error('Error:', err.stack || err);
  res.status(500).json({
    message: 'Internal Server Error',
    error: err.message || "Unknown error"
  });
});

// ---------------- START SERVER ----------------
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
