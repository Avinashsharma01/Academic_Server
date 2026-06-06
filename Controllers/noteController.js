import Note from "../Models/Note.js";
import Admin from "../Models/AdminModel.js";
import Course from "../Models/CourseModel.js";
import Branch from "../Models/BranchModel.js";
import Semester from "../Models/SemesterModel.js";
import Subject from "../Models/SubjectModel.js";
import User from "../Models/UserModel.js";
import Feedback from "../Models/Feedback.js";
import cloudinary from "../Config/cloudinary.js";
import AppError from "../utils/AppError.js";
import catchAsync from "../utils/catchAsync.js";

// Upload a Note (Admin only)
export const uploadNote = catchAsync(async (req, res) => {
    const { title, description, session, course, branch, semester, subject } = req.body;

    if (!title || !description || !course || !semester || !session || !subject) {
        throw new AppError("All fields are required", 400);
    }

    if (!req.file) {
        throw new AppError("File is required", 400);
    }

    const cloudinaryId = req.file.filename || req.file.public_id;
    if (!cloudinaryId) {
        throw new AppError("Cloudinary file identifier missing", 500);
    }

    const admin = await Admin.findById(req.user.id).select("course department");
    if (!admin) {
        throw new AppError("Admin not found", 403);
    }

    if ((course || "").toLowerCase() !== (admin.course || "").toLowerCase()) {
        throw new AppError("You can upload notes only for your assigned course", 403);
    }

    const courseDoc = await Course.findOne({
        name: { $regex: `^${admin.course}$`, $options: "i" },
        isActive: true,
    });

    if (!courseDoc) {
        throw new AppError("Assigned course is not active", 400);
    }

    let semesterDoc = await Semester.findOne({
        name: { $regex: `^${semester}$`, $options: "i" },
        course: courseDoc._id,
        isActive: true,
    });

    if (!semesterDoc) {
        const semesterNumber = Number(String(semester).replace(/[^0-9]/g, ""));
        if (!Number.isNaN(semesterNumber) && semesterNumber > 0) {
            semesterDoc = await Semester.findOne({
                number: semesterNumber,
                course: courseDoc._id,
                isActive: true,
            });
        }
    }

    if (!semesterDoc) {
        throw new AppError("Invalid semester for selected course", 400);
    }

    const courseBranches = await Branch.find({ course: courseDoc._id, isActive: true }).select("name");
    const hasGeneralOnlyBranch =
        courseBranches.length === 1 &&
        courseBranches[0].name.toLowerCase() === "general";

    const adminDepartment = (admin.department || "").trim();
    let requestedBranch = (branch || "").trim();

    if (adminDepartment) {
        requestedBranch = adminDepartment;
    }

    if (!requestedBranch && hasGeneralOnlyBranch) {
        requestedBranch = "General";
    }

    if (!requestedBranch && courseBranches.length > 0) {
        throw new AppError("Branch/Department is required for this course", 400);
    }

    let branchDoc = null;
    if (requestedBranch) {
        branchDoc = await Branch.findOne({
            name: { $regex: `^${requestedBranch}$`, $options: "i" },
            course: courseDoc._id,
            isActive: true,
        });

        if (!branchDoc) {
            throw new AppError("Invalid department/branch for selected course", 400);
        }
    }

    const subjectFilter = {
        name: { $regex: `^${subject}$`, $options: "i" },
        semester: semesterDoc._id,
        course: courseDoc._id,
        isActive: true,
    };

    if (branchDoc) {
        subjectFilter.branch = branchDoc._id;
    }

    const subjectDoc = await Subject.findOne(subjectFilter);
    if (!subjectDoc) {
        throw new AppError("Invalid subject for selected course/semester/branch", 400);
    }

    const newNote = new Note({
        title,
        description,
        fileUrl: req.file.path,
        cloudinaryId,
        uploadedBy: req.user.id,
        uploaderModel: "Admin",
        session,
        course: courseDoc.name,
        branch: branchDoc?.name || requestedBranch,
        semester: semesterDoc.name,
        subject: subjectDoc.name,
    });

    await newNote.save();
    res.status(201).json({ message: "Note uploaded successfully!", note: newNote });
});

// Get all notes
export const getNotes = catchAsync(async (req, res) => {
    const { uploaderId } = req.query;
    const filter = {};

    if (uploaderId) {
        filter.uploadedBy = uploaderId;
        filter.uploaderModel = "Admin";
    }

    const notes = await Note.find(filter).populate("uploadedBy", "name email");
    res.status(200).json(notes);
});

// Delete Note (Admin Only)
export const deleteNote = catchAsync(async (req, res) => {
    const noteId = req.params.id;
    const note = await Note.findById(noteId);

    if (!note) {
        throw new AppError("Note not found", 404);
    }

    await cloudinary.uploader.destroy(note.cloudinaryId);
    await Note.findByIdAndDelete(noteId);

    res.status(200).json({ message: "Note deleted successfully!" });
});

// Update Note (Admin Only)
export const updateNote = catchAsync(async (req, res) => {
    const noteId = req.params.id;
    const { title, description } = req.body;

    const note = await Note.findById(noteId);
    if (!note) {
        throw new AppError("Note not found", 404);
    }

    note.title = title || note.title;
    note.description = description || note.description;

    if (req.file) {
        const newCloudinaryId = req.file.filename || req.file.public_id;
        if (!newCloudinaryId) {
            throw new AppError("Cloudinary file identifier missing", 500);
        }

        await cloudinary.uploader.destroy(note.cloudinaryId);
        note.fileUrl = req.file.path;
        note.cloudinaryId = newCloudinaryId;
    }

    await note.save();
    res.status(200).json({ message: "Note updated successfully!", note });
});

export const searchNotes = catchAsync(async (req, res) => {
    const { query, subject, course, semester, branch, session, page, limit, uploaderId } = req.query;

    const filter = {};

    if (uploaderId) {
        filter.uploadedBy = uploaderId;
        filter.uploaderModel = "Admin";
    }

    if (query && String(query).trim()) {
        filter.$text = { $search: String(query).trim() };
    }

    if (subject) filter.subject = { $regex: `^${subject}$`, $options: "i" };
    if (course) filter.course = { $regex: `^${course}$`, $options: "i" };
    if (semester) filter.semester = { $regex: `^${semester}$`, $options: "i" };
    if (branch) filter.branch = { $regex: `^${branch}$`, $options: "i" };
    if (session) filter.session = { $regex: `^${session}$`, $options: "i" };

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    let noteQuery = Note.find(filter)
        .populate("uploadedBy", "name email")
        .skip(skip)
        .limit(limitNum);

    if (filter.$text) {
        noteQuery = noteQuery
            .select({ score: { $meta: "textScore" } })
            .sort({ score: { $meta: "textScore" }, createdAt: -1 });
    } else {
        noteQuery = noteQuery.sort({ createdAt: -1 });
    }

    const notes = await noteQuery;
    res.status(200).json(notes);
});

export const getPublicHomeData = catchAsync(async (req, res) => {
    const [latestNotes, studentsCount, notesCount, subjectsCount, branchesCount, feedbacks] = await Promise.all([
        Note.find({})
            .populate("uploadedBy", "name")
            .select("title description fileUrl session course branch semester subject createdAt uploadedBy")
            .sort({ createdAt: -1 })
            .limit(4),
        User.countDocuments({ isVerified: true }),
        Note.countDocuments({}),
        Subject.countDocuments({ isActive: true }),
        Branch.countDocuments({ isActive: true }),
        Feedback.find({})
            .populate("user", "name course branch")
            .select("message rating createdAt user")
            .sort({ createdAt: -1 })
            .limit(3),
    ]);

    const testimonials = feedbacks.map((item) => ({
        _id: item._id,
        message: item.message,
        rating: item.rating,
        createdAt: item.createdAt,
        user: {
            name: item.user?.name || "Student",
            course: item.user?.course || "",
            branch: item.user?.branch || "",
        },
    }));

    return res.status(200).json({
        latestNotes,
        stats: {
            students: studentsCount,
            notes: notesCount,
            subjects: subjectsCount,
            branches: branchesCount,
        },
        testimonials,
    });
});
