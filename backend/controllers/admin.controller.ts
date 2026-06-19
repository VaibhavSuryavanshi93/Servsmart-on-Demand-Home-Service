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

export const getAllServices = async (req: Request, res: Response) => {
  try {
    const services = await Service.find()
      .populate('providerId', 'displayName email')
      .populate('categoryId', 'name')
      .sort({ createdAt: -1 });

    const formatted = services.map((service) => {
      const data = service.toJSON();
      return {
        ...data,
        providerName: (service.providerId as any)?.displayName || 'Provider',
        providerEmail: (service.providerId as any)?.email || '',
        categoryName: (service.categoryId as any)?.name || 'Category',
      };
    });

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching admin services' });
  }
};

export const getAllBookings = async (req: Request, res: Response) => {
  try {
    const bookings = await Booking.find()
      .populate('serviceId', 'name')
      .populate('userId', 'displayName email')
      .populate('providerId', 'displayName email')
      .sort({ createdAt: -1 });

    const formatted = bookings.map((booking) => {
      const data = booking.toJSON();
      return {
        ...data,
        serviceName: (booking.serviceId as any)?.name || 'Service',
        userName: (booking.userId as any)?.displayName || 'Customer',
        userEmail: (booking.userId as any)?.email || '',
        providerName: (booking.providerId as any)?.displayName || 'Provider',
        providerEmail: (booking.providerId as any)?.email || '',
      };
    });

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching admin bookings' });
  }
};
