# LoonCamp Admin Panel - Production Guide

Complete production-ready admin panel for managing LoonCamp property bookings.

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Features](#features)
4. [Local Development Setup](#local-development-setup)
5. [Database Setup](#database-setup)
6. [Hostinger Deployment](#hostinger-deployment)
7. [Security Configuration](#security-configuration)
8. [API Endpoints](#api-endpoints)
9. [Admin Panel Usage](#admin-panel-usage)
10. [Troubleshooting](#troubleshooting)

---

## Overview

This admin panel allows you to:
- Manage property listings (create, edit, delete)
- Upload property images
- Toggle property visibility
- Mark properties as top-selling
- Secure authentication with JWT

**Architecture:**
- Frontend: React + TypeScript (Vite)
- Backend: Node.js + Express
- Database: MySQL (no ORM)
- Authentication: JWT + bcrypt

---

## Tech Stack

### Backend
- **Node.js** v16+
- **Express** - REST API framework
- **mysql2** - MySQL database driver
- **bcrypt** - Password hashing
- **jsonwebtoken** - JWT authentication
- **cors** - CORS middleware
- **dotenv** - Environment variables

### Frontend
- **React 18** with TypeScript
- **Vite** - Build tool
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components

---

## Features

### Authentication
- Secure admin login with JWT
- Token-based session management
- Auto-logout on token expiry
- Protected routes

### Property Management
- Create new properties with full details
- Edit existing properties
- Delete properties (with confirmation)
- Toggle active/inactive status
- Mark properties as top-selling
- Image management with drag-and-drop order

### Data Fields
- Title, slug (auto-generated)
- Description, category (camping/cottage/villa)
- Location, address, contact
- Pricing information
- Capacity & max capacity
- Check-in/check-out times
- Amenities, highlights, activities, policies (arrays)
- Multiple images with display order
- Rating (0-5 stars)

---

## Local Development Setup

### Prerequisites
- Node.js v16 or higher
- MySQL 5.7+ or 8.0+
- npm or yarn

### Step 1: Clone and Install

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
```

### Step 2: Configure Backend Environment

Create `backend/.env`:

```env
PORT=5001
NODE_ENV=development

# MySQL Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=looncamp_db
DB_PORT=3306

# JWT Secret (generate a strong random string)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=24h

# Frontend URL
FRONTEND_URL=http://localhost:5000
```

### Step 3: Configure Frontend Environment

Create `.env` in project root:

```env
VITE_API_URL=http://localhost:5001/api
```

### Step 4: Set Up Database

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE looncamp_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Import schema
mysql -u root -p looncamp_db < backend/schema.sql
```

### Step 5: Create Default Admin User

```bash
cd backend
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('admin123', 10).then(hash => console.log(hash));"
```

Copy the hash and update in `backend/schema.sql` before importing, OR run:

```sql
INSERT INTO admins (email, password_hash)
VALUES ('admin@looncamp.com', 'paste_bcrypt_hash_here');
```

### Step 6: Start Development Servers

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
npm run dev
```

Access:
- Frontend: http://localhost:5000
- Backend API: http://localhost:5001/api
- Admin Panel: http://localhost:5000/admin/login

**Default Credentials:**
- Email: `admin@looncamp.com`
- Password: `admin123` (CHANGE IMMEDIATELY!)

---

## Database Setup

### Schema Overview

**admins table:**
- Stores admin users with hashed passwords
- Uses bcrypt for password hashing

**properties table:**
- Complete property information
- JSON fields for amenities, highlights, activities, policies
- Automatic slug generation from title
- Boolean flags for active/top-selling status

**property_images table:**
- Stores image URLs with display order
- Foreign key to properties (cascade delete)

### Important Notes

1. **Database Connection:**
   - Uses connection pooling for performance
   - Prepared statements for SQL injection prevention
   - Automatic reconnection on failure

2. **Data Integrity:**
   - Foreign key constraints enabled
   - Cascade delete for property images
   - Unique constraints on email and slug

3. **JSON Fields:**
   - Amenities, highlights, activities, policies stored as JSON arrays
   - Parsed automatically by the API

---

## Hostinger Deployment

### Prerequisites
- Hostinger Business Plan or higher (with Node.js support)
- MySQL database access via cPanel
- SSH access (optional but recommended)

### Step 1: Create MySQL Database in cPanel

1. Login to Hostinger cPanel
2. Navigate to **MySQL Databases**
3. Create a new database:
   - Database name: `u123456_looncamp` (example)
   - Note the full database name (includes prefix)

4. Create a MySQL user:
   - Username: `u123456_admin` (example)
   - Generate a strong password
   - Note both username and password

5. Add user to database:
   - Select the database
   - Select the user
   - Grant **ALL PRIVILEGES**

6. Note your MySQL hostname:
   - Usually: `localhost` or `127.0.0.1`
   - Check in cPanel under "Remote MySQL"

### Step 2: Import Database Schema

**Option A: phpMyAdmin (Recommended)**
1. Go to cPanel > phpMyAdmin
2. Select your database
3. Click **Import** tab
4. Upload `backend/schema.sql`
5. Click **Go**

**Option B: Command Line (if SSH available)**
```bash
mysql -h localhost -u u123456_admin -p u123456_looncamp < backend/schema.sql
```

### Step 3: Create Admin User with Hashed Password

1. Generate bcrypt hash locally:
```bash
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('YOUR_SECURE_PASSWORD', 10).then(hash => console.log(hash));"
```

2. Insert into database via phpMyAdmin:
```sql
INSERT INTO admins (email, password_hash)
VALUES ('your-email@example.com', 'paste_the_bcrypt_hash_here');
```

### Step 4: Deploy Backend (Node.js App)

**Method 1: Using Hostinger File Manager + Setup Node.js App**

1. **Upload Backend Files:**
   - In cPanel, go to **File Manager**
   - Navigate to `public_html` or a subdirectory like `public_html/api`
   - Upload all files from `backend/` folder:
     - server.js
     - db.js
     - package.json
     - routes/
     - controllers/
     - middleware/

2. **Setup Node.js Application in cPanel:**
   - Go to **Setup Node.js App** in cPanel
   - Click **Create Application**
   - Configuration:
     - **Node.js version:** 16.x or higher
     - **Application mode:** Production
     - **Application root:** Path where you uploaded backend files (e.g., `/home/username/public_html/api`)
     - **Application URL:** Choose subdomain or path (e.g., `api.looncamp.com` or `/api`)
     - **Application startup file:** `server.js`

3. **Set Environment Variables:**
   - In the Node.js app settings, add environment variables:
   ```
   PORT=5001
   NODE_ENV=production
   DB_HOST=localhost
   DB_USER=u123456_admin
   DB_PASSWORD=your_mysql_password
   DB_NAME=u123456_looncamp
   DB_PORT=3306
   JWT_SECRET=your_super_strong_jwt_secret_minimum_32_characters
   JWT_EXPIRES_IN=24h
   FRONTEND_URL=https://yourdomain.com
   ```

4. **Install Dependencies:**
   - In the Node.js app interface, click **Run NPM Install**
   - OR via SSH:
   ```bash
   cd /home/username/public_html/api
   npm install --production
   ```

5. **Start the Application:**
   - Click **Restart** in the Node.js app interface
   - The backend should now be running!

**Method 2: Using SSH (Advanced)**

```bash
# SSH into your server
ssh username@yourdomain.com

# Navigate to your directory
cd public_html/api

# Upload files (using scp, rsync, or git)
# Example with git:
git clone your-repo-url .

# Install dependencies
npm install --production

# Create .env file
nano .env
# Paste your production environment variables

# Start with PM2 (if available)
pm2 start server.js --name looncamp-api
pm2 save
pm2 startup
```

### Step 5: Deploy Frontend

**Build the Frontend:**
```bash
# On your local machine
cd /path/to/looncamp

# Update API URL in .env
echo "VITE_API_URL=https://yourdomain.com/api" > .env

# Build
npm run build
```

**Upload to Hostinger:**
1. Go to cPanel > **File Manager**
2. Navigate to `public_html`
3. Upload all files from `dist/` folder
4. Ensure `index.html` is in the root

**Configure .htaccess for React Router:**

Create or edit `public_html/.htaccess`:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_URI} !^/api
  RewriteRule . /index.html [L]
</IfModule>

# Optional: Force HTTPS
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{HTTPS} off
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</IfModule>
```

### Step 6: Configure CORS

Ensure your backend allows requests from your frontend domain:

In `backend/server.js`, the CORS configuration uses `FRONTEND_URL` environment variable:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
```

### Step 7: Test the Deployment

1. **Backend Health Check:**
   - Visit: `https://yourdomain.com/api/health`
   - Should return JSON: `{"success": true, "message": "LoonCamp Admin API is running"}`

2. **Frontend Access:**
   - Visit: `https://yourdomain.com`
   - Should see the LoonCamp website

3. **Admin Login:**
   - Visit: `https://yourdomain.com/admin/login`
   - Login with your admin credentials
   - You should be redirected to the dashboard

---

## Security Configuration

### Critical Security Steps

1. **Change Default Admin Password:**
   ```sql
   -- Generate new hash
   -- node -e "const bcrypt = require('bcrypt'); bcrypt.hash('NewSecurePassword123!', 10).then(hash => console.log(hash));"

   UPDATE admins
   SET password_hash = 'new_bcrypt_hash_here'
   WHERE email = 'admin@looncamp.com';
   ```

2. **Secure JWT Secret:**
   - Generate a strong random string (minimum 32 characters)
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   - Use this as `JWT_SECRET` in backend `.env`

3. **Environment Variables Protection:**
   - NEVER commit `.env` files to version control
   - Add `.env` to `.gitignore`
   - Use environment variables in Hostinger Node.js app settings

4. **Database Security:**
   - Use strong MySQL passwords
   - Restrict database user privileges (no GRANT, DROP, etc.)
   - Enable MySQL SSL if available

5. **HTTPS Configuration:**
   - Enable SSL certificate in Hostinger (usually free with Let's Encrypt)
   - Force HTTPS via `.htaccess`

6. **API Rate Limiting (Optional):**
   - Consider adding `express-rate-limit` for production
   ```bash
   npm install express-rate-limit
   ```

### Password Requirements

- Minimum 8 characters
- Bcrypt with 10 rounds (default)
- Store only hashed passwords
- Never log passwords

---

## API Endpoints

### Authentication

**POST /api/auth/login**
- Login with email and password
- Returns JWT token

Request:
```json
{
  "email": "admin@looncamp.com",
  "password": "your_password"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "admin": {
      "id": 1,
      "email": "admin@looncamp.com"
    }
  }
}
```

### Properties (Admin - Requires Authentication)

**Headers:**
```
Authorization: Bearer your_jwt_token
```

**GET /api/properties/list**
- List all properties (admin view)

**GET /api/properties/:id**
- Get single property by ID

**POST /api/properties/create**
- Create new property

**PUT /api/properties/update/:id**
- Update existing property

**DELETE /api/properties/delete/:id**
- Delete property

**PATCH /api/properties/toggle-status/:id**
- Toggle is_active or is_top_selling

Request:
```json
{
  "field": "is_active",
  "value": true
}
```

### Public API

**GET /api/properties/public-list**
- List only active properties (no authentication required)
- Used by the public-facing website

---

## Admin Panel Usage

### Login
1. Navigate to `/admin/login`
2. Enter admin email and password
3. Click "Sign In"

### Dashboard
- View all properties
- See statistics (total, active, top selling)
- Toggle active/inactive status with switch
- Toggle top-selling status with switch
- Quick edit/delete buttons

### Add Property
1. Click "Add Property" button
2. Fill in basic information:
   - Title (required)
   - Category (required)
   - Description, location, address
3. Set pricing and capacity
4. Add check-in/check-out times
5. Add images (paste image URLs)
6. Add amenities, highlights, activities, policies
7. Set status (active/top-selling)
8. Click "Create Property"

### Edit Property
1. Click edit icon on property card
2. Modify any fields
3. Click "Update Property"

### Delete Property
1. Click delete icon on property card
2. Confirm deletion in dialog
3. Property and all images are deleted

### Image Management
- Paste image URLs (from Cloudinary, Imgur, or your CDN)
- Images display in the order they are added
- First image is the main property image
- Remove images by clicking the X button

---

## Troubleshooting

### Backend Issues

**Database Connection Failed**
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```
Solution:
- Check MySQL is running: `sudo service mysql status`
- Verify DB credentials in `.env`
- Check DB_HOST (use `localhost` or `127.0.0.1`)

**JWT Token Invalid**
```
Error: Invalid or expired token
```
Solution:
- Ensure JWT_SECRET matches between login and verification
- Check token expiry time
- Clear browser localStorage and login again

**CORS Error**
```
Access to fetch at 'http://api.example.com' from origin 'http://example.com' has been blocked by CORS policy
```
Solution:
- Set `FRONTEND_URL` in backend `.env`
- Check CORS configuration in `server.js`
- Ensure both frontend and backend use HTTPS

### Frontend Issues

**API URL Not Set**
```
TypeError: Failed to fetch
```
Solution:
- Check `VITE_API_URL` in `.env`
- Rebuild frontend: `npm run build`
- Clear browser cache

**Routes Not Working (404)**
Solution:
- Ensure `.htaccess` is configured for React Router
- Check file permissions (644 for files, 755 for directories)

**Admin Panel Shows White Screen**
Solution:
- Check browser console for errors
- Verify API is running: visit `/api/health`
- Check network tab for failed requests

### Hostinger Specific Issues

**Node.js App Won't Start**
Solution:
- Check Node.js version (must be 16+)
- Verify `server.js` path is correct
- Check application logs in cPanel
- Ensure all environment variables are set

**Database Connection Times Out**
Solution:
- Use `localhost` as DB_HOST
- Verify MySQL user has correct privileges
- Check database name includes prefix (e.g., `u123456_looncamp`)

**502 Bad Gateway**
Solution:
- Restart Node.js app in cPanel
- Check server logs
- Verify PORT is not already in use

---

## Maintenance

### Backup Database

**Regular Backups:**
```bash
# Export database
mysqldump -u username -p database_name > backup_$(date +%Y%m%d).sql

# Or use cPanel > Backup Wizard
```

### Update Admin Password

```bash
# Generate new hash
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('NewPassword123', 10).then(hash => console.log(hash));"

# Update in database
UPDATE admins SET password_hash = 'new_hash' WHERE email = 'admin@example.com';
```

### Monitor Application

- Check Node.js app status regularly
- Monitor database size and performance
- Review error logs in cPanel

### Update Dependencies

```bash
# Check for updates
npm outdated

# Update packages
npm update

# Test thoroughly before deploying
```

---

## Future Enhancements

Planned features for future releases:
- Booking management system
- Payment integration (Stripe/Razorpay)
- Customer management
- Email notifications
- Analytics dashboard
- Multi-admin support with roles
- Activity logs
- Image upload (vs. URL only)
- Availability calendar

---

## Support

For issues or questions:
- Check the troubleshooting section
- Review API endpoint documentation
- Verify environment variables are set correctly
- Check browser console and server logs

---

## License

Proprietary - LoonCamp Property Management System

---

**Production Checklist:**

- [ ] MySQL database created and schema imported
- [ ] Admin user created with strong password
- [ ] Backend deployed and running
- [ ] Frontend built and deployed
- [ ] Environment variables configured
- [ ] HTTPS enabled
- [ ] CORS configured correctly
- [ ] .htaccess configured for React Router
- [ ] Default admin password changed
- [ ] JWT secret is strong and unique
- [ ] Database backups scheduled
- [ ] API health check returns success
- [ ] Admin login works
- [ ] Properties can be created/edited/deleted
- [ ] Public website displays active properties

**Your admin panel is now production-ready!**
