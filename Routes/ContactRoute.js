import express from "express"
import { SubmitContact, DeleteContact, GetAllContact } from "../Controllers/ContactController.js"
import { authenticateUser, authorizeAdmin } from "../Middleware/authMiddleware.js"

const router = express.Router();

// User Submits contact
router.post("/", authenticateUser, SubmitContact)

// admin fetch all contacts
router.get("/", authenticateUser, authorizeAdmin, GetAllContact)

// admin delete the contact
router.delete("/:id", authenticateUser, authorizeAdmin, DeleteContact)

export default router