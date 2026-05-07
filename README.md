# 📌 TeamFlow – Team Task Manager

> A full-stack-style web app to manage projects, assign tasks, and track progress with role-based access control.

![HTML](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

---

## 🚀 Live Demo

> 🔗 **[teamflow-demo.up.railway.app](https://teamflow-demo.up.railway.app)** ← *(add your Railway URL here after deploying)*

---

## ✨ Features

- 🔐 **Authentication** — Signup / Login with session state
- 👑 **Role-Based Access** — Admin vs Member permissions
- 📁 **Project Management** — Create projects with emoji, description & progress tracking
- ✅ **Task System** — Create, assign, prioritize & track tasks
- 📊 **Kanban Board** — Drag-status across To Do / In Progress / Done columns
- 🔍 **Search & Filter** — Filter tasks by priority (High / Medium / Low)
- 👥 **Team Management** — View members, invite new ones (Admin only)
- 📈 **Dashboard** — Live stats: total projects, completed, in-progress, overdue
- 🍞 **Toast Notifications** — Feedback on every action
- 📱 **Responsive** — Works on mobile too

---

## 🧑‍💻 Demo Credentials

| Role   | Email             | Password   |
|--------|-------------------|------------|
| Admin  | admin@test.com    | admin123   |
| Member | member@test.com   | member123  |

> Admin can create projects, delete tasks, and invite members. Members can only view and update their own tasks.

---

## 🛠️ Tech Stack

| Layer      | Tech                        |
|------------|-----------------------------|
| Frontend   | HTML5, CSS3, Vanilla JS     |
| Fonts      | Google Fonts (Nunito, Caveat) |
| Deployment | Railway (Static Site)       |

> No frameworks, no build tools, no npm — just one clean `index.html` file.

---

## 📂 Project Structure

```
teamflow/
├── index.html      # Entire app (auth, dashboard, kanban, team)
└── README.md
```

---

## 🚢 Deployment on Railway

1. Push this repo to GitHub (instructions below)
2. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**
3. Select this repository
4. Set **Start Command** to: *(leave empty for static)*
5. Railway will auto-detect and serve `index.html`
6. Your app is live! 🎉

> **Tip:** If Railway asks for a service type, choose **Static Site**.

---

## 💻 Run Locally

No installation needed:

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/teamflow.git

# Open in browser
cd teamflow
open index.html   # macOS
# OR
start index.html  # Windows
```

Or just drag `index.html` into any browser tab.

---

## 📸 Screenshots

> *(Add screenshots here after deploying — use Cmd+Shift+4 or Snipping Tool)*

| Dashboard | Kanban Board | Projects |
|-----------|-------------|---------|
| ![dash](https://via.placeholder.com/300x180?text=Dashboard) | ![kanban](https://via.placeholder.com/300x180?text=Kanban) | ![projects](https://via.placeholder.com/300x180?text=Projects) |

---

## 🙋 Author

**Kartikay** — B.Tech CS&IT @ KIET Group of Institutions  
[GitHub](https://github.com/YOUR_USERNAME) · [LinkedIn](https://linkedin.com/in/YOUR_PROFILE)

---

## 📝 License

MIT — do whatever you want with it.
