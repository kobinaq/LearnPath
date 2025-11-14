// Load environment variables
require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const path = require("path");
const basicRoutes = require("./routes/index");
const authRoutes = require("./routes/auth");
const { authenticateWithToken } = require('./routes/middleware/auth');
const cors = require("cors");
const learningPathRoutes = require('./routes/learning-paths');
const subscriptionRoutes = require('./routes/subscriptions');

if (!process.env.DATABASE_URL || !process.env.SESSION_SECRET) {
  console.error("Error: DATABASE_URL or SESSION_SECRET variables in .env missing.");
  process.exit(-1);
}

const app = express();
const port = process.env.PORT || 3000;
// Pretty-print JSON responses
app.enable('json spaces');
// We want to be consistent with URL paths, so we enable strict routing
app.enable('strict routing');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure CORS
// In production (Railway), frontend and backend are on same domain, so CORS is simpler
// In development, allow localhost:5173
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? true  // Allow same-origin requests in production
    : 'http://localhost:5173',  // Allow Vite dev server in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Authentication routes
app.use(authenticateWithToken);
app.use(authRoutes);

// Database connection
mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((err) => {
    console.error(`Database connection error: ${err.message}`);
    console.error(err.stack);
    process.exit(1);
  });

// Session configuration with connect-mongo
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.DATABASE_URL }),
  }),
);

app.on("error", (error) => {
  console.error(`Server error: ${error.message}`);
  console.error(error.stack);
});

// Logging session creation and destruction
app.use((req, res, next) => {
  const sess = req.session;
  // Make session available to all views
  res.locals.session = sess;
  if (!sess.views) {
    sess.views = 1;
    console.log("Session created at: ", new Date().toISOString());
  } else {
    sess.views++;
    console.log(
      `Session accessed again at: ${new Date().toISOString()}, Views: ${sess.views}, User ID: ${sess.userId || '(unauthenticated)'}`,
    );
  }
  next();
});

// Basic Routes
app.use(basicRoutes);
// Authentication Routes
app.use('/api/auth', authRoutes);
// Learning Path Routes
app.use('/api/learning-paths', learningPathRoutes);
// Subscription Routes
app.use('/api/subscriptions', subscriptionRoutes);

// Serve static files from React build (production only)
const clientBuildPath = path.join(__dirname, '../client/dist');
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(clientBuildPath));

  // Handle client-side routing - send all non-API requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
} else {
  // Development mode - if no API route matched, return 404
  app.use((req, res, next) => {
    res.status(404).send("API endpoint not found. Frontend dev server runs separately on port 5173.");
  });
}

// Error handling
app.use((err, req, res, next) => {
  console.error(`Unhandled application error: ${err.message}`);
  console.error(err.stack);
  res.status(500).send("There was an error serving your request.");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
