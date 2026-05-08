# 📌 TeamFlow – Team Task Manager

> A full-stack web app to manage projects, assign tasks, and track progress with role-based access control (Admin/Member).

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Railway](https://img.shields.io/badge/Railway-0B0D0E?style=for-the-badge&logo=railway&logoColor=white)

---

## 🚀 Live Demo

🔗 **[Add your Railway URL here after deploying]**

### Demo Credentials

| Role   | Email             | Password   |
|--------|-------------------|------------|
| Admin  | admin@test.com    | admin123   |
| Member | member@test.com   | member123  |

---

## ✨ Features

- 🔐 **JWT Authentication** — Signup, Login, persistent sessions
- 👑 **Role-Based Access Control** — Admin vs Member permissions enforced on both frontend and backend
- 📁 **Project Management** — Create projects with emoji, description & color
- ✅ **Task System** — Create, assign, prioritize (High/Medium/Low) & track tasks
- 📊 **Kanban Board** — Three-column board (To Do / In Progress / Done) with status updates
- 🔍 **Search & Priority Filter** — Filter tasks instantly on the frontend
- 👥 **Team Management** — View members, invite new ones (Admin only)
- 📈 **Live Dashboard** — Real-time stats: projects, completed, in-progress, overdue
- 🗄️ **SQLite Database** — Persistent data with proper relationships and foreign keys
- 🌐 **REST API** — Full CRUD API with proper validation and error handling

---

## 🛠️ Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Backend    | Node.js + Express.js              |
| Database   | SQLite (via better-sqlite3)       |
| Auth       | JWT (jsonwebtoken) + bcryptjs     |
| Frontend   | Vanilla HTML, CSS, JavaScript     |
| Fonts      | Google Fonts (Nunito, Caveat)     |
| Deployment | Railway                           |

---

## 📂 Project Structure

```
teamflow/
├── backend/
│   ├── server.js          # Express server entry point
│   ├── db.js              # SQLite setup, tables & seed data
│   ├── middleware.js       # JWT auth + admin guard
│   └── routes/
│       ├── auth.js         # POST /login, POST /signup, GET /me
│       ├── projects.js     # CRUD for projects
│       ├── tasks.js        # CRUD for tasks
│       └── users.js        # Team members, invite, stats
├── frontend/
│   └── index.html          # Full SPA frontend
├── package.json
├── railway.toml
├── Procfile
└── .gitignore
```

---

## 🌐 REST API Reference

### Auth
| Method | Endpoint           | Access  | Description          |
|--------|--------------------|---------|----------------------|
| POST   | /api/auth/signup   | Public  | Register new user    |
| POST   | /api/auth/login    | Public  | Login & get JWT      |
| GET    | /api/auth/me       | Auth    | Get current user     |

### Projects
| Method | Endpoint                    | Access  | Description             |
|--------|-----------------------------|---------|-------------------------|
| GET    | /api/projects               | Auth    | Get all projects        |
| POST   | /api/projects               | Admin   | Create new project      |
| GET    | /api/projects/:id           | Auth    | Get project details     |
| DELETE | /api/projects/:id           | Admin   | Delete project          |
| POST   | /api/projects/:id/members   | Admin   | Add member to project   |

### Tasks
| Method | Endpoint           | Access      | Description                       |
|--------|--------------------|-------------|-----------------------------------|
| GET    | /api/tasks         | Auth        | Get tasks (filtered by role)      |
| POST   | /api/tasks         | Auth        | Create new task                   |
| PATCH  | /api/tasks/:id     | Auth        | Update task status/fields         |
| DELETE | /api/tasks/:id     | Admin       | Delete task                       |

### Users
| Method | Endpoint           | Access  | Description              |
|--------|--------------------|---------|--------------------------|
| GET    | /api/users         | Auth    | Get all team members     |
| POST   | /api/users/invite  | Admin   | Invite a new member      |
| GET    | /api/users/stats   | Auth    | Get dashboard stats      |

---

## 💻 Run Locally

### Prerequisites
- Node.js >= 18

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/kirito28-tt/Team-Flow.git
cd Team-Flow

# 2. Install dependencies
npm install

# 3. Start the server
npm start

# 4. Open in browser
# http://localhost:3000
```

The SQLite database (`teamflow.db`) is auto-created on first run with demo data seeded automatically.

For development with auto-reload:
```bash
npm run dev
```

---

## 🚢 Deploy on Railway

1. Push this repo to GitHub
2. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**
3. Select this repository
4. Railway auto-detects Node.js and runs `npm start`
5. Go to **Settings → Networking** → **Generate Domain**
6. Your app is live! 🎉

> **Note:** Railway's filesystem is ephemeral — the SQLite DB resets on redeploy. For production, swap SQLite for Railway's managed PostgreSQL.

---

## 🔑 Environment Variables

| Variable    | Default                         | Description            |
|-------------|---------------------------------|------------------------|
| PORT        | 3000                            | Server port            |
| JWT_SECRET  | teamflow_super_secret_key_2024  | JWT signing secret     |

Set these in Railway's **Variables** tab for production.

---

## 📸 Screenshots

> *(Add screenshots after deploying)*

| Dashboard | Kanban Board | Projects |
|-----------|-------------|---------|
| ![dash](https://via.placeholder.com/300x180?text=Dashboard) | ![kanban](https://via.placeholder.com/300x180?text=Kanban) | ![projects](https://via.placeholder.com/300x180?text=Projects) |

---

## 🙋 Author

**Kartikay** — B.Tech CS&IT @ KIET Group of Institutions  
[GitHub](https://github.com/kirito28-tt)

---

## 📝 License

MIT — do whatever you want with it.
