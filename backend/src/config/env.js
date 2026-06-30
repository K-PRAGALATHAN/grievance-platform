const path = require("node:path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const env = {
  port: process.env.PORT || process.env.BACKEND_PORT || 5000,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  databaseUrl: process.env.DATABASE_URL,
  aiServiceUrl: process.env.AI_SERVICE_URL || "http://localhost:8000",
};

if (!env.jwtSecret) {
  throw new Error("JWT_SECRET is required");
}

module.exports = env;
