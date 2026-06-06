To use **Nodemailer** for **email verification** in a **MERN (MongoDB, Express, React, Node.js) project**, follow these steps:

---

## **📌 Steps to Implement Email Verification in a MERN Project**

### **1️⃣ Backend (Node.js & Express)**

1. Generate a **verification token** (JWT or a random string).
2. Store the token in the database.
3. Send an email with a **verification link** containing the token.
4. Create an API endpoint to verify the token.

---

### **2️⃣ Frontend (React)**

1. When a user registers, send their email to the backend.
2. Display a message instructing them to check their email.
3. When they click the verification link, call an API to verify the token.
4. Update the UI based on the response.

---

## **🚀 Step-by-Step Implementation**

### **🛠 Backend (Node.js & Express)**

#### **📌 Install Dependencies**

```sh
npm install express nodemailer dotenv jsonwebtoken mongoose cors
```

#### **📌 Setup `emailVerification.js`**

Create a utility to send the verification email.

```javascript
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    secure: true,
    port: 465,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Function to send verification email
export const sendVerificationEmail = async (userEmail, userId) => {
    try {
        // Generate a JWT Token for email verification
        const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });

        // Create verification link
        const verificationLink = `http://localhost:5000/api/auth/verify/${token}`;

        // Email options
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: "Email Verification",
            html: `
                <h2>Verify Your Email</h2>
                <p>Click the link below to verify your email:</p>
                <a href="${verificationLink}" target="_blank">${verificationLink}</a>
                <p>This link will expire in 1 hour.</p>
            `,
        };

        // Send email
        await transporter.sendMail(mailOptions);
        console.log("Verification email sent to:", userEmail);
    } catch (error) {
        console.error("Error sending email:", error);
    }
};
```

---

### **🛠 Create API Routes (`authRoutes.js`)**

```javascript
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js"; // Your MongoDB User Model
import { sendVerificationEmail } from "../utils/emailVerification.js";

const router = express.Router();

// 📌 Register Route
router.post("/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (user)
            return res.status(400).json({ message: "User already exists!" });

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user (unverified)
        user = new User({
            name,
            email,
            password: hashedPassword,
            isVerified: false,
        });
        await user.save();

        // Send verification email
        await sendVerificationEmail(email, user._id);

        res.status(200).json({
            message:
                "Registration successful! Please check your email for verification.",
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});

// 📌 Email Verification Route
router.get("/verify/:token", async (req, res) => {
    try {
        const { token } = req.params;

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) return res.status(404).json({ message: "User not found!" });

        if (user.isVerified)
            return res.status(400).json({ message: "Email already verified!" });

        // Mark user as verified
        user.isVerified = true;
        await user.save();

        res.status(200).json({ message: "Email verified successfully!" });
    } catch (error) {
        res.status(400).json({ message: "Invalid or expired token!" });
    }
});

export default router;
```

---

### **🛠 User Model (`User.js`)**

```javascript
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    isVerified: { type: Boolean, default: false },
});

export default mongoose.model("User", userSchema);
```

---

### **🛠 Connect Backend (`server.js`)**

```javascript
import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

// MongoDB Connection
mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.error("MongoDB Error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

---

## **🖥 Frontend (React)**

### **📌 Register Form (`SignUp.js`)**

```javascript
import { useState } from "react";
import axios from "axios";

const SignUp = () => {
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post(
                "http://localhost:5000/api/auth/signup",
                form
            );
            setMessage(data.message);
        } catch (error) {
            setMessage(error.response?.data?.message || "Error signing up.");
        }
    };

    return (
        <div>
            <h2>Register</h2>
            {message && <p>{message}</p>}
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    onChange={handleChange}
                    required
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    onChange={handleChange}
                    required
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    onChange={handleChange}
                    required
                />
                <button type="submit">Register</button>
            </form>
        </div>
    );
};

export default SignUp;
```

---

## **📌 Email Verification Flow**

1️⃣ User registers.  
2️⃣ Backend sends a **verification email** with a unique **JWT token**.  
3️⃣ User clicks the verification link → Backend **verifies the token** and updates the user in the database.  
4️⃣ User can now **log in** after verification.

---

## **📌 Summary**

✅ **Nodemailer** sends an email with a verification link.  
✅ **JWT token** verifies the user securely.  
✅ **Database (MongoDB)** stores user data with `isVerified` status.  
✅ **Frontend (React)** handles form submission and displays messages.

This is a **complete email verification system** for your MERN project! 🚀🔥 Let me know if you need further customizations. 🚀
