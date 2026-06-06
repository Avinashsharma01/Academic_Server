import Session from "../Models/SessionModel.js";
import Course from "../Models/CourseModel.js";
import Branch from "../Models/BranchModel.js";
import Semester from "../Models/SemesterModel.js";
import Subject from "../Models/SubjectModel.js";

// ===================== SESSIONS =====================
export const getSessions = async (req, res) => {
    try {
        const sessions = await Session.find({ isActive: true }).sort({ year: -1 });
        res.status(200).json(sessions);
    } catch (error) {
        console.error("Get sessions error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const createSession = async (req, res) => {
    try {
        const { year, startYear, endYear } = req.body;
        if (!year || !startYear || !endYear) {
            return res.status(400).json({ message: "year, startYear, and endYear are required" });
        }
        const existing = await Session.findOne({ year });
        if (existing) return res.status(400).json({ message: `Session ${year} already exists` });

        const session = new Session({ year, startYear, endYear, createdBy: req.superAdmin.id });
        await session.save();
        res.status(201).json({ message: "Session created", session });
    } catch (error) {
        console.error("Create session error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const updateSession = async (req, res) => {
    try {
        const { id } = req.params;
        const session = await Session.findByIdAndUpdate(id, req.body, { new: true });
        if (!session) return res.status(404).json({ message: "Session not found" });
        res.status(200).json({ message: "Session updated", session });
    } catch (error) {
        console.error("Update session error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const deleteSession = async (req, res) => {
    try {
        const { id } = req.params;
        const session = await Session.findByIdAndDelete(id);
        if (!session) return res.status(404).json({ message: "Session not found" });
        res.status(200).json({ message: "Session deleted" });
    } catch (error) {
        console.error("Delete session error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ===================== COURSES =====================
export const getCourses = async (req, res) => {
    try {
        const courses = await Course.find({ isActive: true }).sort({ name: 1 });
        res.status(200).json(courses);
    } catch (error) {
        console.error("Get courses error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const createCourse = async (req, res) => {
    try {
        const { name, description, code, icon, color } = req.body;
        if (!name || !code) {
            return res.status(400).json({ message: "name and code are required" });
        }
        const existing = await Course.findOne({ code: code.toLowerCase() });
        if (existing) return res.status(400).json({ message: `Course ${name} already exists` });

        const course = new Course({ name, description, code, icon, color, createdBy: req.superAdmin.id });
        await course.save();
        res.status(201).json({ message: "Course created", course });
    } catch (error) {
        console.error("Create course error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const updateCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const course = await Course.findByIdAndUpdate(id, req.body, { new: true });
        if (!course) return res.status(404).json({ message: "Course not found" });
        res.status(200).json({ message: "Course updated", course });
    } catch (error) {
        console.error("Update course error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;
        // Also delete related branches, semesters, subjects
        await Branch.deleteMany({ course: id });
        await Semester.deleteMany({ course: id });
        await Subject.deleteMany({ course: id });
        const course = await Course.findByIdAndDelete(id);
        if (!course) return res.status(404).json({ message: "Course not found" });
        res.status(200).json({ message: "Course and related data deleted" });
    } catch (error) {
        console.error("Delete course error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ===================== BRANCHES =====================
export const getBranches = async (req, res) => {
    try {
        const filter = { isActive: true };
        if (req.query.course) filter.course = req.query.course;
        const branches = await Branch.find(filter).populate("course", "name code").sort({ name: 1 });
        res.status(200).json(branches);
    } catch (error) {
        console.error("Get branches error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const createBranch = async (req, res) => {
    try {
        const { name, fullName, code, course } = req.body;
        if (!name || !code || !course) {
            return res.status(400).json({ message: "name, code, and course are required" });
        }
        const existing = await Branch.findOne({ name, course });
        if (existing) return res.status(400).json({ message: `Branch ${name} already exists in this course` });

        const branch = new Branch({ name, fullName, code, course, createdBy: req.superAdmin.id });
        await branch.save();
        res.status(201).json({ message: "Branch created", branch });
    } catch (error) {
        console.error("Create branch error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const updateBranch = async (req, res) => {
    try {
        const { id } = req.params;
        const branch = await Branch.findByIdAndUpdate(id, req.body, { new: true });
        if (!branch) return res.status(404).json({ message: "Branch not found" });
        res.status(200).json({ message: "Branch updated", branch });
    } catch (error) {
        console.error("Update branch error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const deleteBranch = async (req, res) => {
    try {
        const { id } = req.params;
        await Subject.deleteMany({ branch: id });
        const branch = await Branch.findByIdAndDelete(id);
        if (!branch) return res.status(404).json({ message: "Branch not found" });
        res.status(200).json({ message: "Branch and related subjects deleted" });
    } catch (error) {
        console.error("Delete branch error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ===================== SEMESTERS =====================
export const getSemesters = async (req, res) => {
    try {
        const filter = { isActive: true };
        if (req.query.course) filter.course = req.query.course;
        const semesters = await Semester.find(filter).populate("course", "name code").sort({ number: 1 });
        res.status(200).json(semesters);
    } catch (error) {
        console.error("Get semesters error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const createSemester = async (req, res) => {
    try {
        const { name, number, course } = req.body;
        if (!name || !number || !course) {
            return res.status(400).json({ message: "name, number, and course are required" });
        }
        const existing = await Semester.findOne({ number, course });
        if (existing) return res.status(400).json({ message: `Semester ${number} already exists for this course` });

        const semester = new Semester({ name, number, course, createdBy: req.superAdmin.id });
        await semester.save();
        res.status(201).json({ message: "Semester created", semester });
    } catch (error) {
        console.error("Create semester error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const updateSemester = async (req, res) => {
    try {
        const { id } = req.params;
        const semester = await Semester.findByIdAndUpdate(id, req.body, { new: true });
        if (!semester) return res.status(404).json({ message: "Semester not found" });
        res.status(200).json({ message: "Semester updated", semester });
    } catch (error) {
        console.error("Update semester error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const deleteSemester = async (req, res) => {
    try {
        const { id } = req.params;
        await Subject.deleteMany({ semester: id });
        const semester = await Semester.findByIdAndDelete(id);
        if (!semester) return res.status(404).json({ message: "Semester not found" });
        res.status(200).json({ message: "Semester and related subjects deleted" });
    } catch (error) {
        console.error("Delete semester error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ===================== SUBJECTS =====================
export const getSubjects = async (req, res) => {
    try {
        const filter = { isActive: true };
        if (req.query.branch) filter.branch = req.query.branch;
        if (req.query.semester) filter.semester = req.query.semester;
        if (req.query.course) filter.course = req.query.course;
        const subjects = await Subject.find(filter)
            .populate("branch", "name code")
            .populate("semester", "name number")
            .populate("course", "name code")
            .sort({ name: 1 });
        res.status(200).json(subjects);
    } catch (error) {
        console.error("Get subjects error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const createSubject = async (req, res) => {
    try {
        const { name, code, branch, semester, course } = req.body;
        if (!name || !branch || !semester || !course) {
            return res.status(400).json({ message: "name, branch, semester, and course are required" });
        }
        const existing = await Subject.findOne({ name, branch, semester });
        if (existing) return res.status(400).json({ message: `Subject ${name} already exists for this branch/semester` });

        const subject = new Subject({ name, code, branch, semester, course, createdBy: req.superAdmin.id });
        await subject.save();
        res.status(201).json({ message: "Subject created", subject });
    } catch (error) {
        console.error("Create subject error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const updateSubject = async (req, res) => {
    try {
        const { id } = req.params;
        const subject = await Subject.findByIdAndUpdate(id, req.body, { new: true });
        if (!subject) return res.status(404).json({ message: "Subject not found" });
        res.status(200).json({ message: "Subject updated", subject });
    } catch (error) {
        console.error("Update subject error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const deleteSubject = async (req, res) => {
    try {
        const { id } = req.params;
        const subject = await Subject.findByIdAndDelete(id);
        if (!subject) return res.status(404).json({ message: "Subject not found" });
        res.status(200).json({ message: "Subject deleted" });
    } catch (error) {
        console.error("Delete subject error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
