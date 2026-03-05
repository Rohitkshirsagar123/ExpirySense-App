# 📋 ExpirySense - Smart Document Expiration Tracker

> **Never miss an important document deadline again!** 
> 
> ExpirySense is an intelligent mobile application that helps you track, organize, and get timely reminders for all your important document expiration dates.

---

## 🎯 What is ExpirySense?

ExpirySense is a **full-stack document management solution** designed to simplify your life by automatically tracking document expirations. Whether it's driver's licenses, passports, insurance documents, or certifications—ExpirySense sends you **smart reminders before they expire**, so you never miss a deadline.

### Why ExpirySense?

✅ **Never Miss a Deadline** - Automatic reminders before documents expire  
✅ **Centralized Storage** - Keep all important documents in one secure place  
✅ **Smart Notifications** - Customizable reminder schedules  
✅ **Easy to Use** - Intuitive mobile-first interface  
✅ **Cross-Platform** - Works seamlessly on Android & iOS  
✅ **Secure** - Firebase-backed authentication & data protection  

---

## 🏗️ Architecture Overview

ExpirySense uses a modern **full-stack architecture** with separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│                    React Native Frontend                │
│              (Mobile App - Android & iOS)               │
└──────────────────────┬──────────────────────────────────┘
                       │ REST API
┌──────────────────────▼──────────────────────────────────┐
│            Node.js Express Backend API                  │
│          (Authentication, Documents, Reminders)         │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                  Firebase Services                      │
│        (Authentication, Database, Cloud Storage)        │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 Project Directory Structure

```
ExpirySense/
│
├─ 📱 frontend/                          # React Native Mobile Application
│  ├─ src/
│  │  ├─ 🖼️  screens/                   # App Screens (Dashboard, Login, etc.)
│  │  ├─ 🧩 components/                 # Reusable UI Components
│  │  ├─ 🔧 services/                   # API Communication & Business Logic
│  │  ├─ 🗺️  navigation/                # App Navigation Configuration
│  │  ├─ 🔥 database/                   # Firebase Configuration
│  │  ├─ 🌐 context/                    # React Context for State Management
│  │  └─ ⚙️ config/                     # App Configuration Files
│  ├─ 🤖 android/                       # Android Native Code & Build Config
│  ├─ 📄 App.js                         # App Entry Point
│  ├─ 📦 package.json
│  └─ ⚡ app.json
│
└─ 🔧 backend/                          # Node.js Express REST API
   ├─ 🛣️  routes/                       # API Route Handlers
   ├─ 🔨 services/                      # Business Logic & Reminders
   ├─ ⚙️  config/                       # Configuration Files
   ├─ 🚀 server.js                      # Express Server Entry Point
   └─ 📦 package.json
```

---

## ✨ Key Features

### 📲 Mobile App (Frontend)
- **Dashboard** - Overview of all your documents at a glance
- **Document Management** - Add, edit, and delete documents easily
- **Smart Reminders** - Receive notifications before expiration
- **Secure Authentication** - Sign up, login, and profile management
- **Notification Center** - View all alerts and reminders
- **Customizable Settings** - Control reminder frequency and preferences
- **Responsive UI** - Beautiful, intuitive interface for all devices

### 🔐 Backend API (Services)
- **User Authentication** - Secure login & registration
- **Document CRUD** - Create, read, update, delete operations
- **Reminder Engine** - Automated reminder scheduling
- **Notification Service** - Send timely alerts to users
- **RESTful API** - Clean, well-documented endpoints
- **Firebase Integration** - Real-time data sync & cloud storage

---

## 🚀 Quick Start Guide

### Prerequisites

Make sure you have these installed:
- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **Expo CLI** - For React Native development
- **Android SDK** or **iOS SDK** - For mobile development

### Installation & Running

#### 1️⃣ Clone & Navigate
```bash
git clone https://github.com/yourusername/ExpirySense.git
cd ExpirySense
```

#### 2️⃣ Setup Backend

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Start the server (runs on http://localhost:5000)
npm start
```

#### 3️⃣ Setup Frontend

```bash
# Open a new terminal and navigate to frontend
cd frontend

# Install dependencies
npm install

# Start the app (choose your platform)
npx expo start --dev-client

# For Android
# Press 'a' to open Android emulator

# For iOS
# Press 'i' to open iOS simulator
```

---

## 🏠 Mobile App (Frontend)

**React Native Application** - Cross-platform mobile development with Expo

### 📱 Technology Stack
| Technology | Purpose |
|-----------|---------|
| **React Native** | Mobile app framework |
| **Expo** | Development & deployment platform |
| **Firebase** | Authentication & real-time database |
| **Redux** | Global state management |
| **Context API** | Local state management |
| **React Navigation** | Screen navigation |

### 🎨 Screens Overview

| Screen | Purpose |
|--------|---------|
| **Welcome Screen** | First-time user introduction |
| **Login/Register** | User authentication |
| **Dashboard** | Main document overview |
| **Add Document** | Create new document entry |
| **Notifications** | View all alerts & reminders |
| **Reminder Settings** | Configure notification preferences |
| **Profile** | User account information |
| **Settings** | App configuration & preferences |

### 🏃 Running on Device/Emulator

```bash
cd frontend

# Start Expo development server
npx expo start --dev-client

# Then:
# • Press 'a' for Android emulator
# • Press 'i' for iOS simulator
# • Scan QR code with Expo Go app on real device
```

---

## 🔧 Backend API (Express Server)

**Node.js REST API** - Handles all backend logic and business operations

### 📡 Technology Stack
| Technology | Purpose |
|-----------|---------|
| **Node.js** | Runtime environment |
| **Express.js** | Web framework |
| **Firebase Admin SDK** | Server-side Firebase operations |
| **RESTful API** | Standard HTTP API design |

### 🛣️ API Endpoints

#### Authentication Routes
```
POST   /api/auth/register         → Create new user account
POST   /api/auth/login            → User login
```

#### Document Management Routes
```
GET    /api/documents             → Fetch all user documents
POST   /api/documents             → Create new document
PUT    /api/documents/:id         → Update document details
DELETE /api/documents/:id         → Delete a document
```

#### Notification Routes
```
GET    /api/notifications         → Fetch all notifications
POST   /api/notifications         → Send notification
```

#### Reminder Routes
```
POST   /api/reminders             → Create reminder
GET    /api/reminders             → Get all reminders
```

### 🏃 Starting the Server

```bash
cd backend

# Install dependencies
npm install

# Start server (development)
npm start

# Server runs on http://localhost:5000
```

---

## 🔐 Environment Configuration

### Backend Setup (`.env` file)

Create a `.env` file in the `backend/` directory:

```env
# Firebase Configuration
FIREBASE_API_KEY=your_api_key_here
FIREBASE_PROJECT_ID=your_project_id_here
FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
FIREBASE_DATABASE_URL=your_database_url_here

# Server Configuration
PORT=5000
NODE_ENV=development
```

### Frontend Setup

Configure Firebase in `frontend/src/database/firebaseConfig.js`:

```javascript
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

export const app = initializeApp(firebaseConfig);
```

---

## 📚 Key Configuration Files

| File | Location | Purpose |
|------|----------|---------|
| Firebase Config | `backend/config/firebase.js` | Backend Firebase setup |
| Reminder Config | `frontend/src/config/reminderConfig.js` | Reminder scheduling settings |
| Firebase Config | `frontend/src/database/firebaseConfig.js` | Frontend Firebase setup |

---

## 🛠️ Development Workflow

### Backend Development

```bash
cd backend

# Install all dependencies
npm install

# Start server with auto-reload (recommended)
npm start

# Run tests
npm test
```

### Frontend Development

```bash
cd frontend

# Install all dependencies
npm install

# Start Expo development server
npx expo start --dev-client

# Clear cache if needed
npx expo start --clear

# Clear npm cache
npm cache clean --force
```

---

## 🐛 Troubleshooting Guide

### ❌ Backend Won't Start

**Problem:** Port 5000 already in use or Node.js not installed

**Solution:**
```bash
# Check Node.js installation
node --version

# Kill process on port 5000 (Windows)
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or use a different port
PORT=3001 npm start
```

### ❌ Frontend Build Fails

**Problem:** Dependency or cache issues

**Solution:**
```bash
cd frontend

# Clear all caches and reinstall
rm -r node_modules
npm cache clean --force
npm install

# Clear Expo cache
npx expo start --clear
```

### ❌ Firebase Connection Issues

**Problem:** Environment variables not loaded

**Solution:**
```bash
# Verify .env file exists in backend/ directory
# Check that serviceAccountKey.json is properly placed
# Restart the backend server
npm start
```

### ❌ Android Emulator Won't Connect

**Problem:** Emulator can't reach localhost server

**Solution:**
```bash
# Use 10.0.2.2 instead of localhost for Android
# Update API calls to: http://10.0.2.2:5000
```

---

## 📁 Important Files & Components

| File | Purpose |
|------|---------|
| [frontend/App.js](frontend/App.js) | Main React Native app entry point |
| [backend/server.js](backend/server.js) | Express server entry point |
| [backend/routes/](backend/routes/) | All API endpoint implementations |
| [frontend/src/screens/](frontend/src/screens/) | App screen components |
| [frontend/src/services/](frontend/src/services/) | API communication services |

---

## 🤝 Contributing

We welcome contributions! Here's how to help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

---

## 📜 License

This project is licensed under the **MIT License** - see the LICENSE file for details.

---

## 💡 Tips & Best Practices

- **Always update dependencies:** `npm update`
- **Use environment variables** for sensitive data
- **Test on real device** before production
- **Keep commits small** and descriptive
- **Document your changes** in commit messages

---

## 🆘 Need Help?

- 📖 Check the troubleshooting section above
- 🐛 Open an issue on GitHub
- 💬 Create a discussion for questions
- 📧 Contact the development team

---

## 🎉 Getting Started Checklist

- [ ] Install Node.js and npm
- [ ] Clone the repository
- [ ] Setup Firebase project
- [ ] Configure environment variables
- [ ] Install backend dependencies
- [ ] Start backend server
- [ ] Install frontend dependencies
- [ ] Start Expo development server
- [ ] Test on emulator or real device
- [ ] Happy coding! 🚀

---

**Last Updated:** March 5, 2026  
**Status:** Active Development  
**Version:** 1.0.0
