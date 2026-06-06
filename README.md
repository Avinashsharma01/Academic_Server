# Notes Management System

This project is a Notes Management System with a client-side built using React and Vite, and a server-side built using Node.js, Express, and MongoDB. The system allows users to upload, search, update, and delete notes. It also includes user authentication and authorization.

## Client

The client-side is built using React and Vite. It includes the following main files:

-   `index.html`: The main HTML file.
-   `src/main.jsx`: The entry point for the React application.
-   `src/App.jsx`: The main App component.
-   `src/index.css`: The main CSS file, which includes TailwindCSS.

### Scripts

-   `dev`: Start the development server.
-   `build`: Build the project for production.
-   `lint`: Run ESLint to check for code quality.
-   `preview`: Preview the production build.

### Dependencies

-   `@tailwindcss/vite`: TailwindCSS integration with Vite.
-   `axios`: Promise-based HTTP client.
-   `react`: React library.
-   `react-dom`: React DOM library.
-   `react-router-dom`: React Router library.
-   `tailwindcss`: TailwindCSS library.

### Dev Dependencies

-   `@eslint/js`: ESLint configuration for JavaScript.
-   `@types/react`: TypeScript definitions for React.
-   `@types/react-dom`: TypeScript definitions for React DOM.
-   `@vitejs/plugin-react-swc`: SWC plugin for Vite.
-   `eslint`: ESLint library.
-   `eslint-plugin-react`: ESLint plugin for React.
-   `eslint-plugin-react-hooks`: ESLint plugin for React hooks.
-   `eslint-plugin-react-refresh`: ESLint plugin for React Refresh.
-   `globals`: Global variables for ESLint.
-   `vite`: Vite library.

## Server

The server-side is built using Node.js, Express, and MongoDB. It includes the following main directories and files:

-   `Config/`: Configuration files.
    -   `cloudinary.js`: Cloudinary configuration.
    -   `FileAllowType.md`: Documentation for allowed file types.
-   `Controllers/`: Controller files.
    -   `authController.js`: Authentication controller.
    -   `noteController.js`: Note controller.
-   `Database/`: Database connection file.
    -   `db.js`: MongoDB connection.
-   `Guide/`: Guide files.
    -   `case-senstive.md`: Guide for case-sensitive issues in MongoDB.
-   `Middleware/`: Middleware files.
    -   `authMiddleware.js`: Authentication middleware.
    -   `uploadMiddleware.js`: File upload middleware.
-   `Models/`: Model files.
    -   `Note.js`: Note model.
    -   `UserModel.js`: User model.
-   `Routes/`: Route files.
    -   `authRoutes.js`: Authentication routes.
    -   `noteRoutes.js`: Note routes.
-   `server.js`: Main server file.

### Environment Variables

-   `PORT`: The port on which the server runs.
-   `MONGO_URI`: The MongoDB connection URI.
-   `JWT_SECRET`: The secret key for JWT.
-   `CLOUDINARY_CLOUD_NAME`: The Cloudinary cloud name.
-   `CLOUDINARY_API_KEY`: The Cloudinary API key.
-   `CLOUDINARY_API_SECRET`: The Cloudinary API secret.

### Scripts

-   `start`: Start the server using nodemon.

### Dependencies

-   `bcryptjs`: Library for hashing passwords.
-   `cloudinary`: Cloudinary library for file uploads.
-   `cors`: Middleware for enabling CORS.
-   `dotenv`: Library for loading environment variables.
-   `express`: Web framework for Node.js.
-   `jsonwebtoken`: Library for generating JWT tokens.
-   `mongoose`: MongoDB ODM.
-   `multer`: Middleware for handling file uploads.
-   `multer-storage-cloudinary`: Cloudinary storage engine for multer.

## Usage

1. Clone the repository.
2. Install dependencies for both client and server:
    ```sh
    cd Client
    npm install
    cd ../Server
    npm install
    ```

## Create a .env file in the Server directory with the following variables:

PORT=5000
MONGO_URI=your_mongo_uri
JWT_SECRET=your_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

## Start the client and server:

cd Client
npm run dev
cd ../Server
npm start

# Features

User authentication and authorization.
Upload, search, update, and delete notes.
Case-insensitive search for notes.
File uploads to Cloudinary.

# License

This project is licensed under the MIT License.

You can copy this content into your `README.md` file in the `Server` directory.
You can copy this content into your `README.md` file in the `Server` directory.
