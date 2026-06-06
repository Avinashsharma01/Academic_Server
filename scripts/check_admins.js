import mongoose from "mongoose";
import dotenv from "dotenv";
import Admin from "../Models/AdminModel.js";

dotenv.config();

const checkAdmins = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGO_DBLOCAL);
        console.log("Connected to MongoDB");

        const admins = await Admin.find({});
        if (admins.length === 0) {
            console.log("No admins found in the database.");
        } else {
            console.log(`Found ${admins.length} admins:`);
            admins.forEach(admin => {
                console.log(`- ${admin.name} (${admin.email}), Verified: ${admin.isVerified}`);
            });
        }
    } catch (error) {
        console.error("Error checking admins:", error);
    } finally {
        await mongoose.disconnect();
    }
};

checkAdmins();
