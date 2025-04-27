# TinkerHub Campus Hub - WebFusion Final Project 🚀

Hey there! 👋 This is my final project submission for the TinkerHub WebFusion program. The goal was to dive deep, apply the skills learned throughout the program, and build a functional and engaging website for a hypothetical TinkerHub Campus Community (specifically, NSSCE).

This project evolved into a **dynamic full-stack application**, aiming to be a central place for students and chapter administrators to connect, share information, manage events, and foster community spirit. It was a fantastic learning journey, especially integrating the frontend and backend components!

## ✨ Live Demo & Code

*   **Live Frontend:** [https://jithurx.github.io/tinkerhub/](https://jithurx.github.io/tinkerhub/) (Hosted on GitHub Pages)
*   **Live Backend API:** [https://tinkerhub-0pse.onrender.com](https://tinkerhub-0pse.onrender.com) (Hosted on Render - Base API route)
*   **GitHub Repository:** [https://github.com/jithurx/tinkerhub](https://github.com/jithurx/tinkerhub)

## Key Features Implemented

This platform brings several community-focused features to life:

*   👤 **User Roles & Authentication:**
    *   Distinct **Student** and **Admin** roles.
    *   Secure JWT-based login system (`localStorage` token storage).
    *   Public user **Sign Up** (defaults to 'student').
    *   Role-based access control for specific actions.
*   🎨 **Engaging Frontend:**
   *   A unique "Tinker Theme" with eclectic fonts, vibrant colors, and textures, **inspired by the visual philosophy of the official TinkerHub site ([tinkerhub.org](https://tinkerhub.org/))**.
    *   Dynamic "Lava Lamp" style background animation on the homepage (`metaball.js`).
    *   **Responsive Design** adapting to different screen sizes.
    *   Dynamically loaded header/footer components.
    *   Custom `404.html` page.
*   📢 **Community Announcements:** Admins can create, update, and delete announcements viewable by everyone.
*   🎭 **Events Section:**
    *   Clear separation of **Upcoming** and **Past** events.
    *   Event cards with thumbnails.
    *   Detailed sub-page for each event (description, date, location, banner).
    *   **Moments Gallery:** Admins can add/remove image URLs for past events directly on the event details page, visible to all users.
    *   Optional registration link display for upcoming events.
*   📚 **Resource Sharing:** Admins can manage a list of useful links, tools, and guides for the community.
*   💬 **Forum/Discussion:** Logged-in users can post messages and view the community discussion feed.
*   👤 **User Profiles:**
    *   Logged-in users can view their own profile (picture, name, email, about, socials).
    *   Displays programming language skills with a progress bar.
    *   Users can **Edit** their own profile information (name, about, pic URL, socials, languages).
*   🛠️ **Admin Dashboard:**
    *   A dedicated, protected section for administrators.
    *   Provides **CRUD** (Create, Read, Update, Delete) functionality for Announcements, Events (core details), and Resources.
    *   Separate interface for adding/removing Event Moments (gallery images) is handled on the public event detail page for logged-in admins.

## Tech Stack & Architecture

This project uses a split frontend/backend architecture:

*   **Frontend:**
    *   Vanilla JavaScript (ES6+)
    *   HTML5
    *   CSS3 (with CSS Variables)
    *   `fetch` API for backend communication
    *   (External) Formspree for the contact form submission
*   **Backend:**
    *   Node.js
    *   Express.js (Web Framework)
    *   MongoDB (Database)
    *   Mongoose (ODM - Object Data Modeling)
    *   JWT (`jsonwebtoken`) for authentication tokens
    *   `bcryptjs` for password hashing
    *   `cors` for enabling cross-origin requests
    *   `dotenv` for environment variable management
*   **Database:**
    *   MongoDB Atlas (Cloud-hosted)
*   **Deployment:**
    *   **Backend API:** Hosted on **Render** as a Node.js Web Service.
    *   **Frontend:** Hosted on **GitHub Pages** as a static site.

## Running Locally (Setup Instructions)

If you'd like to run this project on your own machine:

1.  **Prerequisites:** Node.js, npm, Git, MongoDB Atlas account & connection string.
2.  **Clone:** `git clone https://github.com/jithurx/tinkerhub.git`
3.  **Navigate:** `cd thinkerhub`
4.  **Install Dependencies:** `npm install`
5.  **Configure Environment:**
    *   Create a `.env` file in the project root.
    *   Add your specific `MONGO_URI`, `JWT_SECRET`, and `JWT_EXPIRES_IN` values:
        ```.env
        MONGO_URI=mongodb+srv://<USER>:<PASSWORD>@<CLUSTER>/<DB_NAME>?retryWrites=true&w=majority
        JWT_SECRET=YOUR_VERY_SECURE_RANDOM_SECRET_KEY
        JWT_EXPIRES_IN=30d
        NODE_ENV=development
        PORT=5000 # Optional: Define local port
        ```
    *   **Remember to add `.env` to your `.gitignore`!**
6.  **Database Setup:** Ensure your MongoDB Atlas cluster's Network Access rules allow connections from your current IP address. Create an initial admin user using MongoDB Compass or the `createAdmin.js` script (fill in details and run `node createAdmin.js`).
7.  **Run Backend:** Open a terminal in the project root:
    ```bash
    npm run dev
    ```
    *   Look for "MongoDB Connected" and "Server running..." messages. Keep this terminal open.
8.  **Run Frontend:**
    *   **Important:** Update `API_BASE_URL` in **all** relevant JS files (`js/*.js`, `admin/js/*.js`) to point to your local backend (e.g., `http://localhost:5000`).
    *   Open a **new terminal** in the project root. Serve the static files:
        *   Using VS Code: Right-click `index.html` -> "Open with Live Server".
        *   Using `npx`: `npx serve .`
    *   Open the frontend URL (e.g., `http://127.0.0.1:5500` or `http://localhost:3000`) in your browser.

## Limitations & Learning

*   Authentication relies on `localStorage`, which has security considerations (XSS). A more robust solution might use HttpOnly cookies or refresh tokens.
*   Error handling is basic on both frontend and backend.
*   No automated tests were written for this iteration.
*   Direct URL storage for images (profile pic, moments) is simple but less robust than dedicated image upload/storage services.
*   The admin dashboard offers core CRUD but could be expanded significantly.

## Future Ideas ✨

*   Implement real-time updates for the forum using WebSockets.
*   Add image upload functionality (e.g., Cloudinary, S3).
*   Implement email verification and password reset.
*   Add more advanced admin features (user management, content filtering).
*   Refactor frontend with a modern framework or build tools for optimization.

---

Thanks for checking out my WebFusion project!

*Crafted by Abhijith R (`@jithu`)*
