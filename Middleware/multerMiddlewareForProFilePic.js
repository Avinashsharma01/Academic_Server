import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../Config/cloudinary.js"; // Cloudinary config file

// Cloudinary storage setup
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "profile_pics",
        allowedFormats: ["jpg", "png", "jpeg"],
    },
});

const upload = multer({ storage });

export default upload;
