# The Safe Bunk

The Safe Bunk is a comprehensive student attendance management system designed to help students track their attendance records, manage timetables, and calculate safe skipping opportunities ("bunks") while maintaining required attendance percentages.

### [Live Demo](https://swastikshetty06.github.io/TheSafeBunk/)

## Features

- **Smart Dashboard**: Real-time overview of current attendance status, upcoming classes, and safe bunk metrics.
- **Attendance Tracking**: Easy-to-use interface for marking attendance (Present/Absent/Cancelled).
- **Safe Bunk Calculator**: Algorithmic logic that tells you exactly how many classes you can skip while staying above your target percentage (e.g., 75%).
- **Timetable Management**: Organized class schedule viewing.
- **Analytics**: Visual representation of attendance trends using charts.
- **User Authentication**: Secure login and registration system.

## Tech Stack

### Frontend
- **Framework**: React 19 (via Vite)
- **Styling**: Tailwind CSS 4
- **State Management**: Redux Toolkit
- **Routing**: React Router DOM
- **UI Components**: Lucide React (Icons), Framer Motion (Animations)
- **Charts**: Recharts
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (via Mongoose)
- **Authentication**: JWT (JSON Web Tokens) & BcryptJS
- **Task Scheduling**: Node-cron (for automated tasks)

## Installation & Setup

### Prerequisites
- Node.js (v20 or higher)
- MongoDB Database URI

### 1. Clone the Repository
```bash
git clone https://github.com/SwastikShetty06/TheSafeBunk.git
cd TheSafeBunk
```

### 2. Backend Setup
Navigate to the backend directory and install dependencies:
```bash
cd safe-bunk-backend
npm install
```

Create a `.env` file in the `safe-bunk-backend` directory:
```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

Start the backend server:
```bash
npm start
```

### 3. Frontend Setup
Open a new terminal, navigate to the frontend directory and install dependencies:
```bash
cd safe-bunk-frontend
npm install
```

Start the development server:
```bash
npm run dev
```

The application should now be running at `http://localhost:5173`.

## Deployment

- **Frontend**: Deployed on GitHub Pages. [Live Link](https://swastikshetty06.github.io/TheSafeBunk/)
- **Backend**: Hosted on Vercel.
