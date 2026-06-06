import mongoose from "mongoose";

const ConnectTODB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || process.env.MONGO_DBLOCAL;

        if (!mongoUri) {
            throw new Error("MONGO_URI or MONGO_DBLOCAL is required in environment variables");
        }

        await mongoose.connect(mongoUri);
        console.log("Succssefully Connected to the database");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
};

export default ConnectTODB;