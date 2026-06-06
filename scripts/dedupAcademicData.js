/**
 * Dedup Script — Remove duplicate academic data from MongoDB
 * Keeps the FIRST created document and removes all subsequent duplicates
 *
 * Run with: node scripts/dedupAcademicData.js
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

async function connect() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅  Connected to MongoDB\n");
}

// Generic dedup helper
// groupFields: the fields that define uniqueness (e.g. ["year"] for Session)
async function dedup(Model, groupFields, label) {
    const all = await Model.find({}).sort({ createdAt: 1 }).lean();
    const seen = new Map();
    const toDelete = [];

    for (const doc of all) {
        const key = groupFields.map((f) => {
            const val = doc[f];
            // For ObjectId references, stringify
            return val?.toString?.() ?? val;
        }).join("|");

        if (seen.has(key)) {
            toDelete.push(doc._id);
        } else {
            seen.set(key, doc._id);
        }
    }

    if (toDelete.length > 0) {
        await Model.deleteMany({ _id: { $in: toDelete } });
        console.log(`   🗑  ${label}: removed ${toDelete.length} duplicate(s)  (kept ${seen.size} unique)`);
    } else {
        console.log(`   ✅  ${label}: no duplicates found  (${seen.size} documents)`);
    }
}

async function run() {
    await connect();

    console.log("🔍  Scanning for duplicates...\n");

    // Sessions — unique by: year
    await dedup(Session, ["year"], "Sessions");

    // Courses — unique by: code
    await dedup(Course, ["code"], "Courses");

    // Branches — unique by: name + course (ObjectId ref)
    // (We need to re-fetch after course dedup so refs are correct)
    const branchAll = await Branch.find({}).sort({ createdAt: 1 }).lean();
    const branchSeen = new Map();
    const branchDelete = [];
    for (const doc of branchAll) {
        const key = `${doc.name?.toLowerCase()}|${doc.course?.toString()}`;
        if (branchSeen.has(key)) {
            branchDelete.push(doc._id);
        } else {
            branchSeen.set(key, doc._id);
        }
    }
    if (branchDelete.length > 0) {
        await Branch.deleteMany({ _id: { $in: branchDelete } });
        console.log(`   🗑  Branches: removed ${branchDelete.length} duplicate(s)  (kept ${branchSeen.size} unique)`);
    } else {
        console.log(`   ✅  Branches: no duplicates found  (${branchSeen.size} documents)`);
    }

    // Semesters — unique by: number + course
    const semAll = await Semester.find({}).sort({ createdAt: 1 }).lean();
    const semSeen = new Map();
    const semDelete = [];
    for (const doc of semAll) {
        const key = `${doc.number}|${doc.course?.toString()}`;
        if (semSeen.has(key)) {
            semDelete.push(doc._id);
        } else {
            semSeen.set(key, doc._id);
        }
    }
    if (semDelete.length > 0) {
        await Semester.deleteMany({ _id: { $in: semDelete } });
        console.log(`   🗑  Semesters: removed ${semDelete.length} duplicate(s)  (kept ${semSeen.size} unique)`);
    } else {
        console.log(`   ✅  Semesters: no duplicates found  (${semSeen.size} documents)`);
    }

    // Subjects — unique by: name + branch + semester
    const subAll = await Subject.find({}).sort({ createdAt: 1 }).lean();
    const subSeen = new Map();
    const subDelete = [];
    for (const doc of subAll) {
        const key = `${doc.name?.toLowerCase()}|${doc.branch?.toString()}|${doc.semester?.toString()}`;
        if (subSeen.has(key)) {
            subDelete.push(doc._id);
        } else {
            subSeen.set(key, doc._id);
        }
    }
    if (subDelete.length > 0) {
        await Subject.deleteMany({ _id: { $in: subDelete } });
        console.log(`   🗑  Subjects: removed ${subDelete.length} duplicate(s)  (kept ${subSeen.size} unique)`);
    } else {
        console.log(`   ✅  Subjects: no duplicates found  (${subSeen.size} documents)`);
    }

    // Final counts
    console.log("\n📊  Final counts in database:");
    console.log(`   Sessions  : ${await Session.countDocuments()}`);
    console.log(`   Courses   : ${await Course.countDocuments()}`);
    console.log(`   Branches  : ${await Branch.countDocuments()}`);
    console.log(`   Semesters : ${await Semester.countDocuments()}`);
    console.log(`   Subjects  : ${await Subject.countDocuments()}`);
    console.log("\n✅  Dedup complete!\n");
}

run()
    .catch((err) => {
        console.error("❌  Error:", err);
        process.exit(1);
    })
    .finally(() => mongoose.disconnect());
