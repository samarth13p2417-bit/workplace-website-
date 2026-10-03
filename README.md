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

| Category       | Technology                                                     |
| -------------- | -------------------------------------------------------------- |
| **Framework**  | [React 18](https://react.dev/)                                 |
| **Build Tool** | [Vite 6](https://vitejs.dev/)                                  |
| **Styling**    | [Tailwind CSS 3](https://tailwindcss.com/)                     |
| **Drag & Drop**| [@hello-pangea/dnd](https://github.com/hello-pangea/dnd)       |
| **Icons**      | [Lucide React](https://lucide.dev/)                            |
| **Email**      | [EmailJS](https://www.emailjs.com/)                            |
| **Language**   | JavaScript (ES Modules)                                        |

---

## 📁 Project Structure

```
workplace-website/
├── index.html                    # Entry HTML
├── package.json                  # Dependencies & scripts
├── vite.config.js                # Vite configuration
├── tailwind.config.js            # Tailwind CSS configuration
├── postcss.config.js             # PostCSS configuration
└── src/
    ├── main.jsx                  # React entry point
    ├── App.jsx                   # Root app with routing & auth
    ├── index.css                 # Global styles
    ├── emailjs.config.js         # EmailJS configuration
    ├── assets/                   # Static assets
    ├── services/                 # API & service modules
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

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

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

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173` (default Vite port)

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
