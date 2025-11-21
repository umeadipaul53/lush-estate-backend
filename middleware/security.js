const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const hpp = require("hpp");
const sanitizeHtml = require("sanitize-html");
const { validationResult } = require("express-validator");
const { doubleCsrf } = require("csrf-csrf");
const AppError = require("../utils/AppError");

const isProduction = process.env.NODE_ENV === "production";

/* ---------------------------
   1. Rate Limiters
--------------------------- */
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    status: "fail",
    message: "Too many login attempts. Try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    status: "fail",
    message: "Too many requests. Please slow down.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/* ---------------------------
   2. CORS Setup
--------------------------- */
const allowedOrigins = [
  "http://localhost:5173", // Vite frontend (development)
  "http://localhost:4000", // backend self-requests (needed for CSP)
  "https://tehlex.co", // production domain
  "https://www.tehlex.co", // www alias
  "https://lush-estate.vercel.app", // vercel preview/staging
  "https://lush-estate-backend.onrender.com", // render backend origin
  "https://backend.tehlex.co",
];

const corsOptions = {
  origin: function (origin, callback) {
    // log origin for debugging
    if (origin) console.log("🟡 CORS request from:", origin);

    if (!origin) return callback(null, true); // allow Postman or curl
    if (allowedOrigins.includes(origin)) return callback(null, true);

    console.warn("❌ Blocked by CORS:", origin);
    callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  credentials: true, // allow cookies and credentials
};

/* ---------------------------
   3. CSRF Protection
--------------------------- */
const { doubleCsrfProtection } = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET || "default_csrf_secret",
  cookieName: "__Host-csrf-token",
  cookieOptions: {
    httpOnly: true,
    sameSite: isProduction ? "None" : "Lax",
    secure: isProduction,
    path: "/",
  },
  size: 64,
  ignoredMethods: ["GET", "HEAD", "OPTIONS"],
});

const csrfMiddleware = doubleCsrfProtection;

/* ---------------------------
   4. Input Sanitization
--------------------------- */
function sanitizeInput(input) {
  return sanitizeHtml(input, { allowedTags: [], allowedAttributes: {} });
}

function sanitizeMiddleware(req, res, next) {
  if (req.body && typeof req.body === "object") {
    for (const key in req.body) {
      if (typeof req.body[key] === "string") {
        req.body[key] = sanitizeInput(req.body[key]);
      }
    }
  }
  if (req.query && typeof req.query === "object") {
    for (const key in req.query) {
      if (typeof req.query[key] === "string") {
        req.query[key] = sanitizeInput(req.query[key]);
      }
    }
  }
  next();
}

/* ---------------------------
   5. Validation Middleware
--------------------------- */
function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError("Validation failed", 400, errors.array()));
  }
  next();
}

/* ---------------------------
   6. Apply All Security Middleware
--------------------------- */
function applySecurity(app) {
  // Helmet - secure HTTP headers
  app.use(helmet());

  if (isProduction) {
    app.use(
      helmet.hsts({
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      })
    );
  }

  // ✅ Content Security Policy (CSP)
  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "https://tehlex.co",
          "https://www.tehlex.co",
          "https://lush-estate.vercel.app",
          "https://cdn.jsdelivr.net",
        ],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: [
          "'self'",
          "http://localhost:5173",
          "http://localhost:4000",
          "https://tehlex.co",
          "https://www.tehlex.co",
          "https://lush-estate.vercel.app",
          "https://lush-estate-backend.onrender.com", // backend Render URL
          "https://backend.tehlex.co",
        ],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    })
  );

  // Additional helmet protections
  app.use(helmet.frameguard({ action: "sameorigin" }));
  app.use(helmet.noSniff());
  app.use(helmet.ieNoOpen());
  app.use(helmet.referrerPolicy({ policy: "no-referrer" }));
  app.use(helmet.permittedCrossDomainPolicies({ permittedPolicies: "none" }));
  app.use(helmet.hidePoweredBy());

  // ✅ Must come before routes
  app.use(cors(corsOptions));
  app.options(/^\/.*$/, cors(corsOptions));

  app.use(hpp());
  app.use(sanitizeMiddleware);
  app.use("/api", apiRateLimiter);
}

module.exports = {
  authRateLimiter,
  apiRateLimiter,
  corsOptions,
  csrfMiddleware,
  sanitizeMiddleware,
  validateRequest,
  applySecurity,
};
