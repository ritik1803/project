import { hashSync, compareSync } from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { loginSchema, signupSchema } from '../utils/validation';

const JWT_SECRET = 'RDJ'; // In production, use environment variable

interface User {
  id: string;
  email: string;
  name: string;
  password: string;
}

let users: User[] = [];

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token: string): string | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded.userId;
  } catch (error) {
    return null;
  }
};

export const signup = async (email: string, password: string, name: string) => {
  try {
    const validatedData = signupSchema.parse({ email, password, name });
    
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      throw new Error('Email already exists');
    }

    const hashedPassword = hashSync(password, 10);
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email: validatedData.email,
      name: validatedData.name,
      password: hashedPassword,
    };

    users.push(newUser);
    const token = generateToken(newUser.id);

    return {
      user: { id: newUser.id, email: newUser.email, name: newUser.name },
      token,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Invalid input data');
  }
};

export const login = async (email: string, password: string) => {
  try {
    const validatedData = loginSchema.parse({ email, password });
    
    const user = users.find(u => u.email === validatedData.email);
    if (!user || !compareSync(password, user.password)) {
      throw new Error('Invalid credentials');
    }

    const token = generateToken(user.id);

    return {
      user: { id: user.id, email: user.email, name: user.name },
      token,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Invalid input data');
  }
};

export const validateSession = (token: string) => {
  const userId = verifyToken(token);
  if (!userId) {
    throw new Error('Invalid session');
  }

  const user = users.find(u => u.id === userId);
  if (!user) {
    throw new Error('User not found');
  }

  return { id: user.id, email: user.email, name: user.name };
};