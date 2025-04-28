# 🚀 TinkerHub NSSCE Campus Hub - WebFusion Final Project 🚀

Hey there! 👋 This is my final project submission for the TinkerHub WebFusion program. The goal was to dive deep, apply the skills learned throughout the program, and build a functional and engaging website for a hypothetical TinkerHub Campus Community (specifically, NSSCE).

This project evolved into a **dynamic full-stack application**, aiming to be a central place for students and chapter administrators to connect, share information, manage events, and foster community spirit. It features direct image uploads using Cloudinary, admin controls integrated onto relevant public pages, and an initial loading screen to mitigate backend cold starts.

## ✨ Live Demo & Code

*   **Live Frontend:** [https://jithurx.github.io/tinkerhub/](https://jithurx.github.io/tinkerhub/) (Hosted on GitHub Pages)
*   **Live Backend API:** [https://tinkerhub-0pse.onrender.com/api](https://tinkerhub-0pse.onrender.com/api) (Hosted on Render - Base API route)
*   **GitHub Repository:** [https://github.com/jithurx/tinkerhub](https://github.com/jithurx/tinkerhub)

## 🧪 Testing Credentials (for Live Demo)

You can use the following credentials to test the different roles on the live site:

*   **Admin Role:**
    *   Email: `admin@email.com`
    *   Password: `admin@`
*   **Student Role:**
    *   Email: `student@email.com`
    *   Password: `student@`

*(Note: These are test accounts and do not contain real user data.)*


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
    *   Dynamically loaded header/footer components using Vanilla JS (`js/main.js`).
    *   **Homepage Loading Screen:** Displays for 5 seconds on the first visit per session, sending a background "ping" to wake up the Render free-tier backend instance (`js/index-init.js`).
    *   Custom `404.html` page.
*   📢 **Community Announcements:** Admins can create and delete announcements via the dashboard. Announcements are displayed publicly.
*   🎭 **Events Section:**
    *   Clear separation of **Upcoming** and **Past** events on the main events page.
    *   Both upcoming and past event cards link to a detailed sub-page.
    *   Event cards display thumbnails (using Cloudinary URLs).
    *   Detailed sub-page shows full description, date, location, banner image.
    *   **Moments Gallery & Management:**
        *   A "Moments" image gallery is displayed on the detail page for past events.
        *   **Logged-in Admins** see controls *on the event details page* to add new moment images (via Cloudinary upload) and delete existing ones.
    *   Registration links are displayed for upcoming events (if provided).
*   📚 **Resource Sharing:** Admins can create and delete resources (links, tools, guides) via the dashboard. Resources are displayed publicly.
*   🖼️ **Direct Image Uploads:** Implemented using **Cloudinary** for:
    *   Profile pictures (in Edit Profile).
    *   Event/Announcement/Resource images (in Admin Dashboard Create form).
    *   Event Moments (Added by Admin on Event Details page).
    *   Uploads happen directly from the frontend; only the image URL is stored in the backend database.
*   💬 **Forum/Discussion:** Logged-in users can post messages and view the community discussion feed (messages stored in MongoDB).
*   **📬 Contact Form:** Allows users to send inquiries. Submissions are handled directly by the **frontend JavaScript (`js/contact.js`)** sending data to the **Web3Forms** service (no custom backend endpoint needed).
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

*   **Frontend:** Vanilla JavaScript (ES6+), HTML5, CSS3, `fetch` API, Web3Forms, Cloudinary.
*   **Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT (`jsonwebtoken`), `bcryptjs`, `cors`, `dotenv`.
*   **Database:** MongoDB Atlas.
*   **Deployment:** Backend API on **Render**, Frontend on **GitHub Pages**.

## Running Locally (Setup Instructions)

1.  **Prerequisites:** Node.js (v18+), npm, Git, MongoDB Atlas account & connection string, Cloudinary account (Cloud Name, Unsigned Upload Preset), Web3Forms Access Key.
2.  **Clone:** `git clone https://github.com/jithurx/tinkerhub.git`
3.  **Navigate:** `cd <repository-directory>`
4.  **Install Dependencies:** `npm install`
5.  **Configure Environment (.env):** Create `.env` file with `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `NODE_ENV=development`, `PORT=5000`.
6.  **Configure Services (JS files):** Update Cloudinary details (in `dashboard.js`, `edit-profile.js`, `index-init.js`) and Web3Forms `ACCESS_KEY` (in `contact.js`).
7.  **Database Setup:** Allow connections from your IP in Atlas. Consider creating your *own* initial admin user instead of relying on the test credentials for local development (use Compass or `createAdmin.js`).
8.  **Run Backend:** `npm run dev`.
9.  **Run Frontend:** Update `API_BASE_URL` in JS files to `http://localhost:5000`. Serve static files (Live Server or `npx serve .`). Access in browser.

## Limitations & Learning

*   **Admin Edit Functionality:** Dashboard Create/Delete only; Edit modal removed. Moments editing on event page.
*   **Authentication:** JWT in `localStorage` (XSS risk). No refresh tokens, email verification.
*   **No Realtime Features:** Forum requires refreshes.
*   **Image Handling:** Direct Cloudinary uploads lack server-side validation.
*   **Testing:** No automated tests.
*   **Security:** Basic implementation; lacks rate limiting, etc. 
*   **Web3Forms Access Key and test credentials exposed in public repo/code.**
*   **Cold Starts:** Loading screen mitigates Render delays.

## Future Ideas ✨

*   Re-implement/Refine Edit functionality in Admin Dashboard.
*   Implement WebSockets for a real-time forum.
*   Add email verification, password reset, OAuth logins.
*   Implement image uploads *through the backend*.
*   Add search, filtering, user management to Admin Dashboard.
*   Conduct accessibility (a11y) and security audits.

---

Thanks for checking out my WebFusion project!

*By Abhijith R (`@jithurx`)*