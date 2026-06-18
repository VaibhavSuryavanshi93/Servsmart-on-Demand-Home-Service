import { Request, Response } from 'express';
import { User, Service, Booking } from '../models';

export const getAdminStats = async (req: Request, res: Response) => {
  try {
    const [u, s, p, b] = await Promise.all([
      User.countDocuments(),
      Service.countDocuments(),
      Service.countDocuments({ status: 'pending' }),
      Booking.countDocuments()
    ]);
    res.json({ 
      userCount: u, 
      serviceCount: s, 
      pendingServices: p, 
      bookingCount: b 
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching admin stats' });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users' });
  }
};

export const approveProvider = async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id, 
      { isApproved: true }, 
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: 'Error approving provider' });
  }
};
