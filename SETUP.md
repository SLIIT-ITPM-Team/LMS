# LMS Project Setup Guide

This guide helps team members set up the LMS (Learning Management System) project on their local machines. The project uses a MERN stack (MongoDB, Express, React, Node.js) with Vite for the frontend build tool.

## Prerequisites

- **Node.js**: Version 18 or higher (recommended: latest LTS)
- **MongoDB**: Local installation or MongoDB Atlas account
- **Git**: For version control

## Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd LMS
```

### 2. Install Dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to project root
cd ..
```

### 3. Environment Configuration

#### Backend Configuration
```bash
# Copy the example environment file
cp backend/.env.example backend/.env

# Edit the .env file with your settings
# Key variables to configure:
# - PORT: Backend server port (default: 5001)
# - MONGODB_URI: MongoDB connection string
# - JWT_SECRET: Secret for JWT tokens
# - FRONTEND_URLS: Comma-separated list of allowed frontend origins
```

#### Frontend Configuration
```bash
# Copy the example environment file
cp frontend/.env.example frontend/.env

# Edit the .env file with your settings
# Key variables to configure:
# - VITE_API_BASE_URL: API base URL (default: http://localhost:5001)
```

### 4. Start the Development Servers

#### Option 1: Manual Start (Recommended for first time)
```bash
# Terminal 1: Start backend server
cd backend
npm start

# Terminal 2: Start frontend server
cd frontend
npm run dev
```

#### Option 2: Using the Development Utility Script
```bash
# Run the setup checker and get helpful information
node scripts/dev.js

# This will check:
# - Node.js version
# - Port availability
# - Environment configuration
# - MongoDB connection
# - Backend health status
```

## Project Structure

```
LMS/
├── backend/           # Express.js backend server
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── middlewares/    # Custom middleware (including CORS)
│   │   └── utils/          # Utility functions
│   ├── .env             # Backend environment variables
│   └── package.json
├── frontend/          # React frontend with Vite
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── api/            # API calls and axios configuration
│   │   └── hooks/          # Custom hooks
│   ├── .env             # Frontend environment variables
│   └── package.json
├── scripts/           # Development utility scripts
└── SETUP.md         # This file
```

## CORS Configuration

The project includes robust CORS handling to prevent cross-origin errors:

### Development Mode
- **Automatic Port Detection**: The backend allows all origins in development mode
- **Vite Proxy**: Frontend uses a proxy to avoid CORS issues entirely
- **Dynamic Origins**: Common Vite ports (5173-5180) are automatically allowed

### Production Mode
- **Environment-Based**: CORS origins are configured via `FRONTEND_URLS` environment variable
- **Strict Validation**: Only explicitly allowed origins are permitted

### Troubleshooting CORS Issues

If you encounter CORS errors:

1. **Check Backend Health**:
   ```bash
   curl http://localhost:5001/api/health
   ```

2. **Verify Environment Variables**:
   - Ensure `FRONTEND_URLS` includes your frontend origin
   - Check that `NODE_ENV` is set correctly

3. **Clear Browser Cache**:
   - Clear cookies and cache
   - Try incognito mode

4. **Check Port Conflicts**:
   - Use `node scripts/dev.js` to check port availability
   - Adjust ports in environment files if needed

## Common Issues and Solutions

### Port Already in Use
```bash
# Check what's using the port
lsof -i :5001  # For backend
lsof -i :5173  # For frontend

# Solution: Change the port in environment files
# Backend: Edit backend/.env PORT variable
# Frontend: Edit frontend/vite.config.js server.port
```

### MongoDB Connection Issues
```bash
# Local MongoDB
# Ensure MongoDB is running: mongod

# MongoDB Atlas
# Update MONGODB_URI in backend/.env with your Atlas connection string
```

### Missing Dependencies
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# For both backend and frontend
cd backend && npm install
cd ../frontend && npm install
```

### Environment Variables Not Loading
```bash
# Ensure .env files are in the correct directories
# Backend .env should be in backend/ directory
# Frontend .env should be in frontend/ directory

# Restart the development servers after making changes
```

## Development Workflow

### Starting Development
1. Run `node scripts/dev.js` to check your setup
2. Start backend: `cd backend && npm start`
3. Start frontend: `cd frontend && npm run dev`
4. Access frontend at `http://localhost:5173`
5. Access backend API at `http://localhost:5001`

### Making Changes
- **Backend**: Changes automatically restart with nodemon
- **Frontend**: Changes hot-reload in the browser
- **Environment**: Restart servers after changing .env files

### Testing
- **Backend**: Use Postman or curl to test API endpoints
- **Frontend**: Use browser developer tools for debugging
- **Health Check**: Visit `http://localhost:5001/api/health` for server status

## Team Collaboration

### Environment Consistency
- Always use the `.env.example` files as templates
- Document any custom environment variables
- Use the development utility script to verify setups

### Port Management
- Default ports: Backend (5001), Frontend (5173)
- If ports conflict, use the next available port
- Update environment files accordingly

### Code Style
- Follow existing code patterns
- Use consistent naming conventions
- Test changes on a fresh clone if possible

## Getting Help

If you encounter issues:

1. **Check the Health Endpoint**: `http://localhost:5001/api/health`
2. **Run the Setup Checker**: `node scripts/dev.js`
3. **Review Console Logs**: Check both backend and frontend console output
4. **Clear Cache**: Clear browser cache and restart servers
5. **Ask Team**: Share console output and error messages with the team

## Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://reactjs.org/)
- [MongoDB Documentation](https://docs.mongodb.com/)