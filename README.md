# 🏢 Workplace Website

A modern, full-featured **workspace management platform** inspired by Jira and Atlassian tools. Built with **React** and **Vite**, it provides a complete project management experience with Kanban boards, task tracking, team collaboration, and a polished authentication flow.

---

## ✨ Features

### 🔐 Authentication & Onboarding
- **Multi-provider login** — Sign in via Google, Microsoft, or email/password
- **Account chooser modals** — Realistic Google & Microsoft account picker UIs
- **JWT-based session management** — Secure, persistent authentication
- **Role & work-type onboarding** — Select your department (Software Dev, HR, Marketing) and role after sign-up
- **Protected routes** — Dashboard access restricted to authenticated users

### 📋 Kanban Board
- **Drag-and-drop task management** — Powered by `@hello-pangea/dnd`
- **Customizable columns** — TO DO, IN PROGRESS, IN REVIEW, DONE
- **Task detail modal** — Rich task editing with descriptions, assignees, labels, and more
- **Real-time board updates** — Instant UI feedback on task movements

### 🏠 Workspace Dashboard
- **Team overview** — View workspace members, roles, and activity
- **Workspace settings** — Configure workspace name, members, and preferences
- **Member management** — Add/remove team members with role assignment
- **Development view** — Dedicated software development workspace layout

### 🌐 Landing Page
- **Professional marketing page** — Polished landing page with feature highlights
- **Pricing plans modal** — Compare Free, Standard, and Premium tiers
- **Quick navigation** — Seamless flow between landing, login, and dashboard

---

## 🛠️ Tech Stack

| Category        | Technology                                                     |
| --------------- | -------------------------------------------------------------- |
| **Frontend**    | [React 18](https://react.dev/) + [Vite 6](https://vitejs.dev/) |
| **Backend API** | [Node.js](https://nodejs.org/) + [Express.js 5](https://expressjs.com/) |
| **Database**    | [MongoDB](https://www.mongodb.com/) + [Mongoose](https://mongoosejs.com/) |
| **Auth**        | JWT (JSON Web Tokens) + [bcryptjs](https://github.com/dcodeIO/bcrypt.js) |
| **Styling**     | [Tailwind CSS 3](https://tailwindcss.com/)                     |
| **Drag & Drop** | [@hello-pangea/dnd](https://github.com/hello-pangea/dnd)       |
| **Icons**       | [Lucide React](https://lucide.dev/)                            |
| **Email**       | [EmailJS](https://www.emailjs.com/)                            |
| **Language**    | JavaScript (ES Modules)                                        |

---

## 📁 Project Structure

```
workplace-website/
├── index.html                    # Entry HTML
├── package.json                  # Dependencies & fullstack scripts
├── vite.config.js                # Vite configuration with /api proxy
├── tailwind.config.js            # Tailwind CSS configuration
├── postcss.config.js             # PostCSS configuration
├── server/                       # Backend Express & MongoDB Application
│   ├── server.js                 # Express server entry point & middleware
│   ├── .env                      # Server environment variables
│   ├── .env.example              # Environment variables template
│   ├── config/
│   │   └── db.js                 # Mongoose connection manager
│   ├── models/
│   │   ├── User.js               # User schema
│   │   ├── Workspace.js          # Workspace schema with members
│   │   ├── Board.js              # Kanban board schema
│   │   ├── List.js               # Column/list schema
│   │   └── Card.js               # Issue/card schema with subtasks & comments
│   ├── controllers/
│   │   ├── authController.js     # Auth logic & JWT generation
│   │   ├── workspaceController.js# Workspace & team member operations
│   │   ├── boardController.js    # Board data aggregation
│   │   ├── listController.js     # Column CRUD operations
│   │   └── cardController.js     # Task CRUD & drag-drop reordering
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth/*
│   │   ├── workspaceRoutes.js    # /api/workspaces/*
│   │   ├── boardRoutes.js        # /api/boards/*
│   │   ├── listRoutes.js         # /api/lists/*
│   │   └── cardRoutes.js         # /api/cards/*
│   ├── middleware/
│   │   ├── auth.js               # Bearer JWT route guard
│   │   └── errorHandler.js       # Centralized error handler
│   └── seed/
│       └── seedData.js           # Auto-seed initial demo board & cards
└── src/
    ├── main.jsx                  # React entry point
    ├── App.jsx                   # Root app with routing & auth
    ├── index.css                 # Global styles
    ├── emailjs.config.js         # EmailJS configuration
    ├── assets/                   # Static assets
    ├── services/                 # API client services
    │   ├── authApi.js            # Frontend auth service (calls /api/auth)
    │   ├── kanbanApi.js          # Frontend kanban service (calls /api/*)
    │   └── dataModels.js         # Entity schema definitions
    └── components/
        ├── AbcLandingPage.jsx          # Marketing landing page
        ├── AbcLogo.jsx                 # Brand logo component
        ├── AuthContext.jsx             # Authentication context & provider
        ├── ProtectedRoute.jsx          # Route guard for auth
        ├── JiraLoginPage.jsx           # Login page with email/social
        ├── GoogleAccountChooser.jsx    # Google account picker modal
        ├── MicrosoftAccountChooser.jsx # Microsoft account picker modal
        ├── OnboardingRoleSelector.jsx  # Post-signup role selection
        ├── WorkspaceDashboard.jsx      # Main workspace dashboard
        ├── CreateWorkspaceModal.jsx    # New workspace creation flow
        ├── WorkspaceSettingsModal.jsx  # Workspace configuration
        ├── WorkspaceMemberModal.jsx    # Team member management
        ├── KanbanBoardEngine.jsx       # Drag-and-drop Kanban board
        ├── TaskDetailModal.jsx         # Task editing modal
        ├── DevelopmentView.jsx         # Dev-focused workspace view
        └── SeePlansModal.jsx           # Pricing plans comparison
```

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Backend and database health status |
| `POST` | `/api/auth/register` | Register new user with hashed password |
| `POST` | `/api/auth/login` | Authenticate user and return JWT |
| `POST` | `/api/auth/login/social` | Authenticate or register OAuth user |
| `GET` | `/api/auth/me` | Verify JWT and return current user profile |
| `POST` | `/api/auth/logout` | Invalidate session |
| `GET` | `/api/workspaces` | Get all workspaces |
| `GET` | `/api/workspaces/:id` | Get specific workspace details |
| `POST` | `/api/workspaces` | Create new workspace with default board |
| `PUT` | `/api/workspaces/:id` | Update workspace settings |
| `POST` | `/api/workspaces/:id/members` | Invite new workspace member |
| `DELETE` | `/api/workspaces/:id/members/:memberId` | Remove workspace member |
| `GET` | `/api/boards/:id/full` | Get full board data (workspace, board, lists, cards) |
| `POST` | `/api/lists` | Create a new board column |
| `PUT` | `/api/lists/:id` | Update column title or order |
| `DELETE` | `/api/lists/:id` | Delete column and its cards |
| `POST` | `/api/cards` | Create new task / issue card |
| `GET` | `/api/cards/:id` | Get card details |
| `PUT` | `/api/cards/:id` | Update card fields (priority, labels, status) |
| `DELETE` | `/api/cards/:id` | Delete card |
| `POST` | `/api/cards/reorder` | Drag-and-drop move card across or within lists |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (running locally or MongoDB Atlas connection string)
- [npm](https://www.npmjs.com/)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/samarth13p2417-bit/workplace-website-.git
   cd workplace-website-
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start Fullstack Application (Backend + Frontend)**
   ```bash
   npm run dev
   ```
   - **Backend API**: `http://localhost:5000`
   - **Frontend App**: `http://localhost:5173`

   *Or run them in separate terminals:*
   - Backend only: `npm run server`
   - Frontend only: `npm run client`

### Build for Production

```bash
npm run build
```

The production-ready files will be output to the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

---

## 📸 Application Flow

```
Landing Page  →  Login (Email / Google / Microsoft)  →  Role Selection  →  Workspace Dashboard
                                                                              ├── Kanban Board
                                                                              ├── Development View
                                                                              ├── Team Members
                                                                              └── Settings
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👤 Author

**Samarth Choudhary**
- GitHub: [@samarth13p2417-bit](https://github.com/samarth13p2417-bit)
