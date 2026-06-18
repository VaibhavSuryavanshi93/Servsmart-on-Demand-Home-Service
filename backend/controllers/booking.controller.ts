import { Request, Response } from "express";
import { Booking, Message } from "../models";
import { Service } from "../models";

export const createBooking = async (req: any, res: Response) => {
  try {
    const { serviceId, date, time, address } = req.body;

    const service = await Service.findById(serviceId);

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // 🚫 ADD SLOT CHECK HERE
    const exists = await Booking.findOne({
      serviceId,
      date,
      time,
    });

    if (exists) {
      return res.status(400).json({
        message: "Slot already booked",
      });
    }

    // ✅ Create booking
    const booking = new Booking({
      userId: req.user.id,
      providerId: service.providerId,
      serviceId,
      date,
      time,
      address,
      totalAmount: service.price,
    });

    await booking.save();
    res.status(201).json(booking);
  } catch (err: any) {
    console.error(err);
    res.status(400).json({
      message: "Error creating booking",
      error: err.message,
    });
  }
};

export const getMyBookings = async (req: any, res: Response) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id })
      .populate("serviceId", "name")
      .populate("providerId", "displayName")
      .sort({ createdAt: -1 });

    const formatted = bookings.map((b) => {
      const data = b.toJSON();
      return {
        ...data,
        serviceName: (b.serviceId as any)?.name || "Service",
        providerName: (b.providerId as any)?.displayName || "Provider",
      };
    });
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: "Error fetching bookings" });
  }
};

export const getProviderBookings = async (req: any, res: Response) => {
  if (req.user?.role !== "provider") {
    res.status(403).send({ Message: "Provider access required" });
  }
  try {
    const bookings = await Booking.find({ providerId: req.user.id })
      .populate("serviceId", "name")
      .populate("userId", "displayName")
      .sort({ createdAt: -1 });

    const formatted = bookings.map((b) => {
      const data = b.toJSON();
      return {
        ...data,
        serviceName: (b.serviceId as any)?.name || "Service",
        userName: (b.userId as any)?.displayName || "Customer",
      };
    });
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: "Error fetching bookings" });
  }
};

export const updateBookingStatus = async (req: any, res: Response) => {
  try {
    const { status, reason } = req.body;
    if (!status) {
      return res.status(400).json({
        message: "Status is required",
      });
    }

    if (status === "rejected" && (!reason || reason.trim() === "")) {
      return res.status(400).json({
        message: "Rejection reason is required",
      });
    }

    const allowed = ["accepted", "rejected"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // 🔐 Only provider
    if (booking.providerId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // ❌ Already handled
    if (booking.status !== "pending") {
      return res.status(400).json({
        message: "Booking already processed",
      });
    }

    booking.status = status;
    if (status === "rejected") {
      booking.rejectionReason = reason || "";
    }

    await booking.save();

    res.json({
      message: `Booking ${status}`,
      booking,
    });
  } catch (err: any) {
    console.error(err);
    res.status(400).json({
      message: "Error updating booking status",
      error: err.message,
    });
  }
};

export const getBookingMessages = async (req: any, res: Response) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // 🔐 Only user or provider
    if (
      booking.userId.toString() !== req.user.id &&
      booking.providerId.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const messages = await Message.find({
      bookingId: req.params.bookingId,
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Error fetching messages" });
  }
};
