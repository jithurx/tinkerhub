# TinkerHub Campus Hub - WebFusion Final Project 🚀

Hey there! 👋 This is my final project submission for the TinkerHub WebFusion program. The goal was to dive deep, apply the skills learned throughout the program, and build a functional and engaging website for a hypothetical TinkerHub Campus Community (specifically, NSSCE).

This project evolved into a **dynamic full-stack application**, aiming to be a central place for students and chapter administrators to connect, share information, manage events, and foster community spirit. It features direct image uploads using Cloudinary and admin controls integrated directly onto relevant public pages.

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
    *   Unified **Login** page routing users based on role (students to profile, admins to dashboard).
    *   Role-based access control for administrative actions.
*   🎨 **Engaging Frontend:**
    *   A unique "Tinker Theme" with eclectic fonts, vibrant colors, and textures, **inspired by the visual philosophy of the official TinkerHub site ([tinkerhub.org](https://tinkerhub.org/))**.
    *   Dynamic "Lava Lamp" style background animation on the homepage (`metaball.js`).
    *   **Responsive Design** adapting to different screen sizes.
    *   Dynamically loaded header/footer components using Vanilla JS.
    *   Custom `404.html` page.
*   📢 **Community Announcements:** Admins can create and delete announcements via the dashboard. Announcements are displayed publicly.
*   🎭 **Events Section:**
    *   Clear separation of **Upcoming** and **Past** events on the main events page.
    *   Both upcoming and past event cards link to a detailed sub-page.
    *   Event cards display thumbnails (using Cloudinary URLs).
    *   Detailed sub-page shows full description, date, location, banner image.
    *   **Moments Gallery & Management:**
        *   A "Moments" image gallery is displayed on the detail page for past events.
        *   **Logged-in Admins** see controls *on the event details page* to add new moment image URLs and delete existing ones.
    *   Registration links are displayed for upcoming events (if provided).
*   📚 **Resource Sharing:** Admins can create and delete resources (links, tools, guides) via the dashboard. Resources are displayed publicly.
*   🖼️ **Direct Image Uploads:** Implemented using **Cloudinary** for:
    *   Profile pictures (in Edit Profile).
    *   Event/Announcement/Resource images (in Admin Dashboard Create form).
    *   Uploads happen directly from the frontend; only the image URL is stored in the backend database.
*   💬 **Forum/Discussion:** Logged-in users can post messages and view the community discussion feed (messages stored in MongoDB).
*   👤 **User Profiles:**
    *   Logged-in users can view their own profile page.
    *   Displays profile picture (from Cloudinary), name, email, about section, social links.
    *   Displays programming language skills with a visual progress bar.
    *   Users can **Edit** their own profile information (name, about, picture upload, socials, languages) via a dedicated edit page.
*   🛠️ **Admin Dashboard:**
    *   Protected section accessible only to users with the 'admin' role.
    *   Provides **Create** and **Delete** functionality for Announcements, Events, and Resources.
    *   *(Note: Full Update/Edit functionality via modal is currently removed/disabled in the provided dashboard files, only Create/Delete are present).*

## Tech Stack & Architecture

This project uses a split frontend/backend architecture:

*   **Frontend:**
    *   Vanilla JavaScript (ES6+)
    *   HTML5
    *   CSS3 (with CSS Variables)
    *   `fetch` API for backend communication
    *   (External) Formspree for the contact form submission
    *   (External) **Cloudinary** for image uploads (via direct frontend fetch)
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
    *   MongoDB Atlas
*   **Deployment:**
    *   **Backend API:** Hosted on **Render** as a Node.js Web Service.
    *   **Frontend:** Hosted on **GitHub Pages** as a static site.

## Running Locally (Setup Instructions)

1.  **Prerequisites:** Node.js (v18+), npm, Git, MongoDB Atlas account & connection string, **Cloudinary account** (get Cloud Name and create an Unsigned Upload Preset).
2.  **Clone:** `git clone https://github.com/jithurx/tinkerhub.git`
3.  **Navigate:** `cd thinkerhub-site`
4.  **Install Dependencies:** `npm install`
5.  **Configure Environment:**
    *   Create a `.env` file in the project root.
    *   Add `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN` (as before).
    *   Set `NODE_ENV=development`.
    *   Set `PORT=5000` (or your preferred local port).
6.  **Configure Cloudinary:**
    *   In `admin/js/dashboard.js` AND `js/edit-profile.js`, replace `'YOUR_CLOUD_NAME_HERE'` and `'tinkerhub_unsigned_preset'` with your actual Cloudinary Cloud Name and Upload Preset Name.
7.  **Database Setup:** Allow connections from your IP in Atlas. Create an initial admin user (use `createAdmin.js` or Compass).
8.  **Run Backend:** `npm run dev` (check console for success).
9.  **Run Frontend:**
    *   Update `API_BASE_URL` in JS files to `http://localhost:5000`.
    *   Serve static files (VS Code Live Server or `npx serve .`).
    *   Access frontend URL in browser.

## Limitations & Learning

*   **Admin Edit Functionality:** The main dashboard currently only implements Create and Delete; the Edit modal functionality was removed in the provided files (though the backend PUT routes exist). Moments editing is handled separately on the event detail page for admins.
*   **Authentication:** JWT in `localStorage` (XSS risk). No refresh tokens, email verification.
*   **No Realtime Features:** Forum requires refreshes.
*   **Image Handling:** Relies on users providing valid URLs for moments (admin) or direct uploads (Cloudinary) without server-side validation of the content itself beyond basic format checks. No image resizing/optimization beyond Cloudinary's optional transformations.
*   **Testing:** No automated tests.
*   **Security:** Basic implementation; lacks rate limiting, advanced sanitization, etc.

## Future Ideas ✨

*   Re-implement/Refine the Edit functionality in the Admin Dashboard.
*   Implement WebSockets for a real-time forum.
*   Add email verification, password reset, OAuth logins.
*   Implement image uploads *through the backend* for better control/validation, potentially integrating with S3/Cloudinary via the server.
*   Add search, filtering, and user management to the Admin Dashboard.
*   Conduct accessibility (a11y) and security audits.

---

Thanks for checking out my WebFusion project!

*Crafted by Jithu R (`@jithurx`)*