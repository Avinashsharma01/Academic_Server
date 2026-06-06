This is a **Node.js middleware** (using **Express.js**) that handles authentication and authorization using **JWT (JSON Web Tokens)**.

### Breakdown:

#### 1️⃣ **`authenticateUser` Middleware** (For User Authentication)

-   Extracts the **JWT token** from the `Authorization` header.
-   If no token is found, it responds with a **401 (Unauthorized)** error.
-   If a token is present, it attempts to **verify** it using `jwt.verify()` with a secret key (`process.env.JWT_SECRET`).
-   If verification is successful:
    -   It **decodes** the token (which typically contains user data like `id`, `email`, `role`, etc.).
    -   The decoded data is attached to `req.user`, so the next middleware or route handler can access the user's information.
    -   Calls `next()` to proceed to the next middleware.
-   If verification fails, it responds with **"Invalid token" (401 Unauthorized)**.

✅ **Purpose:** Ensures that only authenticated users with a valid JWT token can access protected routes.

---

#### 2️⃣ **`authorizeAdmin` Middleware** (For Admin Authorization)

-   It tries to check if `req.admin.role` is `"admin"`.
-   If `req.admin.role` is **not** `"admin"`, it sends a **403 (Forbidden)** error.
-   Otherwise, it calls `next()` to proceed.

🚨 **Issue in the Code:**

-   `req.admin` is not defined in `authenticateUser`.
-   It should check `req.user.role` instead of `req.admin.role`.

🔧 **Fix:**

```js
export const authorizeAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied! Admins only" });
    }
    next();
};
```

✅ **Purpose:** Ensures that only users with an `"admin"` role can access certain routes.

---

### **How to Use These Middlewares?**

In an **Express.js route**, you can use them like this:

```js
import express from "express";
import { authenticateUser, authorizeAdmin } from "./middlewares/auth.js";

const router = express.Router();

// Protected Route (Only Authenticated Users)
router.get("/dashboard", authenticateUser, (req, res) => {
    res.json({ message: "Welcome to the dashboard!", user: req.user });
});

// Admin-Only Route
router.get("/admin", authenticateUser, authorizeAdmin, (req, res) => {
    res.json({ message: "Welcome Admin!" });
});

export default router;
```

---

### **Summary**

-   ✅ `authenticateUser` → Checks if the request has a valid JWT token.
-   ✅ `authorizeAdmin` → Checks if the authenticated user has an **admin** role.
-   ✅ Used to **protect** routes from unauthorized access.

Let me know if you need further explanation! 🚀
