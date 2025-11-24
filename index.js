const express = require("express");
const app = express();
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
dotenv.config();

const AppError = require("./utils/AppError");
const isProduction = process.env.NODE_ENV === "production";
const port = process.env.PORT || 3500;

const globalErrorHandler = require("./controller/errorController");
const { applySecurity } = require("./middleware/security");
const connectDB = require("./config/db");

// Connect DB
connectDB();

// Security middleware
applySecurity(app);

// Logging
app.use(morgan(isProduction ? "combined" : "dev"));

// ---- BODY PARSERS (for all normal routes) ---- //
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("public"));

app.set("trust proxy", 1);

// ---- ROUTES ---- //
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");

// Webhook routes — IMPORTANT: raw body middleware ONLY here
const webhookRoutes = require("./routes/webhookRoutes");

// Default server test route
app.get("/", (req, res) => {
  res
    .status(200)
    .json({ message: "server up and running", data: isProduction });
});

// API Routes
app.use("/api/auth/v1", authRoutes);
app.use("/api/admin/v1", adminRoutes);
app.use("/api/user/v1", userRoutes);

// Webhook route WITH corrected middleware
// keeps JSON body parsed normally
app.use("/webhooks", webhookRoutes);

// ---- 404 Handler ---- //
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// ---- Global Error Handler ---- //
app.use(globalErrorHandler);

// ---- Start Server ---- //
app.listen(port, () => console.log(`Server running on PORT: ${port}`));
