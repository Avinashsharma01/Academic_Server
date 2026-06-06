/**
 * Seed Script — Academic Data
 * Inserts Sessions, Courses, Branches, Semesters, Subjects into MongoDB
 *
 * Run with:  node --env-file=.env scripts/seedAcademicData.js
 * OR:        node -r dotenv/config scripts/seedAcademicData.js
 */

import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import mongoose from "mongoose";

// Load .env from Server root
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, "../.env") });

// ── Models ──────────────────────────────────────────────────────────────────
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

// ── Connect ──────────────────────────────────────────────────────────────────
async function connect() {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error("MONGO_URI not found in .env");
    await mongoose.connect(uri);
    console.log("✅  Connected to MongoDB");
}

// ── Seed data definitions ─────────────────────────────────────────────────────

const SESSIONS = [
    { year: 2020, startYear: 2020, endYear: 2024 },
    { year: 2021, startYear: 2021, endYear: 2025 },
    { year: 2022, startYear: 2022, endYear: 2026 },
    { year: 2023, startYear: 2023, endYear: 2027 },
    { year: 2024, startYear: 2024, endYear: 2028 },
    { year: 2025, startYear: 2025, endYear: 2029 },
    { year: 2026, startYear: 2026, endYear: 2030 },
];

const COURSES = [
    { name: "B.Tech", code: "btech", description: "Bachelor of Technology", icon: "graduation-cap", color: "blue" },
    { name: "M.Tech", code: "mtech", description: "Master of Technology", icon: "book", color: "indigo" },
    { name: "BCA", code: "bca", description: "Bachelor of Computer Applications", icon: "desktop", color: "purple" },
    { name: "MCA", code: "mca", description: "Master of Computer Applications", icon: "desktop", color: "violet" },
    { name: "B.Sc", code: "bsc", description: "Bachelor of Science", icon: "flask", color: "green" },
    { name: "M.Sc", code: "msc", description: "Master of Science", icon: "microscope", color: "teal" },
    { name: "BBA", code: "bba", description: "Bachelor of Business Administration", icon: "briefcase", color: "yellow" },
    { name: "MBA", code: "mba", description: "Master of Business Administration", icon: "chart-line", color: "orange" },
];

// branchDefs[courseCode] = [ { name, fullName, code } ]
const BRANCH_DEFS = {
    btech: [
        { name: "CSE", fullName: "Computer Science & Engineering", code: "cse" },
        { name: "IT", fullName: "Information Technology", code: "it" },
        { name: "AI/ML", fullName: "Artificial Intelligence & Machine Learning", code: "aiml" },
        { name: "Civil", fullName: "Civil Engineering", code: "civil" },
        { name: "Mechanical", fullName: "Mechanical Engineering", code: "me" },
        { name: "ECE", fullName: "Electronics & Communication Engineering", code: "ece" },
        { name: "EEE", fullName: "Electrical & Electronics Engineering", code: "eee" },
        { name: "FT", fullName: "Fashion Technology", code: "ft" },
    ],
    mtech: [
        { name: "CSE", fullName: "Computer Science & Engineering", code: "cse" },
        { name: "VLSI", fullName: "VLSI Design", code: "vlsi" },
        { name: "Power Systems", fullName: "Power Systems Engineering", code: "ps" },
    ],
    bca: [
        { name: "General", fullName: "Bachelor of Computer Applications", code: "gen" },
    ],
    mca: [
        { name: "General", fullName: "Master of Computer Applications", code: "gen" },
    ],
    bsc: [
        { name: "Physics", fullName: "Bachelor of Science – Physics", code: "phy" },
        { name: "Chemistry", fullName: "Bachelor of Science – Chemistry", code: "chem" },
        { name: "Maths", fullName: "Bachelor of Science – Mathematics", code: "maths" },
    ],
    msc: [
        { name: "Physics", fullName: "Master of Science – Physics", code: "phy" },
        { name: "Chemistry", fullName: "Master of Science – Chemistry", code: "chem" },
    ],
    bba: [
        { name: "General", fullName: "Bachelor of Business Administration", code: "gen" },
        { name: "Finance", fullName: "BBA – Finance", code: "fin" },
    ],
    mba: [
        { name: "General", fullName: "Master of Business Administration", code: "gen" },
        { name: "Marketing", fullName: "MBA – Marketing", code: "mkt" },
    ],
};

// Semesters per course (4-year = 8 sem, 2-year = 4 sem)
function buildSemesters(code) {
    const count = ["mtech", "mca", "msc", "mba"].includes(code) ? 4 : 8;
    const suffix = ["st", "nd", "rd", "th", "th", "th", "th", "th"];
    return Array.from({ length: count }, (_, i) => ({
        name: `Semester ${i + 1}`,
        number: i + 1,
    }));
}

// Subjects per branch/semester
const SUBJECT_MAP = {
    "CSE": {
        1: ["Engineering Mathematics I", "Physics", "Chemistry", "Programming for Problem Solving", "Basic Electrical Engineering", "Engineering Graphics", "Communication Skills"],
        2: ["Engineering Mathematics II", "Data Structures", "Digital Logic Design", "Computer Organization", "Basic Electronics", "Environmental Science"],
        3: ["Object Oriented Programming", "Database Management Systems", "Operating Systems", "Discrete Mathematics", "Computer Networks", "OOP Lab"],
        4: ["Software Engineering", "Compiler Design", "Computer Architecture", "Microprocessors", "DBMS Lab", "Networks Lab"],
        5: ["Machine Learning", "Cloud Computing", "Blockchain Technology", "Web Development", "Mobile Computing", "ML Lab"],
        6: ["Deep Learning", "Big Data Analytics", "Cyber Security", "Internet of Things", "Distributed Systems", "Security Lab"],
        7: ["Artificial Intelligence", "Natural Language Processing", "Computer Vision", "Quantum Computing", "Elective I"],
        8: ["Capstone Project", "IT Ethics", "Entrepreneurship & Innovation", "Industry Internship"],
    },
    "IT": {
        1: ["Engineering Mathematics I", "Physics", "Programming Fundamentals", "Basic Electrical Engineering", "Engineering Drawing", "Environmental Science"],
        2: ["Engineering Mathematics II", "Data Structures & Algorithms", "Digital Logic Design", "Engineering Mechanics", "Communication Skills"],
        3: ["Object Oriented Programming", "Database Management Systems", "Computer Networks", "Operating Systems", "Design & Analysis of Algorithms"],
        4: ["Theory of Computation", "Software Engineering", "Microprocessors", "DBMS Lab", "Networks Lab"],
        5: ["Artificial Intelligence", "Compiler Design", "Cloud Computing", "Web Technologies", "Computer Graphics"],
        6: ["Big Data Analytics", "Cyber Security", "Internet of Things (IoT)", "Blockchain Technology", "Software Testing"],
        7: ["Deep Learning", "Natural Language Processing", "Augmented & Virtual Reality", "Data Science", "Elective I"],
        8: ["Capstone Project", "IT Ethics", "IT Innovation & Entrepreneurship", "Industry Internship"],
    },
    "AI/ML": {
        1: ["Engineering Mathematics I", "Physics", "Programming Fundamentals", "Statistics & Probability", "Engineering Drawing"],
        2: ["Engineering Mathematics II", "Data Structures", "Linear Algebra", "Introduction to AI", "Python Programming"],
        3: ["Machine Learning Algorithms", "Database Systems", "Computer Vision Basics", "Python for Data Science", "Statistics for ML"],
        4: ["Deep Learning", "NLP Fundamentals", "Reinforcement Learning", "MLOps", "Research Methodology"],
        5: ["Advanced Deep Learning", "Computer Vision", "Speech Processing", "Generative AI", "Elective I"],
        6: ["Big Data & Distributed ML", "Ethical AI", "Edge AI & IoT", "Advanced NLP", "Elective II"],
        7: ["AI System Design", "Capstone Research", "Industry Project", "Quantum ML"],
        8: ["Major Project", "Entrepreneurship in AI", "Industry Internship"],
    },
    "Civil": {
        1: ["Engineering Mathematics I", "Physics", "Engineering Drawing", "Surveying", "Basic Electrical Engineering"],
        2: ["Engineering Mathematics II", "Fluid Mechanics", "Structural Analysis I", "Building Materials", "Surveying Lab"],
        3: ["Structural Analysis II", "Geotechnical Engineering", "Transportation Engineering", "Hydraulics", "CAD Lab"],
        4: ["Design of Structures", "Environmental Engineering", "Estimation & Costing", "Concrete Technology"],
        5: ["Foundation Engineering", "Highway Engineering", "Water Resources", "Construction Management"],
        6: ["Advanced Structural Design", "Remote Sensing & GIS", "Steel Structures", "Earthquake Engineering"],
        7: ["Bridge Engineering", "Project Management", "Elective I", "Seminar"],
        8: ["Capstone Project", "Urban Planning", "Industry Internship"],
    },
    "Mechanical": {
        1: ["Engineering Mathematics I", "Physics", "Engineering Drawing", "Workshop Practice", "Basic Electrical Engineering"],
        2: ["Engineering Mathematics II", "Thermodynamics", "Engineering Mechanics", "Material Science", "Mechanics of Solids"],
        3: ["Fluid Mechanics", "Manufacturing Technology I", "Kinematics of Machines", "Electrical Machines"],
        4: ["Heat Transfer", "Dynamics of Machines", "Industrial Engineering", "Machine Design I"],
        5: ["Refrigeration & Air Conditioning", "Computer Aided Design", "Metrology", "Finite Element Analysis"],
        6: ["Mechatronics", "Power Plant Engineering", "Operations Research", "Advanced Manufacturing"],
        7: ["Robotics & Automation", "Elective I", "Project I", "Seminar"],
        8: ["Major Project", "Entrepreneurship", "Industry Internship"],
    },
    "ECE": {
        1: ["Engineering Mathematics I", "Physics", "Basic Electronics", "Programming Fundamentals", "Engineering Drawing"],
        2: ["Engineering Mathematics II", "Network Analysis", "Electronic Devices", "Digital Electronics", "Signals & Systems"],
        3: ["Analog Electronics", "Digital Communication", "Electromagnetic Theory", "Control Systems"],
        4: ["Microprocessors", "VLSI Design", "Communication Systems", "Digital Signal Processing"],
        5: ["Wireless Communication", "Antenna & Wave Propagation", "Embedded Systems", "Optical Communication"],
        6: ["Mobile Communication", "Satellite Communication", "IoT", "Advanced VLSI"],
        7: ["5G Technologies", "AI in Communication", "Elective I", "Project"],
        8: ["Major Project", "Industry Seminar", "Internship"],
    },
    "EEE": {
        1: ["Engineering Mathematics I", "Physics", "Basic Electrical Engineering", "Engineering Drawing", "Workshop"],
        2: ["Engineering Mathematics II", "Circuit Theory", "Electromagnetism", "Electronic Devices"],
        3: ["Electrical Machines I", "Power Systems I", "Control Engineering", "Measurements & Instrumentation"],
        4: ["Electrical Machines II", "Power Systems II", "Power Electronics", "Digital Electronics"],
        5: ["High Voltage Engineering", "Switchgear & Protection", "Industrial Drives", "PLC & Automation"],
        6: ["Renewable Energy Systems", "Smart Grid", "Power Quality", "Electric Vehicles"],
        7: ["Advanced Power Electronics", "Elective I", "Project I", "Seminar"],
        8: ["Major Project", "Entrepreneurship", "Industry Internship"],
    },
    "FT": {
        1: ["Textile Science", "Fashion Drawing", "Colour Theory", "History of Costume", "Sewing Technology"],
        2: ["Fabric Construction", "Pattern Making I", "Fashion Illustration", "Textile Testing"],
        3: ["Pattern Making II", "Garment Construction", "Fashion Design Studio", "Merchandising"],
        4: ["Apparel Manufacturing", "Fashion Marketing", "Textile Finishing", "Quality Control"],
        5: ["Fashion Forecasting", "Retail Management", "Advanced Draping", "Sustainable Fashion"],
        6: ["Fashion Entrepreneurship", "Brand Management", "Collection Development", "Advanced Illustration"],
        7: ["Capstone Collection", "Elective I", "Industry Seminar"],
        8: ["Final Project", "Fashion Show", "Industry Internship"],
    },
    "General": {
        1: ["Mathematics I", "Communication Skills", "Computer Fundamentals", "Physics/Chemistry"],
        2: ["Mathematics II", "Programming in C", "Data Structures", "Digital Logic"],
        3: ["OOP with Java", "Database Management", "Operating Systems", "Networking Basics"],
        4: ["Software Engineering", "Web Technologies", "Elective I", "Project I"],
    },
};

// ── Main seeding function ─────────────────────────────────────────────────────
async function seed() {
    await connect();

    // ── 1. Sessions ──────────────────────────────────────────────────────────
    console.log("\n📅  Seeding Sessions...");
    let sessionCount = 0;
    for (const s of SESSIONS) {
        const exists = await Session.findOne({ year: s.year });
        if (!exists) {
            await Session.create(s);
            console.log(`   ✔  Session ${s.year} (${s.startYear}–${s.endYear})`);
            sessionCount++;
        } else {
            console.log(`   ⚠  Session ${s.year} already exists – skipped`);
        }
    }

    // ── 2. Courses ───────────────────────────────────────────────────────────
    console.log("\n🎓  Seeding Courses...");
    const courseMap = {}; // code → document
    let courseCount = 0;
    for (const c of COURSES) {
        let doc = await Course.findOne({ code: c.code });
        if (!doc) {
            doc = await Course.create(c);
            console.log(`   ✔  ${c.name} (${c.code})`);
            courseCount++;
        } else {
            console.log(`   ⚠  ${c.name} already exists – skipped`);
        }
        courseMap[c.code] = doc;
    }

    // ── 3. Branches ──────────────────────────────────────────────────────────
    console.log("\n🌿  Seeding Branches...");
    const branchMap = {}; // `${courseCode}__${branchCode}` → document
    let branchCount = 0;
    for (const [courseCode, defs] of Object.entries(BRANCH_DEFS)) {
        const courseDoc = courseMap[courseCode];
        if (!courseDoc) { console.log(`   ⚠  Course ${courseCode} not found`); continue; }
        for (const b of defs) {
            let doc = await Branch.findOne({ code: b.code, course: courseDoc._id });
            if (!doc) {
                doc = await Branch.create({ ...b, course: courseDoc._id });
                console.log(`   ✔  ${courseCode.toUpperCase()} / ${b.name}`);
                branchCount++;
            } else {
                console.log(`   ⚠  ${courseCode.toUpperCase()} / ${b.name} already exists – skipped`);
            }
            branchMap[`${courseCode}__${b.code}`] = doc;
        }
    }

    // ── 4. Semesters ─────────────────────────────────────────────────────────
    console.log("\n📚  Seeding Semesters...");
    const semesterMap = {}; // `${courseCode}__${number}` → document
    let semesterCount = 0;
    for (const c of COURSES) {
        const courseDoc = courseMap[c.code];
        if (!courseDoc) continue;
        const sems = buildSemesters(c.code);
        for (const s of sems) {
            let doc = await Semester.findOne({ number: s.number, course: courseDoc._id });
            if (!doc) {
                doc = await Semester.create({ ...s, course: courseDoc._id });
                console.log(`   ✔  ${c.name} / ${s.name}`);
                semesterCount++;
            } else {
                console.log(`   ⚠  ${c.name} / ${s.name} already exists – skipped`);
            }
            semesterMap[`${c.code}__${s.number}`] = doc;
        }
    }

    // ── 5. Subjects ──────────────────────────────────────────────────────────
    console.log("\n📖  Seeding Subjects...");
    let subjectCount = 0;

    // B.Tech branches with their specific subjects
    const btechBranches = BRANCH_DEFS["btech"];
    for (const branchDef of btechBranches) {
        const branchDoc = branchMap[`btech__${branchDef.code}`];
        if (!branchDoc) continue;
        const courseDoc = courseMap["btech"];

        const subjectList = SUBJECT_MAP[branchDef.name] || SUBJECT_MAP["General"];
        for (const [semNum, subjects] of Object.entries(subjectList)) {
            const semDoc = semesterMap[`btech__${semNum}`];
            if (!semDoc) continue;
            for (const subName of subjects) {
                const exists = await Subject.findOne({ name: subName, branch: branchDoc._id, semester: semDoc._id });
                if (!exists) {
                    await Subject.create({
                        name: subName,
                        branch: branchDoc._id,
                        semester: semDoc._id,
                        course: courseDoc._id,
                    });
                    subjectCount++;
                }
            }
        }
        console.log(`   ✔  ${branchDef.name} – ${Object.values(subjectList).flat().length} subjects`);
    }

    // BCA, MCA — use General subject map with 4 semesters remapped to 6
    for (const code of ["bca", "mca"]) {
        const courseDoc = courseMap[code];
        if (!courseDoc) continue;
        const branchDoc = branchMap[`${code}__gen`];
        if (!branchDoc) continue;
        const maxSem = code === "bca" ? 6 : 4;
        for (let sem = 1; sem <= maxSem; sem++) {
            const semDoc = semesterMap[`${code}__${sem}`];
            if (!semDoc) continue;
            const subjectList = SUBJECT_MAP["General"][Math.min(sem, 4)] || [];
            for (const subName of subjectList) {
                const exists = await Subject.findOne({ name: subName, branch: branchDoc._id, semester: semDoc._id });
                if (!exists) {
                    await Subject.create({ name: subName, branch: branchDoc._id, semester: semDoc._id, course: courseDoc._id });
                    subjectCount++;
                }
            }
        }
        console.log(`   ✔  ${code.toUpperCase()} – General subjects seeded`);
    }

    // ── Summary ───────────────────────────────────────────────────────────────
    console.log("\n🎉  Seeding Complete!");
    console.log(`   Sessions : ${sessionCount} created`);
    console.log(`   Courses  : ${courseCount} created`);
    console.log(`   Branches : ${branchCount} created`);
    console.log(`   Semesters: ${semesterCount} created`);
    console.log(`   Subjects : ${subjectCount} created`);
    console.log("\nAll data is now live in MongoDB. 🚀\n");
}

seed()
    .catch((err) => {
        console.error("❌  Seed failed:", err);
        process.exit(1);
    })
    .finally(() => mongoose.disconnect());
