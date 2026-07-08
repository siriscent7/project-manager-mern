# Project Manager MERN 🚀

A full-stack **Kanban-style Project Management Tool** built with the MERN stack (MongoDB, Express, React, Node.js). Perfect for organizing tasks, tracking progress, and managing team projects.

**Live Demo:** [https://project-manager-mern-alpha.vercel.app/](https://project-manager-mern-alpha.vercel.app/)

---

## 🎯 Features

✅ **User Authentication**
- Secure signup & login with JWT tokens
- Password strength validation (8+ chars, uppercase, lowercase, number, special char)
- Session persistence via localStorage

✅ **Project Management**
- Create, read, update, and delete projects
- Organize work into multiple boards per project

✅ **Kanban Board**
- Drag cards between lists (manual move buttons for React 19 compatibility)
- Real-time progress tracking with visual progress bar
- Create/delete lists dynamically

✅ **Task Cards**
- Add, edit, and delete cards
- Set priority levels (Low, Medium, High)
- Mark cards as complete/incomplete
- View completion percentage on board

✅ **Comments & Collaboration**
- Add comments to cards
- View comment history with user attribution

✅ **Responsive Design**
- Works on desktop and tablet
- Clean, intuitive UI with inline CSS styling

---

## 🛠️ Tech Stack

### Frontend
- **React 19** – UI framework
- **React Router** – Client-side routing
- **Axios** – HTTP client with interceptors
- **React Context API** – State management

### Backend
- **Node.js** – Runtime environment
- **Express.js** – Web framework
- **MongoDB Atlas** – Cloud database
- **Mongoose** – ODM for MongoDB
- **JWT** – Secure authentication
- **Bcryptjs** – Password hashing

### Deployment
- **Vercel** – Frontend hosting
- **Render** – Backend hosting
- **MongoDB Atlas** – Database hosting

---

## 🔒 Security

- JWT tokens with 7-day expiration
- Password hashing with bcryptjs (salt rounds: 10)
- Server-side password validation
- CORS whitelisting for frontend URLs
- Protected API routes with middleware

---

## 📁 Project Structure

```
project-manager-mern/
├── server/                    # Backend (Express + Node.js)
│   ├── models/               # Mongoose schemas
│   │   ├── User.js
│   │   ├── Project.js
│   │   ├── Board.js
│   │   ├── List.js
│   │   └── Card.js
│   ├── routes/               # API endpoints
│   │   ├── auth.js
│   │   ├── projects.js
│   │   ├── boards.js
│   │   ├── lists.js
│   │   └── cards.js
│   ├── middleware/           # Custom middleware
│   │   └── authMiddleware.js
│   ├── .env                  # Environment variables
│   ├── server.js             # Entry point
│   └── package.json
│
├── client/                    # Frontend (React 19)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/         # Login & Signup
│   │   │   ├── Dashboard/    # Project listing
│   │   │   ├── Project/      # Project detail & boards
│   │   │   └── Board/        # Kanban board canvas
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── services/
│   │   │   └── api.js        # Axios configuration
│   │   ├── App.js
│   │   └── index.js
│   ├── public/
│   ├── package.json
│   └── .gitignore
│
└── README.md
```

---

## 🐛 Known Issues & Solutions

| Issue | Solution | 
| --- | --- | 
| CORS errors on production | Ensure Vercel URL is in server.js CORS whitelist |
| Cards not moving between lists | Refresh the page to sync state with backend |
| "Session expired" on login | JWT token expired; log in again (7-day expiration) |
| API requests to localhost:5001 | Update client/src/services/api.js baseURL to production Render URL |

---

## 📝 Future Enhancements

- Drag-and-drop cards with react-dnd (React 18 compatible version)
- User roles & permissions (Admin, Member, Viewer)
- Team collaboration & shared projects
- Email notifications for task assignments
- Due date reminders
- File attachments on cards
- Dark mode toggle
- Advanced filtering & search
- Burndown charts & analytics

---
