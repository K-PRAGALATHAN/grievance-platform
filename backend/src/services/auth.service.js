const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");
const env = require("../config/env");

const SALT_ROUNDS = 10;

const publicUserFields = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  languagePreference: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
};

const createToken = (user) => {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
      email: user.email,
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn },
  );
};

const register = async ({ name, email, phone, password, role = "CITIZEN", languagePreference }) => {
  if (!name || !email || !password) {
    const error = new Error("Name, email, and password are required");
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    const error = new Error("Email is already registered");
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      phone,
      passwordHash,
      role,
      languagePreference: languagePreference || "en",
    },
    select: publicUserFields,
  });

  return {
    user,
    token: createToken(user),
  };
};

const login = async ({ email, password }) => {
  if (!email || !password) {
    const error = new Error("Email and password are required");
    error.statusCode = 400;
    throw error;
  }

  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  });

  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error("User account is inactive");
    error.statusCode = 403;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const { passwordHash, ...safeUser } = user;

  return {
    user: safeUser,
    token: createToken(user),
  };
};

const getCurrentUser = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: publicUserFields,
  });

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return user;
};

module.exports = {
  register,
  login,
  getCurrentUser,
};
