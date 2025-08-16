# Easy Padhai - Learning Management System

A comprehensive Learning Management System (LMS) built with React, Node.js, and MongoDB, designed to make learning easy and accessible.

## 🚀 Features

- **User Authentication** - Secure login/registration with reCAPTCHA
- **Dashboard** - Comprehensive overview of learning activities
- **User Management** - Admin, teachers, and student roles
- **Batch Management** - Organize students into learning groups
- **Lesson Library** - Create and manage educational content
- **Test Management** - Online and offline assessment tools
- **Homework System** - Assign and track student assignments
- **Notification System** - Keep users informed of updates
- **Responsive Design** - Works on all devices

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Zustand** - State management
- **React Query** - Data fetching and caching

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Token authentication
- **Bcrypt** - Password hashing
- **Multer** - File upload handling

## 📋 Prerequisites

Before running this application, make sure you have:

- **Node.js** (v18 or higher)
- **MongoDB** (v5 or higher)
- **Git** (for cloning the repository)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/FASC-AI/easyPadhai.git
cd easyPadhai
```

### 2. Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Environment Setup

#### Backend Environment
Create `backend/.env` file:

```env
NODE_ENV=development
PORT=3001
MONGODB_URL=mongodb://localhost:27017/easy-padhai
JWT_KEY=your-super-secret-jwt-key-change-this-in-production
BCRYPT_SALT_ROUNDS=10
BASE_URL=http://localhost:3001
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-s3-bucket-name
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
NODEMAILER_USER=your-email@gmail.com
NODEMAILER_PASS=your-app-password
MAIL_FROM_ADDRESS=your-email@gmail.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
googleClientId=your-google-client-id
googleProjectId=your-google-project-id
googleClientSecret=your-google-client-secret
RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key
```

#### Frontend Environment
Create `frontend/.env` file:

```env
VITE_APP_BASE_URL=http://localhost:3001
VITE_APP_BASE_URL_V1=http://localhost:3001/api/v1
VITE_RECAPTCHA_KEY=your-recaptcha-site-key
```

### 4. Database Setup

#### Option 1: Fresh Installation
```bash
# Start MongoDB service
mongod

# The application will create the database automatically on first run
```

#### Option 2: Restore from Backup
```bash
# If you have a database backup
mongorestore --uri="mongodb://localhost:27017/easy-padhai" --drop --dir="path/to/backup/directory"
```

### 5. Start the Application

#### Start Backend Server
```bash
cd backend
npm run dev
```
Backend will run on: http://localhost:3001

#### Start Frontend Server (in a new terminal)
```bash
cd frontend
npm run dev
```
Frontend will run on: http://localhost:3000

## 🌐 Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api/v1

## 📱 Default Login

After setting up the database, you can create a new user through the registration page or use the default admin credentials if they exist in your database.

## 🔧 Available Scripts

### Backend Scripts
```bash
npm run dev          # Start development server with nodemon
npm run build        # Build for production
npm run serve        # Serve production build
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format code with Prettier
```

### Frontend Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 📁 Project Structure

```
easyPadhai/
├── backend/                 # Backend API server
│   ├── src/
│   │   ├── api/            # API routes and controllers
│   │   ├── config/         # Configuration files
│   │   ├── core/           # Core server setup
│   │   ├── middlewares/    # Express middlewares
│   │   ├── services/       # Business logic services
│   │   └── utils/          # Utility functions
│   ├── package.json
│   └── .env
├── frontend/                # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── layouts/        # Layout components
│   │   ├── services/       # API service functions
│   │   ├── store/          # State management
│   │   ├── utils/          # Utility functions
│   │   └── routes/         # Route configurations
│   ├── package.json
│   └── .env
├── db/                      # Database backup files
└── README.md
```

## 🔐 Authentication & Security

- **JWT-based authentication** with secure token storage
- **Password hashing** using bcrypt
- **reCAPTCHA integration** for form protection
- **Rate limiting** to prevent abuse
- **Input sanitization** to prevent injection attacks

## 📊 Database Collections

The application uses the following MongoDB collections:
- `users` - User accounts and authentication
- `userinfos` - Extended user information
- `batches` - Learning batch management
- `lessons` - Educational content
- `tests` - Assessment materials
- `homeworks` - Assignment tracking
- `institutes` - Educational institutions
- `subjects` - Academic subjects
- `classes` - Academic classes
- And many more...

## 🚨 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Kill process using port 3000 or 3001
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   ```

2. **MongoDB Connection Failed**
   - Ensure MongoDB service is running
   - Check connection string in `.env` file
   - Verify MongoDB is accessible on localhost:27017

3. **Frontend Build Errors**
   ```bash
   cd frontend
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Backend Start Issues**
   ```bash
   cd backend
   rm -rf node_modules package-lock.json
   npm install
   ```

### Environment Variables Issues
- Ensure all required environment variables are set
- Check for typos in variable names
- Verify file paths are correct

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the troubleshooting section above
2. Review the error logs in the terminal
3. Check the browser console for frontend errors
4. Verify all environment variables are correctly set

## 🎯 Next Steps

After successful setup:
1. **Create your first user account** through registration
2. **Explore the dashboard** to understand the interface
3. **Set up your educational content** (subjects, classes, lessons)
4. **Configure reCAPTCHA keys** for production use
5. **Set up email services** for notifications
6. **Configure AWS S3** for file uploads (if needed)

---

**Happy Learning with Easy Padhai! 🎓**
