/**
 * Fresh Seed Script — Wipes all academic data then re-inserts clean data
 * Run with: node scripts/freshSeed.js
 */

import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, "../.env") });

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

// ─── DATA ────────────────────────────────────────────────────────────────────

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
    { name: "B.Tech", code: "btech", description: "Bachelor of Technology", color: "blue" },
    { name: "M.Tech", code: "mtech", description: "Master of Technology", color: "indigo" },
    { name: "BCA", code: "bca", description: "Bachelor of Computer Applications", color: "purple" },
    { name: "MCA", code: "mca", description: "Master of Computer Applications", color: "violet" },
    { name: "B.Sc", code: "bsc", description: "Bachelor of Science", color: "green" },
    { name: "M.Sc", code: "msc", description: "Master of Science", color: "teal" },
    { name: "BBA", code: "bba", description: "Bachelor of Business Administration", color: "yellow" },
    { name: "MBA", code: "mba", description: "Master of Business Administration", color: "orange" },
];

// branches per course  →  { courseCode: [{ name, fullName, code }] }
const BRANCH_DEFS = {
    btech: [
        { name: "CSE", fullName: "Computer Science & Engineering", code: "cse" },
        { name: "IT", fullName: "Information Technology", code: "it" },
        { name: "ECE", fullName: "Electronics & Communication Engineering", code: "ece" },
        { name: "EEE", fullName: "Electrical & Electronics Engineering", code: "eee" },
        { name: "Mechanical", fullName: "Mechanical Engineering", code: "me" },
        { name: "Civil", fullName: "Civil Engineering", code: "civil" },
        { name: "AI/ML", fullName: "Artificial Intelligence & Machine Learning", code: "aiml" },
        { name: "FT", fullName: "Fashion Technology", code: "ft" },
    ],
    mtech: [
        { name: "CSE", fullName: "Computer Science & Engineering", code: "cse" },
        { name: "VLSI", fullName: "VLSI Design", code: "vlsi" },
    ],
    bca: [{ name: "General", fullName: "BCA General", code: "gen" }],
    mca: [{ name: "General", fullName: "MCA General", code: "gen" }],
    bsc: [{ name: "General", fullName: "B.Sc General", code: "gen" }],
    msc: [{ name: "General", fullName: "M.Sc General", code: "gen" }],
    bba: [{ name: "General", fullName: "BBA General", code: "gen" }],
    mba: [{ name: "General", fullName: "MBA General", code: "gen" }],
};

// number of semesters per course
const SEM_COUNT = {
    btech: 8, mtech: 4,
    bca: 6, mca: 4,
    bsc: 6, msc: 4,
    bba: 6, mba: 4,
};

// subjects[courseCode][branchCode][semNumber] = [...]
const SUBJECTS = {
    btech: {
        cse: {
            1: ["Engineering Mathematics I", "Physics", "Programming in C", "Basic Electrical Engineering", "Engineering Drawing"],
            2: ["Engineering Mathematics II", "Data Structures", "Digital Electronics", "Basic Electronics", "Environmental Science"],
            3: ["OOP with Java", "Database Management Systems", "Discrete Mathematics", "Computer Organization", "OOP Lab"],
            4: ["Operating Systems", "Computer Networks", "Software Engineering", "Compiler Design", "Networks Lab"],
            5: ["Web Technologies", "Machine Learning", "Cloud Computing", "Mobile Computing", "Web Dev Lab"],
            6: ["Deep Learning", "Cyber Security", "Big Data Analytics", "Internet of Things", "Security Lab"],
            7: ["Artificial Intelligence", "Natural Language Processing", "Quantum Computing", "Elective I", "Mini Project"],
            8: ["Major Project", "IT Ethics", "Entrepreneurship", "Industry Internship"],
        },
        it: {
            1: ["Engineering Mathematics I", "Physics", "Programming Fundamentals", "Basic Electrical Engineering", "Engineering Graphics"],
            2: ["Engineering Mathematics II", "Data Structures & Algorithms", "Digital Logic Design", "Communication Skills", "DS Lab"],
            3: ["OOP", "DBMS", "Operating Systems", "Design & Analysis of Algorithms", "OOP Lab"],
            4: ["Theory of Computation", "Software Engineering", "Computer Networks", "DBMS Lab", "Networks Lab"],
            5: ["AI", "Compiler Design", "Cloud Computing", "Web Technologies", "AI Lab"],
            6: ["Big Data Analytics", "Cyber Security", "Internet of Things", "Blockchain Technology", "IoT Lab"],
            7: ["Deep Learning", "NLP", "Augmented Reality", "Data Science", "Elective I"],
            8: ["Capstone Project", "IT Ethics", "IT Innovation", "Industry Internship"],
        },
        ece: {
            1: ["Engineering Mathematics I", "Physics", "Basic Electronics", "Programming Fundamentals", "Engineering Drawing"],
            2: ["Engineering Mathematics II", "Network Analysis", "Electronic Devices", "Digital Electronics", "Signals & Systems"],
            3: ["Analog Electronics", "Digital Communication", "Electromagnetic Theory", "Control Systems", "Analog Lab"],
            4: ["Microprocessors", "VLSI Design", "Communication Systems", "Digital Signal Processing", "Micro Lab"],
            5: ["Wireless Communication", "Antenna & Wave Propagation", "Embedded Systems", "Optical Communication", "Embedded Lab"],
            6: ["Mobile Communication", "Satellite Communication", "IoT", "Advanced VLSI", "IoT Lab"],
            7: ["5G Technologies", "AI in Communication", "MIMO Systems", "Elective I", "Project I"],
            8: ["Major Project", "Industry Seminar", "Professional Ethics", "Internship"],
        },
        eee: {
            1: ["Engineering Mathematics I", "Physics", "Basic Electrical Engineering", "Engineering Drawing", "Workshop"],
            2: ["Engineering Mathematics II", "Circuit Theory", "Electromagnetism", "Electronic Devices", "Circuit Lab"],
            3: ["Electrical Machines I", "Power Systems I", "Control Engineering", "Measurements & Instrumentation", "Machines Lab"],
            4: ["Electrical Machines II", "Power Systems II", "Power Electronics", "Digital Electronics", "Power Lab"],
            5: ["High Voltage Engineering", "Switchgear & Protection", "Industrial Drives", "PLC & Automation", "Protection Lab"],
            6: ["Renewable Energy Systems", "Smart Grid", "Power Quality", "Electric Vehicles", "Smart Grid Lab"],
            7: ["Advanced Power Electronics", "FACTS", "Elective I", "Project I", "Seminar"],
            8: ["Major Project", "Entrepreneurship", "Professional Ethics", "Industry Internship"],
        },
        me: {
            1: ["Engineering Mathematics I", "Physics", "Engineering Drawing", "Workshop Practice", "Basic Electrical Engineering"],
            2: ["Engineering Mathematics II", "Thermodynamics", "Engineering Mechanics", "Material Science", "Mechanics of Solids"],
            3: ["Fluid Mechanics", "Manufacturing Technology I", "Kinematics of Machines", "Electrical Machines", "Fluid Lab"],
            4: ["Heat Transfer", "Dynamics of Machines", "Industrial Engineering", "Machine Design I", "Manufacturing Lab"],
            5: ["Refrigeration & AC", "Computer Aided Design", "Metrology", "Finite Element Analysis", "CAD Lab"],
            6: ["Mechatronics", "Power Plant Engineering", "Operations Research", "Advanced Manufacturing", "Mechatronics Lab"],
            7: ["Robotics & Automation", "Elective I", "Project I", "Seminar"],
            8: ["Major Project", "Entrepreneurship", "Industry Internship"],
        },
        civil: {
            1: ["Engineering Mathematics I", "Physics", "Engineering Drawing", "Surveying", "Basic Electrical Engineering"],
            2: ["Engineering Mathematics II", "Fluid Mechanics", "Structural Analysis I", "Building Materials", "Surveying Lab"],
            3: ["Structural Analysis II", "Geotechnical Engineering", "Transportation Engineering", "Hydraulics", "CAD Lab"],
            4: ["Design of Structures", "Environmental Engineering", "Estimation & Costing", "Concrete Technology", "Structures Lab"],
            5: ["Foundation Engineering", "Highway Engineering", "Water Resources", "Construction Management", "Highway Lab"],
            6: ["Advanced Structural Design", "Remote Sensing & GIS", "Steel Structures", "Earthquake Engineering", "GIS Lab"],
            7: ["Bridge Engineering", "Project Management", "Urban Planning", "Elective I"],
            8: ["Capstone Project", "Professional Ethics", "Industry Internship"],
        },
        aiml: {
            1: ["Engineering Mathematics I", "Physics", "Programming Fundamentals", "Statistics & Probability", "Engineering Drawing"],
            2: ["Engineering Mathematics II", "Data Structures", "Linear Algebra", "Introduction to AI", "Python Programming"],
            3: ["Machine Learning", "Database Systems", "Computer Vision Basics", "Python for Data Science", "ML Lab"],
            4: ["Deep Learning", "NLP Fundamentals", "Reinforcement Learning", "MLOps", "Deep Learning Lab"],
            5: ["Advanced Deep Learning", "Computer Vision", "Speech Processing", "Generative AI", "Elective I"],
            6: ["Big Data & Distributed ML", "Ethical AI", "Edge AI & IoT", "Advanced NLP", "Elective II"],
            7: ["AI System Design", "Capstone Research", "Industry Project", "Quantum ML"],
            8: ["Major Project", "Entrepreneurship in AI", "Industry Internship"],
        },
        ft: {
            1: ["Textile Science", "Fashion Drawing", "Colour Theory", "History of Costume", "Sewing Technology"],
            2: ["Fabric Construction", "Pattern Making I", "Fashion Illustration", "Textile Testing", "Pattern Lab"],
            3: ["Pattern Making II", "Garment Construction", "Fashion Design Studio", "Merchandising", "Garment Lab"],
            4: ["Apparel Manufacturing", "Fashion Marketing", "Textile Finishing", "Quality Control", "Manufacturing Lab"],
            5: ["Fashion Forecasting", "Retail Management", "Advanced Draping", "Sustainable Fashion", "Studio Lab"],
            6: ["Fashion Entrepreneurship", "Brand Management", "Collection Development", "Advanced Illustration", "Brand Lab"],
            7: ["Capstone Collection", "Elective I", "Industry Seminar"],
            8: ["Final Project", "Fashion Show", "Industry Internship"],
        },
    },
    bca: {
        gen: {
            1: ["Computer Fundamentals", "Programming in C", "Mathematics I", "Communication Skills"],
            2: ["Data Structures", "OOP with C++", "Digital Logic", "Mathematics II"],
            3: ["Java Programming", "DBMS", "Operating Systems", "Web Basics"],
            4: ["Web Technologies", "Python Programming", "Computer Networks", "Software Engineering"],
            5: ["Mobile App Development", "Cloud Computing", "Cyber Security", "Elective I"],
            6: ["Major Project", "Internship", "Professional Ethics"],
        },
    },
    mca: {
        gen: {
            1: ["Advanced Programming", "Discrete Mathematics", "Data Structures", "Computer Architecture"],
            2: ["DBMS", "Operating Systems", "Computer Networks", "Software Engineering"],
            3: ["Web & Cloud Computing", "AI & ML", "Mobile Computing", "Elective I"],
            4: ["Major Project", "Research Methodology", "Professional Ethics"],
        },
    },
    bba: {
        gen: {
            1: ["Principles of Management", "Business Economics", "Financial Accounting I", "Business Communication"],
            2: ["Financial Accounting II", "Business Law", "Organizational Behaviour", "Business Statistics"],
            3: ["Marketing Management", "HR Management", "Cost Accounting", "Business Environment"],
            4: ["Operations Management", "Entrepreneurship", "Financial Management", "Research Methods"],
            5: ["Strategic Management", "International Business", "Project Management", "Elective I"],
            6: ["Project & Internship", "Business Leadership", "Corporate Governance"],
        },
    },
    mba: {
        gen: {
            1: ["Management Principles", "Financial Accounting", "Organization Behaviour", "Business Economics"],
            2: ["Marketing Management", "Corporate Finance", "HRM", "Research Methodology"],
            3: ["Strategic Management", "Business Ethics", "Operations Management", "Elective I"],
            4: ["Major Project", "Leadership & Innovation", "Industry Internship"],
        },
    },
};

// ─── SEED ────────────────────────────────────────────────────────────────────

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅  Connected to MongoDB");

    // 1. Wipe everything
    console.log("\n🧹  Clearing existing academic data...");
    await Subject.deleteMany({});
    await Semester.deleteMany({});
    await Branch.deleteMany({});
    await Course.deleteMany({});
    await Session.deleteMany({});
    console.log("   All collections cleared.\n");

    // 2. Sessions
    console.log("📅  Inserting Sessions...");
    await Session.insertMany(SESSIONS);
    console.log(`   ✔  ${SESSIONS.length} sessions inserted`);

    // 3. Courses
    console.log("\n🎓  Inserting Courses...");
    const courseMap = {};
    for (const c of COURSES) {
        const doc = await Course.create(c);
        courseMap[c.code] = doc;
    }
    console.log(`   ✔  ${COURSES.length} courses inserted`);

    // 4. Branches
    console.log("\n🌿  Inserting Branches...");
    const branchMap = {};
    let branchTotal = 0;
    for (const [courseCode, defs] of Object.entries(BRANCH_DEFS)) {
        const courseDoc = courseMap[courseCode];
        for (const b of defs) {
            const doc = await Branch.create({ ...b, course: courseDoc._id });
            branchMap[`${courseCode}_${b.code}`] = doc;
            branchTotal++;
        }
        console.log(`   ✔  ${courseCode.toUpperCase()}: ${defs.length} branches`);
    }

    // 5. Semesters
    console.log("\n📚  Inserting Semesters...");
    const semMap = {};
    let semTotal = 0;
    for (const [courseCode, count] of Object.entries(SEM_COUNT)) {
        const courseDoc = courseMap[courseCode];
        for (let n = 1; n <= count; n++) {
            const doc = await Semester.create({
                name: `Semester ${n}`,
                number: n,
                course: courseDoc._id,
            });
            semMap[`${courseCode}_${n}`] = doc;
            semTotal++;
        }
        console.log(`   ✔  ${courseCode.toUpperCase()}: ${count} semesters`);
    }

    // 6. Subjects
    console.log("\n📖  Inserting Subjects...");
    let subTotal = 0;
    for (const [courseCode, branchData] of Object.entries(SUBJECTS)) {
        const courseDoc = courseMap[courseCode];
        for (const [branchCode, semData] of Object.entries(branchData)) {
            const branchDoc = branchMap[`${courseCode}_${branchCode}`];
            if (!branchDoc) { console.warn(`   ⚠  Branch not found: ${courseCode}_${branchCode}`); continue; }
            let count = 0;
            for (const [semNum, subjects] of Object.entries(semData)) {
                const semDoc = semMap[`${courseCode}_${semNum}`];
                if (!semDoc) { console.warn(`   ⚠  Semester not found: ${courseCode}_${semNum}`); continue; }
                for (const name of subjects) {
                    await Subject.create({
                        name,
                        branch: branchDoc._id,
                        semester: semDoc._id,
                        course: courseDoc._id,
                    });
                    count++;
                    subTotal++;
                }
            }
            console.log(`   ✔  ${courseCode.toUpperCase()} / ${branchDoc.name}: ${count} subjects`);
        }
    }

    // Summary
    console.log("\n🎉  Fresh Seed Complete!");
    console.log(`   Sessions  : ${await Session.countDocuments()}`);
    console.log(`   Courses   : ${await Course.countDocuments()}`);
    console.log(`   Branches  : ${await Branch.countDocuments()}`);
    console.log(`   Semesters : ${await Semester.countDocuments()}`);
    console.log(`   Subjects  : ${await Subject.countDocuments()}`);
    console.log("\n🚀  All data is live in MongoDB!\n");
}

run()
    .catch((err) => { console.error("❌  Error:", err); process.exit(1); })
    .finally(() => mongoose.disconnect());
