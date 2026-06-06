// Firebase Admin SDK Configuration
// This verifies Firebase ID tokens sent from the frontend
import admin from "firebase-admin";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

let firebaseInitialized = false;

const initFirebase = () => {
    if (admin.apps.length > 0) {
        firebaseInitialized = true;
        return;
    }

    // Check if service account key file exists (for production)
    const serviceAccountPath = join(__dirname, "serviceAccountKey.json");

    if (existsSync(serviceAccountPath)) {
        // Use service account key file if it exists
        const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
        console.log("Firebase Admin: initialized with service account key");
    } else {
        // For development: initialize with project ID only
        // Firebase Admin will verify tokens using Google's public keys (no credentials needed)
        admin.initializeApp({
            projectId: process.env.FIREBASE_PROJECT_ID,
        });
        console.log("Firebase Admin: initialized with project ID:", process.env.FIREBASE_PROJECT_ID);
    }

    firebaseInitialized = true;
};

initFirebase();

export default admin;
