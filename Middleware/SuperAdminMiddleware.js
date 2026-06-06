import jwt from "jsonwebtoken";

// Middleware to authenticate SuperAdmin
export const authenticateSuperAdmin = (req, res, next) => {
    // Try to get token from cookie first, then fall back to header
    const token = req.cookies.SuperauthToken || req.header("Authorization");

    if (!token) return res.status(401).json({ message: "Access denied! No token provided" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if the role is superadmin
        if (decoded.role !== "superadmin") {
            return res.status(403).json({ message: "Access denied! SuperAdmins only" });
        }

        req.superAdmin = decoded; // Attach superadmin data to request
        next();
    } catch (error) {
        // Clear invalid cookie if present
        if (req.cookies.SuperauthToken) {
            res.cookie('SuperauthToken', '', {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                path: "/",
                expires: new Date(0)
            });
            res.cookie('SuperauthToken', '', {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                path: "/api/superadmin",
                expires: new Date(0)
            });
        }
        res.status(401).json({ message: "Invalid token" });
    }
};