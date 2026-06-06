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

        // Create verification link based on deploy environment (Docker/local/prod)
        const backendPublicUrl = process.env.BACKEND_PUBLIC_URL || `http://localhost:${process.env.PORT || 8080}`;
        const verificationLink = `${backendPublicUrl}/api/auth/verify/admin/${token}`;

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
        // console.log("Verification email sent to:", userEmail);
    } catch (error) {
        console.error("Error sending email:", error);
    }
};