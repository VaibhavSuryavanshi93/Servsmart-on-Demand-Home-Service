import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";

// Config & Utils
import { connectDB } from "./config/db";
import { seedData } from "./utils/seed";

// Models
import { Message } from "./models";

// Routes
import authRoutes from "./routes/auth.routes";
import categoryRoutes from "./routes/category.routes";
import serviceRoutes from "./routes/service.routes";
import bookingRoutes from "./routes/booking.routes";
import adminRoutes from "./routes/admin.routes";
import paymentRoutes from "./routes/payment.routes";
import reviewRoutes from "./routes/review.routes";
import { handleWebhook } from "./controllers/payment.controller";

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const PORT = 5000;

  // Database
  await connectDB();
  if (mongoose.connection.readyState === 1) {
    await seedData();
  }

  // Middleware
  app.use(
    cors({
      origin: true,
      credentials: true,
    }),
  );
  app.post("/api/payments/webhook", express.raw({ type: "application/json" }), handleWebhook);
  app.use(express.json());
  app.use(cookieParser());

  // Health Check
  app.get("/health", (req, res) => {
    res.json({
      status: "OK",
      database:
        mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    });
  });

  // Socket.io (Chat)
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    socket.on("join_booking", (bookingId) => socket.join(bookingId));
    socket.on("send_message", async (data) => {
      const { bookingId, senderId, receiverId, content } = data;
      try {
        const newMessage = new Message({
          bookingId,
          senderId,
          receiverId,
          content,
        });
        await newMessage.save();
        io.to(bookingId).emit("receive_message", newMessage);
      } catch (err) {
        console.error("Socket error:", err);
      }
    });
  });

  // API Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/categories", categoryRoutes); // for admin
  app.use("/api/services", serviceRoutes); // for admin and provider
  app.use("/api/bookings", bookingRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/payments", paymentRoutes);
  app.use("/api/reviews", reviewRoutes);

  // Static files
  app.use(
    "/uploads",
    express.static(path.join(process.cwd(), "backend/public/uploads")),
  );

  // Fallback for missing API routes
  app.use("/api/*", (req, res) => {
    res.status(404).json({ message: "API endpoint not found" });
  });

  // Vite & UI
  let vite: any;
  if (process.env.NODE_ENV !== "production") {
    vite = await createViteServer({
      root: path.join(process.cwd(), "frontend"),
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "frontend/dist")));
  }

  app.get("*", async (req, res, next) => {
    if (req.originalUrl.startsWith("/api")) return next(); // Already handled or 404
    try {
      if (process.env.NODE_ENV !== "production") {
        const template = fs.readFileSync(
          path.join(process.cwd(), "frontend/index.html"),
          "utf-8",
        );
        const transformed = await vite.transformIndexHtml(
          req.originalUrl,
          template,
        );
        res.status(200).set({ "Content-Type": "text/html" }).end(transformed);
      } else {
        res.sendFile(path.join(process.cwd(), "frontend/dist", "index.html"));
      }
    } catch (e) {
      if (vite) vite.ssrFixStacktrace(e);
      next(e);
    }
  });

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
