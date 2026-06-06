import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import path from "path";
import cookieParser from "cookie-parser";
import ConnectTODB from "./Database/db.js";
import authRoutes from "./Routes/authRoutes.js";
import noteRoutes from "./Routes/noteRoutes.js";
import feedbackRoutes from "./Routes/feedbackRoutes.js";
import ContactRoutes from "./Routes/ContactRoute.js";
import superAdminRoutes from "./Routes/SuperAdminRoute.js";
import subscribeRoutes from "./Routes/SubscribeRoute.js";
import academicRoutes from "./Routes/AcademicRoutes.js";
import chatbotRoutes from "./Routes/chatbotRoutes.js";
import AppError from "./utils/AppError.js";
import postgresCompilerRoutes from "./Compilers/PostGres/PostgresCompilier.js";
import cCompilerRoutes from "./Compilers/C_Programming/ServerForC.js";
import cppCompilerRoutes from "./Compilers/CPP_Programing/ServerForCpp.js";
import javaCompilerRoutes from "./Compilers/Java/ServerForJava.js";
import pythonCompilerRoutes from "./Compilers/Python_Compiler/ServerForPython.js";
dotenv.config();

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(path.resolve(), "public")));
app.set("view engine", "ejs");

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// Auth Routes
app.use("/api/auth", authRoutes);

// Fetch User Route
app.use("/api/all", authRoutes)

// Notes Routes
app.use("/api/notes", noteRoutes);

// Feedback routes
app.use("/api/feedback", feedbackRoutes);

// Contact routes
app.use("/api/contact", ContactRoutes);

// SuperAdmin routes
app.use("/api/superadmin", superAdminRoutes);

// Subscribe routes
app.use("/api/subscribe", subscribeRoutes);

// Academic data routes (sessions, courses, branches, semesters, subjects)
app.use("/api/academic", academicRoutes);

// Chatbot assistant route
app.use("/api/chatbot", chatbotRoutes);

// SQL compiler routes (regular + sandbox)
app.use("/api/query", postgresCompilerRoutes);

// C Programming compiler routes
app.use("/api/compile/", cCompilerRoutes);

// C++ Programming compiler routes
app.use("/api/compile/", cppCompilerRoutes);

// Java Programming compiler routes
app.use("/api/compile/", javaCompilerRoutes);

// Python Programming compiler routes
app.use("/api/compile/", pythonCompilerRoutes);

app.get("/user", (req, res) => {
  res.render("UserEmailVerify");
});
app.get("/admin", (req, res) => {
  res.render("AdminEmailVerify");
});


app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use((req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});

app.use((error, req, res, next) => {
  console.error(error.stack);

  const statusCode = error.statusCode || 500;
  const message = error.isOperational
    ? error.message
    : "Something went wrong. Please try again later.";

  res.status(statusCode).json({
    status: error.status || "error",
    message,
  });
});

const port = process.env.PORT;

if (!port) {
  throw new Error("PORT is required in environment variables");
}

app.listen(port, () => {
  ConnectTODB();
  console.log(`Server is listen on port ${port}`);
});
