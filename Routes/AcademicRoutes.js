import express from "express";
import { authenticateSuperAdmin } from "../Middleware/SuperAdminMiddleware.js";
import {
    getSessions, createSession, updateSession, deleteSession,
    getCourses, createCourse, updateCourse, deleteCourse,
    getBranches, createBranch, updateBranch, deleteBranch,
    getSemesters, createSemester, updateSemester, deleteSemester,
    getSubjects, createSubject, updateSubject, deleteSubject,
} from "../Controllers/AcademicController.js";

const router = express.Router();

// ===== PUBLIC routes (for students/admins to read) =====
router.get("/sessions", getSessions);
router.get("/courses", getCourses);
router.get("/branches", getBranches);
router.get("/semesters", getSemesters);
router.get("/subjects", getSubjects);

// ===== PROTECTED routes (SuperAdmin only — CRUD) =====
// Sessions
router.post("/sessions", authenticateSuperAdmin, createSession);
router.put("/sessions/:id", authenticateSuperAdmin, updateSession);
router.delete("/sessions/:id", authenticateSuperAdmin, deleteSession);

// Courses
router.post("/courses", authenticateSuperAdmin, createCourse);
router.put("/courses/:id", authenticateSuperAdmin, updateCourse);
router.delete("/courses/:id", authenticateSuperAdmin, deleteCourse);

// Branches
router.post("/branches", authenticateSuperAdmin, createBranch);
router.put("/branches/:id", authenticateSuperAdmin, updateBranch);
router.delete("/branches/:id", authenticateSuperAdmin, deleteBranch);

// Semesters
router.post("/semesters", authenticateSuperAdmin, createSemester);
router.put("/semesters/:id", authenticateSuperAdmin, updateSemester);
router.delete("/semesters/:id", authenticateSuperAdmin, deleteSemester);

// Subjects
router.post("/subjects", authenticateSuperAdmin, createSubject);
router.put("/subjects/:id", authenticateSuperAdmin, updateSubject);
router.delete("/subjects/:id", authenticateSuperAdmin, deleteSubject);

export default router;
