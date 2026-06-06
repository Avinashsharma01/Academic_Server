import mongoose from 'mongoose';

const SuperAdminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: 'superadmin',
    },
    isVerified: {
        type: Boolean,
        default: false,
    },

},
    {
        timestamps: true,
    });

const SuperAdmin = mongoose.model('SuperAdmin', SuperAdminSchema);
export default SuperAdmin;