import jwt from "jsonwebtoken";

// Middleware to protect routes
export const authenticateUser = (req, res, next) => {
    // Try to get token from cookies first, then fall back to Authorization header
    let token = req.cookies.authToken || req.cookies.SuperauthToken;

    if (!token) {
        const authHeader = req.header("Authorization");
        if (authHeader) {
            // Strip "Bearer " prefix if present
            token = authHeader.startsWith("Bearer ")
                ? authHeader.slice(7)
                : authHeader;
        }
    }

    if (!token) return res.status(401).json({ message: "Access denied! No token provided" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach user data to request
        next();
    } catch (error) {
        // Clear invalid cookies if present
        if (req.cookies.authToken) {
            res.cookie('authToken', '', {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                path: "/",
                expires: new Date(0)
            });
            res.cookie('authToken', '', {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                path: "/api/auth",
                expires: new Date(0)
            });
        }
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

// Middleware for Admin-Only Access
export const authorizeAdmin = (req, res, next) => {
    console.log(req.user);
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied! Admins only" });
    }
    next();
};
