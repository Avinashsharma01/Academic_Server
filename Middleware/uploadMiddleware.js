import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../Config/cloudinary.js";

// Set up Multer storage to use Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        return {
            folder: "collage", // Folder in Cloudinary
            format: file.mimetype.split("/")[1], // Extract file format dynamically
            resource_type: "auto", // Allow images, videos, PDFs, etc.
        };
    },
});

const upload = multer({ storage });

export default upload;


// import multer from "multer";
// import { CloudinaryStorage } from "multer-storage-cloudinary";
// import cloudinary from "../Config/cloudinary.js";

// // Set up Multer storage to use Cloudinary
// const storage = new CloudinaryStorage({
//     cloudinary: cloudinary,
//     params: {
//         folder: "collage", // Folder in Cloudinary
//         allowedFormats: ["pdf", "doc", "docx", "png", "jpg", "mp4"],
//     },
// });

// const upload = multer({ storage });

// export default upload;


