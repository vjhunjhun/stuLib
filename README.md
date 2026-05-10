# StuLib - Student Library Management System

A comprehensive web-based library management system designed for educational institutions. Built with Node.js, Express, MongoDB, and EJS, StuLib enables students to browse books, borrow items, track requests, and manage their library profiles efficiently.

**Live Demo:** [Deployed on Render](https://stulib-library.onrender.com)

## 📋 Table of Contents

- [Features](#features)
- [Project Overview](#project-overview)
- [Demo Account](#demo-account)
- [Technology Stack](#technology-stack)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Email Configuration](#email-configuration)
- [License](#license)

## ✨ Features

### 🔐 Authentication & Account Management
- User registration and login with passport-local authentication
- Email verification for new accounts
- Password reset functionality
- User profile management
- Account deletion with associated data cleanup

### 📚 Book Management
- Browse available books in the library
- Search books by title, author, or other criteria
- View detailed book information
- Book lending history tracking
- Personal library of borrowed books

### 📤 Borrowing System
- Request to borrow books with due date calculation
- Track borrowed books and their status
- View borrowing history
- Manage active borrowings

### 💬 Request Management
- Send and receive book requests
- Track pending requests
- Manage request notifications
- Request status updates

### 📊 User Dashboard
- View personalized profile information
- Track library statistics
- Manage active borrowings
- View activity history

### 🔧 Administrative Features
- Site-wide statistics tracking
- Book inventory management
- User management capabilities

## 📖 Project Overview

StuLib is built as an educational project to demonstrate modern web development practices including:
- RESTful API design with Express.js
- MongoDB database modeling and management
- Passport authentication strategies
- EJS templating for dynamic views
- Bootstrap-styled responsive UI
- Error handling and validation with Joi

### Educational Purpose

This project is developed for **educational and learning purposes** to showcase:
- Full-stack web application development
- User authentication and authorization
- Database design and management
- Session management and flash notifications
- Responsive web design principles

## 🎯 Demo Account

Since email functionality requires domain configuration (not setup for this educational version), two demo accounts have been created for testing purposes:

| Username | Password | Purpose |
|----------|----------|---------|
| **demo** | demo | Testing the complete student interface and features |
| **demo1** | demo1 | Additional account for testing multi-user scenarios |

### Demo Account Limitations

Demo accounts are for testing purposes only and have the following restrictions:
- ❌ Cannot change password
- ❌ Cannot delete account

These restrictions ensure the demo accounts remain available for all visitors to explore the system's functionality.

**To explore all features including password change and account deletion, you would need to:**
1. Configure email service (see [Email Configuration](#email-configuration) section)
2. Create your own account with a valid email address
3. Complete the email verification process

## 🛠️ Technology Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose ODM
- **Authentication:** Passport.js with Local Strategy
- **Email Service:** Resend (pre-configured but requires API key)
- **Frontend:** EJS Templates, Bootstrap, HTML5, CSS3, JavaScript
- **Validation:** Joi Schema Validation
- **Session Management:** Express Session with Connect Flash

### Dependencies

```json
{
  "connect-flash": "Flash message handling",
  "dotenv": "Environment variable management",
  "ejs": "Templating engine",
  "express": "Web framework",
  "express-session": "Session management",
  "joi": "Data validation",
  "mongoose": "MongoDB ODM",
  "nodemailer": "Email sending",
  "passport": "Authentication middleware",
  "passport-local": "Local authentication strategy",
  "passport-local-mongoose": "Mongoose authentication plugin"
}
```

## ⚙️ Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or cloud instance via MongoDB Atlas)

### Clone the Repository

```bash
git clone https://github.com/yourusername/stulib.git
cd stulib
```

### Install Dependencies

```bash
npm install
```

## 🔐 Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
MONGO_ATLAS_URL=mongodb+srv://username:password@cluster.mongodb.net/stulib

# Session Management
SECRET=your_super_secret_key_here_change_this

# Email Configuration (Optional - for registration)
RESEND_API_KEY=your_resend_api_key
BASE_URL=http://localhost:8080

# Server Configuration
PORT=8080
NODE_ENV=development
```

### Environment Variables Explanation

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGO_ATLAS_URL` | MongoDB connection string | Yes |
| `SECRET` | Session secret key (use a strong random string) | Yes |
| `RESEND_API_KEY` | API key for Resend email service | No* |
| `BASE_URL` | Base URL for email verification links | No* |
| `PORT` | Server port (default: 8080) | No |
| `NODE_ENV` | Environment mode (development/production) | No |

*\*Required only if you want to enable user registration with email verification*

## 🚀 Getting Started

### Local Development

1. **Setup Environment Variables**
   ```bash
   # Create .env file with the configuration above
   ```

2. **Start MongoDB**
   - Local: `mongod`
   - Or use MongoDB Atlas connection string in `.env`

3. **Run the Application**
   ```bash
   npm start
   # or with nodemon for development
   npm run dev
   ```

4. **Access the Application**
   - Open browser: `http://localhost:8080`
   - Login with demo account:
     - Username: `Demo` or `Demo1`
     - Password: Same as username

### Production (Render Deployment)

This project is configured for deployment on Render:

1. Push code to GitHub repository
2. Create new Web Service on Render connected to your repository
3. Configure environment variables in Render dashboard:
   - `MONGO_ATLAS_URL`
   - `SECRET`
   - `NODE_ENV=production`
4. Deploy automatically on push to main branch

**Build Command:** `npm install`
**Start Command:** `node index.js`

## 📁 Project Structure

```
stulib/
├── controller/
│   ├── student/          # Student-related request handlers
│   │   ├── book.js
│   │   ├── borrow.js
│   │   ├── profile.js    # Password change & account deletion
│   │   └── ...
│   └── user/             # User authentication handlers
│       └── user.js       # Signup, login, reset password
├── model/                # MongoDB data models
│   ├── student.js
│   ├── book.js
│   ├── lend.js
│   └── ...
├── routes/               # Express route definitions
│   ├── user.js
│   └── student/
├── views/                # EJS template files
│   ├── layouts/          # Base templates
│   ├── includes/         # Partial templates
│   ├── students/         # Student pages
│   └── users/            # User pages (login, signup)
├── public/               # Static files
│   ├── css/              # Stylesheets
│   └── js/               # Client-side scripts
├── utils/                # Helper functions
│   ├── wrapAsync.js      # Async error wrapper
│   └── ExpressError.js   # Custom error class
├── middleware.js         # Custom middleware
├── schema.js             # Joi validation schemas
├── index.js              # Application entry point
└── package.json
```

## 📧 Email Configuration

### Current Status
Email functionality has been implemented in the codebase but requires configuration:

**Location:** `controller/user/user.js`
- `sendEmailVerification()` - Account verification
- `sendResetVerification()` - Password reset verification  
- `sendNewPassword()` - Send temporary password

### How to Enable

1. **Get Resend API Key**
   - Sign up at [Resend.com](https://resend.com)
   - Create API key
   - Add to `.env`: `RESEND_API_KEY=your_key_here`

2. **Update Base URL**
   - For local: `BASE_URL=http://localhost:8080`
   - For production: `BASE_URL=https://yourdomain.com`

3. **Update Email Templates**
   - Customize HTML templates in `controller/user/user.js`
   - Modify sender email from `onboarding@resend.dev` to your domain

4. **Uncomment Registration**
   - User registration currently requires email verification
   - Once email is configured, users can self-register

### Alternative Email Services

The code uses Resend but can be modified to use:
- **Nodemailer** (already installed) - For Gmail, Outlook, custom SMTP
- **SendGrid**
- **Mailgun**
- **Amazon SES**

## 🧪 Testing Features

Use the demo accounts to test:

1. **Student Dashboard** - View profile and statistics
2. **Book Browsing** - Search and filter books
3. **Borrow Requests** - Request to borrow books
4. **Request Management** - Send and receive book requests
5. **Borrowing History** - View past borrowings
6. **Profile Management** - Update profile information

### Restricted Features (Demo Accounts)
- Password change
- Account deletion

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### MIT License Summary
- ✅ Free to use commercially
- ✅ Free to modify
- ✅ Free to distribute
- ✅ Free to use privately
- ❌ No liability or warranty

## 🤝 Contributing

This is an educational project. Contributions are welcome!

If you find bugs or have suggestions:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support & Questions

### For Technical Questions
- Review the code comments
- Check MongoDB and Express.js documentation
- Examine the project structure

### Known Limitations
- **Email Registration:** Requires domain configuration (not included in this educational version)
- **Demo Accounts:** Cannot be modified or deleted (by design)
- **Single Session:** One session per user

## 🔍 Key Learning Points

This project demonstrates:

1. **Backend Development**
   - RESTful API design principles
   - Middleware usage (authentication, error handling)
   - Async/await error handling patterns

2. **Database Design**
   - MongoDB schema design
   - Document relationships
   - Query optimization

3. **Authentication**
   - Passport.js integration
   - Session management
   - Password hashing and verification

4. **Frontend Development**
   - EJS templating
   - Bootstrap responsive design
   - Form validation

5. **Best Practices**
   - Error handling
   - Input validation
   - Code organization
   - Environment configuration

## 📈 Deployment Status

✅ **Currently Deployed on Render**
- Production URL: Check the GitHub repository
- Database: MongoDB Atlas
- Email: Pre-configured (awaiting API key)

---
