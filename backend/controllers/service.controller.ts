import { Request, Response } from "express";
import mongoose from "mongoose";
import { Booking, Service } from "../models";
import { User } from "../models/User";
import { sendServiceStatusEmail } from "../config/nodemailer";

export const getProviderDashboard = async (req: any, res: Response) => {
  try {
    const providerId = req.user.id;

    const services = await Service.find({ providerId }).sort({ createdAt: -1 });

    const stats = {
      total: services.length,
      approved: services.filter((s) => s.status === "approved").length,
      pending: services.filter((s) => s.status === "pending").length,
      rejected: services.filter((s) => s.status === "rejected").length,
    };

    res.json({
      stats,
      services,
    });
  } catch (err: any) {
    console.error(err);
    res.status(400).json({
      message: "Error fetching dashboard",
      error: err.message,
    });
  }
};
export const getServices = async (req: Request, res: Response) => {
  const { categoryId, location, status, search } = req.query as any;
  try {
    const query: any = {};
    if (categoryId && mongoose.Types.ObjectId.isValid(categoryId))
      query.categoryId = categoryId;
    if (location) query.location = { $regex: location, $options: "i" };
    if (search)
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    query.status = status || "approved";

    const services = await Service.find(query).populate(
      "providerId",
      "displayName",
    );
    const formatted = services.map((s) => {
      const data = s.toJSON();
      return {
        ...data,
        providerName: (s.providerId as any)?.displayName || "Professional",
      };
    });
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: "Error fetching services" });
  }
};

export const getServiceById = async (req: Request, res: Response) => {
  try {
    const service = await Service.findById(req.params.id).populate(
      "providerId",
      "displayName",
    );
    if (!service) return res.status(404).json({ message: "Service not found" });

    const data = service.toJSON();
    res.json({
      ...data,
      providerName: (service.providerId as any)?.displayName || "Professional",
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching service" });
  }
};

export const createService = async (req: any, res: Response) => {
  const { categoryId, name, price, location } = req.body;
  const uploadedImage = req.file ? `/uploads/${req.file.filename}` : "";

  if (!categoryId || !name || !price || !location) {
    return res.status(400).json({
      message: "All mandatory fields are required",
    });
  }
  if (price < 20) {
    return res.status(403).json({message: "Price should be more than 20"})
  }
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    if (!mongoose.Types.ObjectId.isValid(req.body.categoryId)) {
      return res.status(400).json({
        message: "Invalid categoryId",
      });
    }

    if (!user.isApproved) {
      return res.status(403).json({
        message: "Provider not verified by admin",
      });
    }
    const service = new Service({
      ...req.body,
      image: uploadedImage || req.body.image || "",
      providerId: req.user.id,
      status: "pending",
    });
    await service.save();
    res.status(201).json(service);
  } catch (err: any) {
    console.log(err);
    res
      .status(400)
      .json({ message: "Error creating service", error: err.message });

    // it will also give error if provider is not verified by admin
  }
};

export const updateService = async (req: any, res: Response) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // 🔐 Authorization
    if (
      service.providerId.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (service.status === "rejected") {
      return res.status(400).json({
        message: "Cannot edit rejected service",
      });
    }

    const updates: any = { ...req.body };
    if (req.file) {
      updates.image = `/uploads/${req.file.filename}`;
    }

    // ❌ Prevent restricted fields
    delete updates.status;
    delete updates.providerId;

    // 🔥 If provider updates → reset to pending
    if (req.user.role === "provider") {
      updates.status = "pending";
    }

    const updated = await Service.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });

    res.json({
      message: "Service updated successfully",
      service: updated,
    });
  } catch (err: any) {
    console.error(err);
    res.status(400).json({
      message: "Error updating service",
      error: err.message,
    });
  }
};

export const deleteService = async (req: any, res: Response) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: "Not found" });

    if (
      service.providerId.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Service.findByIdAndDelete(req.params.id);
    res.json({ message: "Service deleted" });
  } catch (err) {
    res.status(400).json({ message: "Error deleting service" });
  }
};

export const updateServiceStatus = async (req: any, res: Response) => {
  try {
    const { status, reason } = req.body;
    console.log(req.body);
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

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // check it later
    if (service.status === status) {
      return res.status(400).json({
        message: `Service already ${status}`,
      });
    }

    service.status = status;

    if (status === "rejected") {
      service.rejectionReason = reason ;
      service.rejectedAt = new Date();
    } else {
      service.rejectionReason = "";
      service.approvedAt = new Date();
    }

    await service.save();

    // 📧 Send Email
    const provider = await User.findById(service.providerId);

    if (provider?.email) {
      await sendServiceStatusEmail(
        provider.email,
        service.name,
        status,
        reason,
      );
    }

    res.json({
      message: `Service ${status}`,
      service,
    });
  } catch (err: any) {
    console.error(err);
    res.status(400).json({
      message: "Error updating status",
      error: err.message,
    });
  }
};

export const getRecommendations = async (req: any, res: Response) => {
  try {
    const userBookings = await Booking.find({ userId: req.user.id }).populate(
      "serviceId",
      "categoryId",
    );

    const bookedServiceIds = userBookings
      .map((booking) => (booking.serviceId as any)?._id?.toString())
      .filter(Boolean);

    const bookedCategoryIds = [
      ...new Set(
        userBookings
          .map((booking) => (booking.serviceId as any)?.categoryId?.toString())
          .filter(Boolean),
      ),
    ];

    const recommendations: any[] = [];

    if (bookedCategoryIds.length > 0) {
      const categoryMatches = await Service.find({
        status: "approved",
        categoryId: { $in: bookedCategoryIds },
        _id: { $nin: bookedServiceIds },
      })
        .populate("providerId", "displayName")
        .sort({ rating: -1, reviewCount: -1, createdAt: -1 })
        .limit(8);

      recommendations.push(...categoryMatches);
    }

    const remaining = Math.max(0, 8 - recommendations.length);
    if (remaining > 0) {
      const excludeIds = [
        ...bookedServiceIds,
        ...recommendations.map((service) => service._id.toString()),
      ];

      const topRated = await Service.find({
        status: "approved",
        _id: { $nin: excludeIds },
      })
        .populate("providerId", "displayName")
        .sort({ rating: -1, reviewCount: -1, createdAt: -1 })
        .limit(remaining);

      recommendations.push(...topRated);
    }

    const formatted = recommendations.map((service) => {
      const data = service.toJSON();
      return {
        ...data,
        providerName: (service.providerId as any)?.displayName || "Professional",
      };
    });

    res.json(formatted);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({
      message: "Error getting recommendations",
      error: err.message,
    });
  }
};
