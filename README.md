# 🧭 Project Management App

A full-stack **Project Management System** built with **Node.js (Express)**, **MongoDB**, and **React.js**.  
This application allows teams to manage projects, assign tasks, and track progress efficiently with **role-based access control** and a clean, responsive UI.

---

## 📑 Table of Contents
1. [Features](#features)  
2. [Tech Stack](#tech-stack)  
3. [Project Structure](#project-structure)  
4. [Setup Instructions](#setup-instructions)  
   - [1. Clone Repository](#1-clone-repository)  
   - [2. Backend Setup (Server)](#2-backend-setup-server)  
   - [3. Frontend Setup (Client)](#3-frontend-setup-client)  
5. [Environment Variables](#environment-variables)  
6. [API Documentation](#api-documentation)  
   - [Authentication Routes](#authentication-routes)  
   - [User Routes](#user-routes)  
   - [Project Routes](#project-routes)  
   - [Task Routes](#task-routes)  
   - [Dashboard Routes](#dashboard-routes)  
   - [Notification Routes](#notification-routes)  
7. [Role Permissions](#role-permissions)  
8. [License](#license)

---

## ✨ Features

- 🔐 **JWT Authentication** with secure login and signup  
- 👥 **Role-based Access Control** (Admin, Project Manager, Team Member)  
- 📁 **Projects & Tasks CRUD** — create, edit, delete  
- 👨‍💼 **Team Management** — add/remove members  
- 📊 **Dashboard** with statistics and recent activity  
- 📝 **Activity Logs** to track project updates  
- 📧 **Email Notifications** for important actions  
- 💻 **Responsive UI** using Material-UI and TailwindCSS  

---

## 🛠️ Tech Stack

| Category | Technology |
|-----------|-------------|
| **Frontend** | React.js, React Router DOM, Axios, Material UI, TailwindCSS |
| **Backend** | Node.js, Express.js, MongoDB, Mongoose |
| **Authentication** | JSON Web Token (JWT) |
| **Email Service** | Nodemailer (Gmail) |
| **Utilities** | dotenv, cors, morgan, bcryptjs |

---

## 🗂️ Project Structure

```bash
project-management-app/
│
├── client/                     # React frontend
│   ├── src/
│   └── package.json
│
├── server/                     # Node.js + Express backend
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── server.js
│   ├── app.js
│   └── package.json
│
├── .env.example
├── README.md
└── package.json
⚙️ Setup Instructions
1. Clone Repository
bash
Copy code
git clone https://github.com/mez-git/project-management-app.git
cd project-management-app
2. Backend Setup (Server)
Navigate to the server folder and install dependencies:

bash
Copy code
cd server
npm install
Create a .env file inside the server/ directory and add:

env
Copy code
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/projectDB
JWT_SECRET=your_jwt_secret
EMAIL_USER=youremail@gmail.com
EMAIL_PASS=your_gmail_app_password
Run the backend:

Development mode (with auto-reload):

bash
Copy code
npm run dev
Production mode:

bash
Copy code
npm start
Server runs at 👉 http://localhost:5000

3. Frontend Setup (Client)
In a new terminal, navigate to the client folder:

bash
Copy code
cd ../client
npm install

Create a .env file inside /client and add:

REACT_APP_API_URL=http://localhost:5000/api/v1
Run the frontend:
npm start
Frontend runs at 👉 http://localhost:3000

🌍 Environment Variables
Variable	Description
PORT	Port number for backend server (default: 5000)
MONGO_URI	MongoDB connection string
JWT_SECRET	Secret key for JWT authentication
EMAIL_USER	Gmail address used to send notifications
EMAIL_PASS	Gmail App Password (not your actual password)

📡 API Documentation
Base URL:

bash
Copy code
http://localhost:5000/api/v1
🔐 Authentication Routes
Method	Endpoint	Description           	                 Protected
POST	/auth/register	Register a new user	                ❌ No
POST	/auth/login	Login user and get JWT	                ❌ No
GET	/auth/me	Get current logged-in user	                ✅ Yes
PUT	/auth/update-password	Update current user's password	✅ Yes

👤 User Routes
Method	Endpoint	Description   	Role
GET	/users	Get all users	Admin
POST	/users	Create a new user	Admin
GET	/users/:id	Get user by ID	Admin
PUT	/users/:id	Update user	Admin
DELETE	/users/:id	Delete user	Admin

📁 Project Routes
Method	Endpoint	             Description	                                      Role
GET	/projects	                    Get all projects	                          All
POST	/projects                   	Create new project	                          Admin, Project Manager
GET	/projects/:id                  	Get specific project	                        All
PUT	/projects/:id	                     Update project	                            Admin, Project Manager
DELETE	/projects/:id	                     Delete project                         Admin, Project Manager
PUT	/projects/:id/add-member	              Add team member	                      Admin, Project Manager
PUT	/projects/:id/remove-member               	Remove team member                 Admin, Project Manager
GET	/projects/:projectId/tasks	         Get tasks for project                    	All
POST	/projects/:projectId/tasks   	     Create task in project	                   Admin, Project Manager
GET	/projects/:projectId/activity-logs   	Get project activity  logs              	All

✅ Task Routes
Method	Endpoint	   Description	                             Role
GET	/tasks/:id	     Get task by ID	                           All
PUT	/tasks/:id	     Update task                               	All
DELETE	/tasks/:id    	Delete task	Admin,                  Project Manager

📊 Dashboard Routes
Method	Endpoint	Description	Role
GET	/dashboard	Get dashboard overview	All (role-based data)

🔔 Notification Routes
Method	Endpoint	   Description                                       	Role
GET	/notifications	  Get user notifications	                             All
PUT	/notifications/:id/read	Mark single notification as read	                All
PUT	/notifications/read-all	Mark all notifications as read	                All

🧑‍💼 Role Permissions
Role	Permissions
Admin	Manage all users, projects, and tasks
Project Manager	Create/manage projects and tasks assigned to them
Team Member	View/update tasks assigned to them

🚀 Running the App Locally
Use two terminals — one for backend, one for frontend.

Terminal 1 (Backend):

bash
Copy code
cd server
npm run dev
Terminal 2 (Frontend):

bash
Copy code
cd client
npm start
Now visit 👉 http://localhost:3000

🪪 License
This project is licensed under the MIT License.

👨‍💻 Author
Megha
GitHub: mez-git
