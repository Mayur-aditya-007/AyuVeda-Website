# Node.js Backend for Login and Signup with Gmail OTP

This is a Node.js backend for handling user login and signup using Gmail for OTP verification.

## Project Structure

- **config/**: Configuration files (e.g., database configuration)
- **controllers/**: Contains functions to handle request logic for authentication and other operations
- **models/**: Mongoose models for database schema
- **node_modules/**: Project dependencies (ignored by Git)
- **routes/**: API route definitions
- **utils/**: Utility functions and helper modules (like Email sender, nodemailer)
- **.env**: Environment variables (e.g., email credentials, database URI) - _not included in version control_
- **app.js**: Main application entry point
- **package.json**: Project dependencies and scripts

## Setup Instructions

1. **Clone the repository**:

   git clone "https://github.com/meharyamaan/react-redux-login.git"
   cd "react-redux-login"

2.Install dependencies:
npm install

3. Environment Variables:
   Create a .env file in the root directory with the following variabl

   MONGO_URI="your db string"
   JWT_SECRET="mysecret"
   SMTP_EMAIL=your email
   SMTP_PASSWORD=email password
   PORT=

4.Start the Server:
npm start
