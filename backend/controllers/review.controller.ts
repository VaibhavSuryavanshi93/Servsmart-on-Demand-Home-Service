import { Request, Response } from "express";
import { Review, Service, Booking } from "../models";

export const createReview = async (req: any, res: Response) => {
  const { serviceId, bookingId, rating, comment } = req.body;
  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    if (!comment || typeof comment !== "string" || comment.trim().length < 5) {
      return res.status(400).json({
        message: "Comment must be at least 5 characters long",
      });
    }
    //! User can give reivew at Once
    const existingReview = await Review.findOne({
      userId: req.user.id,
      bookingId,
    });

    if (existingReview) {
      return res.status(400).json({
        message: "You have already reviewed this booking",
      });
    }

    //? User can review after payment
    if (booking.paymentStatus !== "paid") {
      return res
        .status(400)
        .json({ message: "Can only review completed bookings" });
    }

    const review = new Review({
      userId: req.user.id,
      serviceId,
      bookingId,
      rating,
      comment,
    });
    await review.save();

    // Update service rating (simplified)
    const reviews = await Review.find({ serviceId });
    const avgRating =
      reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
    await Service.findByIdAndUpdate(serviceId, {
      rating: Number(avgRating.toFixed(1)),
      reviewCount: reviews.length,
    });

    res.status(201).json(review);
  } catch (err) {
    res.status(400).json({ message: "Error creating review" });
  }
};

export const getServiceReviews = async (req: Request, res: Response) => {
  try {
    const reviews = await Review.find({ serviceId: req.params.serviceId })
      .populate("userId", "displayName focus_area")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: "Error fetching reviews" });
  }
};
