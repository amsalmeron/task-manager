# Task Management System

A full-stack collaborative task management application built with React, Node.js, Express, and PostgreSQL. Teams can organize work, track progress, and manage priorities with an intuitive, modern interface.

![Task Manager Demo](https://via.placeholder.com/800x400?text=Add+Screenshot+Here)

## 🚀 Features

### Task Management
- ✅ Create, read, update, and delete tasks
- 📊 Status tracking (To Do, In Progress, Done)
- 🎯 Priority levels (Low, Medium, High)
- 🔍 Advanced filtering by status, priority, and team
- 👤 Task assignment to team members
- 📅 Due date tracking

### Team Collaboration
- 👥 Create and manage teams
- 🔐 Role-based access (Admin, Member)
- ➕ Add/remove team members
- 📋 View team member lists
- 🎨 Team-based task organization

### User Management
- 🔒 Secure authentication with JWT tokens
- 🔑 Password hashing with bcrypt
- 👤 User registration and login
- 🚪 Protected routes and authorization
- 📧 Email-based user identification

### User Interface
- 🎨 Modern gradient design with purple theme
- ✨ Smooth animations and hover effects
- 📱 Responsive layout
- 🎯 Color-coded status and priority badges
- 📊 Dashboard with task statistics
- 🔔 Real-time UI updates

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Context API** - State management
- **Modern CSS** - Styling with gradients and animations

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **PostgreSQL** - Relational database
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing

### Development Tools
- **Vite** - Build tool and dev server
- **nodemon** - Auto-restart for development
- **Git** - Version control

## 📋 Prerequisites

- Node.js (v20.x or higher)
- PostgreSQL (v13 or higher)
- npm or yarn

## 🔧 Installation

### 1. Clone the repository
```bash
git clone https://github.com/amsalmeron/task-manager.git
cd task-manager
```

### 2. Set up the database
```bash
# Start PostgreSQL and create database
psql -U postgres
CREATE DATABASE task_manager;
\c task_manager

# Run the schema (copy from backend setup)
# See database schema section below
```

### 3. Install backend dependencies
```bash
cd backend
npm install
```

### 4. Configure backend environment
Create `backend/.env`:
```env
PORT=5001
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/task_manager
JWT_SECRET=your_super_secret_jwt_key_change_in_production
NODE_ENV=development
```

### 5. Install frontend dependencies
```bash
cd ../frontend
npm install
```

### 6. Start development servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5001

## 📊 Database Schema

```sql
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Teams table
CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Team members junction table
CREATE TABLE team_members (
    id SERIAL PRIMARY KEY,
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id, user_id)
);

-- Tasks table
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'todo',
    priority VARCHAR(50) DEFAULT 'medium',
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
    due_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register    - Register new user
POST   /api/auth/login       - Login user
GET    /api/auth/me          - Get current user (protected)
```

### Tasks
```
GET    /api/tasks            - Get all tasks (with filters)
GET    /api/tasks/:id        - Get single task
POST   /api/tasks            - Create new task
PUT    /api/tasks/:id        - Update task
DELETE /api/tasks/:id        - Delete task
```

### Teams
```
GET    /api/teams                      - Get user's teams
GET    /api/teams/:id                  - Get team details
POST   /api/teams                      - Create new team
GET    /api/teams/:id/members          - Get team members
POST   /api/teams/:id/members          - Add team member
DELETE /api/teams/:id/members/:userId  - Remove team member
```

### Query Parameters for Tasks
```
?status=todo|in_progress|done
?priority=low|medium|high
?teamId=<team_id>
```

## 📁 Project Structure

```
task-manager/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          # Database connection
│   │   ├── controllers/
│   │   │   ├── authController.js    # Auth logic
│   │   │   ├── taskController.js    # Task CRUD
│   │   │   └── teamController.js    # Team management
│   │   ├── middleware/
│   │   │   └── auth.js              # JWT verification
│   │   ├── routes/
│   │   │   ├── auth.js              # Auth routes
│   │   │   ├── tasks.js             # Task routes
│   │   │   └── teams.js             # Team routes
│   │   └── server.js                # Express app
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/              # Reusable components
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Auth state
│   │   ├── pages/
│   │   │   ├── Login.jsx            # Login page
│   │   │   ├── Register.jsx         # Register page
│   │   │   └── Dashboard.jsx        # Main dashboard
│   │   ├── utils/
│   │   │   └── api.js               # API client
│   │   ├── App.jsx                  # Main app component
│   │   ├── main.jsx                 # Entry point
│   │   └── index.css                # Global styles
│   └── package.json
│
└── README.md
```

## 🎯 Usage

### Getting Started
1. **Register an account** - Create your user profile
2. **Create a team** - Click "Create Team" and add details
3. **Add team members** - Invite others by email
4. **Create tasks** - Assign tasks to team members with priorities
5. **Track progress** - Update task status as work progresses
6. **Filter tasks** - Use filters to focus on specific work

### Task Management Tips
- Use **High priority** for urgent tasks
- Assign tasks to specific team members for accountability
- Update status regularly to keep everyone informed
- Use **filters** to focus on what matters most

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd frontend
vercel --prod
```

### Backend (Railway/Render)
1. Create new project
2. Connect GitHub repository
3. Set environment variables
4. Deploy

### Database (Railway)
1. Create PostgreSQL database
2. Note connection string
3. Update backend DATABASE_URL

## 🔐 Security Features

- Passwords hashed with bcrypt (10 salt rounds)
- JWT tokens with 7-day expiration
- Protected routes requiring authentication
- Role-based authorization for team admins
- SQL injection prevention with parameterized queries
- CORS enabled for frontend-backend communication

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration with validation
- [ ] User login and logout
- [ ] Token persistence across page refreshes
- [ ] Create team as admin
- [ ] Add members to team
- [ ] Create task with all fields
- [ ] Update task status
- [ ] Filter tasks by status and priority
- [ ] Delete task (admin only)
- [ ] Proper error messages for failures

## 🔮 Future Enhancements

### Planned Features
- [ ] Task comments and activity log
- [ ] File attachments
- [ ] Email notifications
- [ ] Task dependencies
- [ ] Calendar view
- [ ] Sprint/milestone tracking
- [ ] Task templates
- [ ] Time tracking
- [ ] Reports and analytics
- [ ] Dark mode
- [ ] Mobile app

### Technical Improvements
- [ ] Unit and integration tests
- [ ] API rate limiting
- [ ] Redis caching
- [ ] WebSocket for real-time updates
- [ ] Docker containerization
- [ ] CI/CD pipeline

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the MIT License.

## 👤 Author

**Antonio Salmeron**
- GitHub: [@amsalmeron](https://github.com/amsalmeron)
- LinkedIn: [Antonio Salmeron](https://linkedin.com/in/antonio-salmeron)

## 🙏 Acknowledgments

- Built as a portfolio project to demonstrate full-stack development skills
- Inspired by modern task management tools like Asana and Trello
- Thanks to the React, Node.js, and PostgreSQL communities

---

⭐ Star this repository if you find it helpful!