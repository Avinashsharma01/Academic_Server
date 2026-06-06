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

// Function to send verification email to SuperAdmin
export const sendVerificationEmail = async (superAdminEmail, superAdminId) => {
    try {
        // Generate a JWT Token for email verification
        const token = jwt.sign({ id: superAdminId }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });

        // Create verification link based on deploy environment (Docker/local/prod)
        const backendPublicUrl = process.env.BACKEND_PUBLIC_URL || `http://localhost:${process.env.PORT || 8080}`;
        const verificationLink = `${backendPublicUrl}/api/superadmin/verify/${token}`;

        // Email options
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: superAdminEmail,
            subject: "SuperAdmin Email Verification",
            html: `
                <h2>Verify Your SuperAdmin Account</h2>
                <p>Click the link below to verify your SuperAdmin email:</p>
                <a href="${verificationLink}" target="_blank">${verificationLink}</a>
                <p>This link will expire in 1 hour.</p>
                <p>If you did not request this verification, please ignore this email.</p>
            `,
        };

        // Send email
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error sending SuperAdmin verification email:", error);
    }
};