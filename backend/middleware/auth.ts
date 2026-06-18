import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const JWT_SECRET = process.env.JWT_SECRET || 'servesmart-secret-key';

export const checkDB = (req: any, res: any, next: any) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ 
      message: 'Database is currently disconnected. Please check your MONGODB_URI configuration.',
      status: 'db_down'
    });
  }
  next();
};

export const authenticateToken = (req: any, res: any, next: any) => {
  const token = req.cookies.token || (req.headers['authorization']?.split(' ')[1]);
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) return res.status(403).json({ message: 'Forbidden' });
    req.user = decoded;
    next();
  });
};

export const authenticateAdmin = (req: any, res: any, next: any) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

export const authenticateProvider = (req: any, res: any, next: any) => {
  if (req.user?.role !== 'provider' && req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Provider access required' });
  }
  next();
};
