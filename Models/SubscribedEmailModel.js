import mongoose from "mongoose";

const SubscribeSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    }
}, { timestamps: true })

const Subscribe = mongoose.model("Subscribe", SubscribeSchema)
export default Subscribe