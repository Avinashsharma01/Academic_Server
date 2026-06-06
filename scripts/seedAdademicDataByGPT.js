/**
 * Seed Script — Academic Data (Indian University Standard)
 * Inserts Sessions, Courses, Branches, Semesters, Subjects into MongoDB
 *
 * Run with:
 * node --env-file=.env scripts/seedAcademicData.js
 */

import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import mongoose from "mongoose";

/* ── ENV SETUP ───────────────────────────────────────────── */
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, "../.env") });

/* ── MODELS ──────────────────────────────────────────────── */
import "../Models/SessionModel.js";
import "../Models/CourseModel.js";
import "../Models/BranchModel.js";
import "../Models/SemesterModel.js";
import "../Models/SubjectModel.js";

const Session = mongoose.model("Session");
const Course = mongoose.model("Course");
const Branch = mongoose.model("Branch");
const Semester = mongoose.model("Semester");
const Subject = mongoose.model("Subject");

/* ── DB CONNECT ──────────────────────────────────────────── */
async function connect() {
    if (!process.env.MONGO_URI) throw new Error("MONGO_URI missing");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");
}

/* ── SESSIONS ────────────────────────────────────────────── */
const SESSIONS = [
    { year: 2020, startYear: 2020, endYear: 2024 },
    { year: 2021, startYear: 2021, endYear: 2025 },
    { year: 2022, startYear: 2022, endYear: 2026 },
    { year: 2023, startYear: 2023, endYear: 2027 },
    { year: 2024, startYear: 2024, endYear: 2028 },
    { year: 2025, startYear: 2025, endYear: 2029 },
];

/* ── COURSES (INDIAN STANDARD) ───────────────────────────── */
const COURSES = [
    { name: "B.Tech", code: "btech", description: "Bachelor of Technology" },
    { name: "M.Tech", code: "mtech", description: "Master of Technology" },
    { name: "BCA", code: "bca", description: "Bachelor of Computer Applications" },
    { name: "MCA", code: "mca", description: "Master of Computer Applications" },
    { name: "B.Sc", code: "bsc", description: "Bachelor of Science" },
    { name: "M.Sc", code: "msc", description: "Master of Science" },
    { name: "BBA", code: "bba", description: "Bachelor of Business Administration" },
    { name: "MBA", code: "mba", description: "Master of Business Administration" },
];

/* ── BRANCHES ────────────────────────────────────────────── */
const BRANCH_DEFS = {
    btech: [
        { name: "CSE", code: "cse" },
        { name: "IT", code: "it" },
        { name: "ECE", code: "ece" },
        { name: "EEE", code: "eee" },
        { name: "Mechanical", code: "me" },
        { name: "Civil", code: "civil" },
    ],
    mtech: [{ name: "CSE", code: "cse" }],
    bca: [{ name: "General", code: "gen" }],
    mca: [{ name: "General", code: "gen" }],
    bsc: [{ name: "General", code: "gen" }],
    msc: [{ name: "General", code: "gen" }],
    bba: [{ name: "General", code: "gen" }],
    mba: [{ name: "General", code: "gen" }],
};

/* ── SEMESTER COUNT (FIXED) ──────────────────────────────── */
const SEMESTER_MAP = {
    btech: 8,
    mtech: 4,
    bca: 6,
    mca: 4,
    bsc: 6,
    msc: 4,
    bba: 6,
    mba: 4,
};

function buildSemesters(code) {
    return Array.from({ length: SEMESTER_MAP[code] }, (_, i) => ({
        name: `Semester ${i + 1}`,
        number: i + 1,
    }));
}

/* ── SUBJECTS (INDIAN REALITY) ───────────────────────────── */
const SUBJECT_MAP = {
    BTECH_CSE: {
        1: ["Engineering Mathematics I", "Physics", "Programming in C", "Basic Electrical Engineering"],
        2: ["Engineering Mathematics II", "Data Structures", "Digital Electronics"],
        3: ["OOP with Java", "DBMS", "Discrete Mathematics"],
        4: ["Operating Systems", "Computer Networks", "Software Engineering"],
        5: ["Web Technologies", "Machine Learning", "Compiler Design"],
        6: ["Cloud Computing", "Cyber Security", "Big Data"],
        7: ["AI", "Elective I", "Mini Project"],
        8: ["Major Project", "Internship"],
    },

    BCA: {
        1: ["Computer Fundamentals", "Programming in C", "Mathematics"],
        2: ["Data Structures", "OOP with C++", "Digital Logic"],
        3: ["Java Programming", "DBMS", "Operating Systems"],
        4: ["Web Technologies", "Python Programming"],
        5: ["Mobile App Development", "Cloud Computing"],
        6: ["Major Project", "Internship"],
    },

    MCA: {
        1: ["Advanced Programming", "Discrete Mathematics"],
        2: ["DBMS", "Operating Systems", "Computer Networks"],
        3: ["Web & Cloud Computing", "AI"],
        4: ["Major Project"],
    },

    BBA: {
        1: ["Principles of Management", "Business Economics"],
        2: ["Financial Accounting", "Business Law"],
        3: ["Marketing Management", "HR Management"],
        4: ["Operations Management", "Entrepreneurship"],
        5: ["Strategic Management", "Elective"],
        6: ["Project & Internship"],
    },

    MBA: {
        1: ["Management Principles", "Accounting"],
        2: ["Marketing", "Finance"],
        3: ["HR", "Operations"],
        4: ["Major Project"],
    },
};

/* ── SEED FUNCTION ───────────────────────────────────────── */
async function seed() {
    await connect();

    /* Sessions */
    for (const s of SESSIONS)
        await Session.updateOne({ year: s.year }, s, { upsert: true });

    /* Courses */
    const courseMap = {};
    for (const c of COURSES)
        courseMap[c.code] = await Course.findOneAndUpdate(
            { code: c.code },
            c,
            { upsert: true, new: true }
        );

    /* Branches */
    const branchMap = {};
    for (const [courseCode, branches] of Object.entries(BRANCH_DEFS)) {
        for (const b of branches) {
            const doc = await Branch.findOneAndUpdate(
                { code: b.code, course: courseMap[courseCode]._id },
                { ...b, course: courseMap[courseCode]._id },
                { upsert: true, new: true }
            );
            branchMap[`${courseCode}_${b.code}`] = doc;
        }
    }

    /* Semesters */
    const semesterMap = {};
    for (const code of Object.keys(SEMESTER_MAP)) {
        for (const s of buildSemesters(code)) {
            const doc = await Semester.findOneAndUpdate(
                { number: s.number, course: courseMap[code]._id },
                { ...s, course: courseMap[code]._id },
                { upsert: true, new: true }
            );
            semesterMap[`${code}_${s.number}`] = doc;
        }
    }

    /* Subjects */
    for (const [key, sems] of Object.entries(SUBJECT_MAP)) {
        // key examples: "BTECH_CSE", "BCA", "MBA"
        const parts = key.split("_");
        const courseCode = parts[0].toLowerCase();                       // "btech" / "bca" / "mba"
        const branchCode = (parts[1] ?? "gen").toLowerCase();           // "cse"  / "gen"

        const branch = branchMap[`${courseCode}_${branchCode}`];
        if (!branch) {
            console.warn(`⚠  Branch not found for key "${key}" → branchMap["${courseCode}_${branchCode}"] — skipping`);
            continue;
        }

        for (const [sem, subs] of Object.entries(sems)) {
            const semDoc = semesterMap[`${courseCode}_${sem}`];
            if (!semDoc) {
                console.warn(`⚠  Semester ${sem} not found for course "${courseCode}" — skipping`);
                continue;
            }

            for (const name of subs) {
                await Subject.updateOne(
                    { name, semester: semDoc._id, branch: branch._id },
                    {
                        name,
                        course: courseMap[courseCode]._id,
                        semester: semDoc._id,
                        branch: branch._id,
                    },
                    { upsert: true }
                );
            }
        }
        console.log(`   ✔  Subjects seeded for ${key}`);
    }

    console.log("🎉 Academic data seeded successfully");
    mongoose.disconnect();
}

seed().catch(err => {
    console.error(err);
    mongoose.disconnect();
});