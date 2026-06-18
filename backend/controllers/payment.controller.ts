import { Request, Response } from "express";
import Stripe from "stripe";
import { Booking } from "../models";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_mock", {
  apiVersion: "2025-01-27.acacia" as any,
});

const getAppUrl = (req: Request) => {
  return (process.env.APP_URL || `${req.protocol}://${req.get("host")}`).replace(/\/$/, "");
};

export const createCheckoutSession = async (req: any, res: Response) => {
  const { bookingId } = req.body;

  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ message: "Stripe secret key is not configured" });
    }

    const booking = await Booking.findById(bookingId).populate("serviceId");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only pay for your own booking" });
    }

    if (booking.status !== "accepted") {
      return res.status(400).json({
        message: "Payment allowed only after provider accepts booking",
      });
    }

    if (booking.paymentStatus === "paid") {
      return res.status(400).json({
        message: "Booking already paid",
      });
    }

    const appUrl = getAppUrl(req);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: (booking.serviceId as any).name,
            },
            unit_amount: Math.round(Number(booking.totalAmount) * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${appUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/payment/failed?bookingId=${bookingId}`,
      metadata: {
        bookingId: booking.id,
      },
    });

    booking.stripeSessionId = session.id;
    await booking.save();

    res.json({ id: session.id, url: session.url });
  } catch (err: any) {
    console.error("Stripe error:", err);
    res.status(500).json({ message: "Error creating checkout session" });
  }
};

export const verifyCheckoutSession = async (req: any, res: Response) => {
  const { sessionId } = req.params;

  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ message: "Stripe secret key is not configured" });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const bookingId = session.metadata?.bookingId;

    if (!bookingId) {
      return res.status(400).json({ message: "Checkout session is missing booking details" });
    }

    const booking = await Booking.findById(bookingId).populate("serviceId");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.userId.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "You cannot view this payment" });
    }

    if (session.payment_status === "paid" && booking.paymentStatus !== "paid") {
      booking.paymentStatus = "paid";
      booking.stripeSessionId = session.id;
      await booking.save();
    }

    res.json({
      booking: booking.toJSON(),
      stripeStatus: session.status,
      stripePaymentStatus: session.payment_status,
    });
  } catch (err: any) {
    console.error("Stripe verify error:", err);
    res.status(500).json({ message: "Unable to verify payment" });
  }
};

export const handleWebhook = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.bookingId;

    if (bookingId) {
      const booking = await Booking.findById(bookingId);

      if (booking && booking.paymentStatus !== "paid") {
        booking.paymentStatus = "paid";
        booking.stripeSessionId = session.id;
        await booking.save();
      }
    }
  }

  res.json({ received: true });
};
