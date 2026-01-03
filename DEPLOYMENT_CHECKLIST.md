# LoonCamp Admin Panel - Deployment Checklist

Complete step-by-step checklist for deploying to production.

## Pre-Deployment

### Local Testing
- [ ] Backend runs without errors (`cd backend && npm run dev`)
- [ ] Frontend runs without errors (`npm run dev`)
- [ ] Admin login works (http://localhost:5000/admin/login)
- [ ] Can create, edit, and delete properties
- [ ] Can toggle property status (active/inactive)
- [ ] Images display correctly
- [ ] Public API returns only active properties
- [ ] All API endpoints tested (see backend/API_EXAMPLES.md)

### Code Review
- [ ] No console.log statements in production code
- [ ] No hardcoded credentials
- [ ] .env files added to .gitignore
- [ ] Error handling implemented
- [ ] Input validation in place
- [ ] SQL injection prevention (prepared statements)

### Security
- [ ] Strong JWT secret generated (32+ characters)
- [ ] Default admin password changed
- [ ] CORS configured correctly
- [ ] HTTPS will be enabled
- [ ] No sensitive data in frontend code

---

## Database Setup (Hostinger cPanel)

### Create MySQL Database
- [ ] Login to Hostinger cPanel
- [ ] Navigate to MySQL Databases
- [ ] Create new database (note full name with prefix)
- [ ] Create MySQL user with strong password
- [ ] Add user to database with ALL PRIVILEGES
- [ ] Note hostname (usually `localhost`)

### Import Schema
- [ ] Open phpMyAdmin from cPanel
- [ ] Select your database
- [ ] Click Import tab
- [ ] Upload `backend/schema.sql`
- [ ] Verify tables created: admins, properties, property_images

### Create Admin User
- [ ] Generate password hash:
  ```bash
  node backend/scripts/generate-password.js YOUR_SECURE_PASSWORD
  ```
- [ ] Copy the generated hash
- [ ] Run in phpMyAdmin SQL tab:
  ```sql
  INSERT INTO admins (email, password_hash)
  VALUES ('your-email@example.com', 'paste_hash_here');
  ```
- [ ] Verify admin user exists:
  ```sql
  SELECT id, email FROM admins;
  ```

---

## Backend Deployment (Node.js API)

### Upload Backend Files
- [ ] Zip backend folder (or use Git)
- [ ] Upload to Hostinger via File Manager
- [ ] Extract to `/home/username/public_html/api` (or preferred path)
- [ ] Verify all files present:
  - server.js
  - db.js
  - package.json
  - routes/
  - controllers/
  - middleware/

### Setup Node.js Application
- [ ] Go to cPanel > Setup Node.js App
- [ ] Click Create Application
- [ ] Configure:
  - Node.js version: 16.x or higher
  - Application mode: Production
  - Application root: Path to backend files
  - Application URL: api.yourdomain.com or /api
  - Application startup file: server.js

### Set Environment Variables
In Node.js app settings, add:
- [ ] `PORT=5001`
- [ ] `NODE_ENV=production`
- [ ] `DB_HOST=localhost`
- [ ] `DB_USER=u123456_username` (your MySQL user)
- [ ] `DB_PASSWORD=your_mysql_password`
- [ ] `DB_NAME=u123456_dbname` (your database name)
- [ ] `DB_PORT=3306`
- [ ] `JWT_SECRET=your_strong_jwt_secret_32_chars_min`
- [ ] `JWT_EXPIRES_IN=24h`
- [ ] `FRONTEND_URL=https://yourdomain.com`

### Install Dependencies & Start
- [ ] Click "Run NPM Install" in Node.js app interface
- [ ] Click "Restart" to start application
- [ ] Check application is running (green status)

### Test Backend API
- [ ] Visit: `https://yourdomain.com/api/health`
- [ ] Should return JSON: `{"success": true, "message": "LoonCamp Admin API is running"}`
- [ ] Test login endpoint with cURL or Postman
- [ ] Verify database connection works

---

## Frontend Deployment (React App)

### Build Frontend
On your local machine:
- [ ] Create production `.env`:
  ```bash
  echo "VITE_API_URL=https://yourdomain.com/api" > .env
  ```
- [ ] Build the application:
  ```bash
  npm run build
  ```
- [ ] Verify `dist/` folder created
- [ ] Check `dist/index.html` exists

### Upload to Hostinger
- [ ] Go to cPanel > File Manager
- [ ] Navigate to `public_html`
- [ ] Backup existing files (if any)
- [ ] Upload all files from `dist/` folder
- [ ] Ensure `index.html` is in root

### Configure React Router (.htaccess)
- [ ] Create or edit `public_html/.htaccess`:
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
  ```
- [ ] Save and verify file uploaded

### Test Frontend
- [ ] Visit: `https://yourdomain.com`
- [ ] Should see LoonCamp homepage
- [ ] Visit: `https://yourdomain.com/admin/login`
- [ ] Should see admin login page
- [ ] Check browser console for errors
- [ ] Test navigation (should work without 404s)

---

## SSL Certificate Setup

### Enable HTTPS
- [ ] Go to cPanel > SSL/TLS Status
- [ ] Run AutoSSL for your domain
- [ ] Wait for certificate installation
- [ ] Verify SSL active (green padlock in browser)

### Force HTTPS (Optional)
Add to `.htaccess`:
- [ ] ```apache
  <IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
  </IfModule>
  ```

---

## Final Testing

### Authentication
- [ ] Visit `/admin/login`
- [ ] Login with admin credentials
- [ ] Should redirect to `/admin` dashboard
- [ ] Should see admin email in header

### Property Management
- [ ] Click "Add Property"
- [ ] Fill form and submit
- [ ] Verify property created
- [ ] Click edit icon
- [ ] Update property details
- [ ] Verify changes saved
- [ ] Toggle active/inactive switch
- [ ] Verify status changes
- [ ] Delete test property
- [ ] Confirm deletion works

### Public API
- [ ] Create a test property
- [ ] Mark it as active
- [ ] Visit `/` (homepage)
- [ ] Should see property in listings
- [ ] Mark property as inactive
- [ ] Reload homepage
- [ ] Property should be hidden

### Cross-Browser Testing
- [ ] Test in Chrome
- [ ] Test in Firefox
- [ ] Test in Safari
- [ ] Test on mobile devices

---

## Post-Deployment

### Security Hardening
- [ ] Change default admin password
- [ ] Verify JWT secret is strong and unique
- [ ] Check no .env files accessible via browser
- [ ] Verify database user has minimal privileges
- [ ] Enable 2FA for cPanel (recommended)

### Monitoring Setup
- [ ] Set up uptime monitoring (UptimeRobot, etc.)
- [ ] Configure email alerts for downtime
- [ ] Set up database backup schedule in cPanel
- [ ] Document all credentials securely (password manager)

### Documentation
- [ ] Update README with production URLs
- [ ] Document admin credentials securely
- [ ] Note any custom configurations
- [ ] Create incident response plan

### Maintenance
- [ ] Schedule regular backups (daily recommended)
- [ ] Plan for security updates
- [ ] Monitor disk space usage
- [ ] Review error logs weekly

---

## Troubleshooting Common Issues

### Backend Won't Start
- [ ] Check Node.js app logs in cPanel
- [ ] Verify all environment variables set
- [ ] Check MySQL connection (test with phpMyAdmin)
- [ ] Ensure PORT is not already in use
- [ ] Verify server.js exists and has correct path

### 502 Bad Gateway
- [ ] Restart Node.js app in cPanel
- [ ] Check application status (should be green)
- [ ] Review error logs
- [ ] Verify database is running

### CORS Errors
- [ ] Check FRONTEND_URL in backend .env
- [ ] Ensure both use HTTPS (or both HTTP)
- [ ] Verify CORS configuration in server.js
- [ ] Clear browser cache

### Database Connection Failed
- [ ] Use `localhost` for DB_HOST
- [ ] Verify username includes prefix (u123456_user)
- [ ] Check database name includes prefix (u123456_db)
- [ ] Test connection in phpMyAdmin

### Frontend Shows White Screen
- [ ] Check browser console for errors
- [ ] Verify VITE_API_URL in .env was set before build
- [ ] Rebuild frontend with correct API URL
- [ ] Check network tab for failed requests

### Admin Can't Login
- [ ] Verify admin exists in database
- [ ] Check password hash is correct (bcrypt)
- [ ] Test JWT_SECRET matches
- [ ] Review backend logs for errors
- [ ] Clear browser localStorage and try again

---

## Rollback Plan

If deployment fails:
- [ ] Keep backup of previous version
- [ ] Document rollback steps
- [ ] Test rollback procedure
- [ ] Have database backup ready

### Quick Rollback
1. [ ] Rename `public_html` to `public_html.backup`
2. [ ] Rename `public_html.old` to `public_html`
3. [ ] Stop and restart Node.js app
4. [ ] Restore database from backup (if needed)

---

## Success Criteria

Deployment is successful when:
- [ ] Website loads at https://yourdomain.com
- [ ] Admin can login at /admin/login
- [ ] Properties can be created, edited, deleted
- [ ] Images display correctly
- [ ] Toggle switches work
- [ ] Public API shows only active properties
- [ ] No console errors in browser
- [ ] Backend health check passes
- [ ] SSL certificate is valid
- [ ] All pages load without 404 errors

---

## Next Steps After Deployment

1. [ ] Add more admin users (if needed)
2. [ ] Import existing properties (if any)
3. [ ] Set up monitoring and alerts
4. [ ] Configure automated backups
5. [ ] Train admin users on the panel
6. [ ] Plan for future features (bookings, payments)
7. [ ] Set up analytics (optional)
8. [ ] Create maintenance schedule

---

## Support Contacts

- Hostinger Support: https://www.hostinger.com/support
- Documentation: See ADMIN_README.md
- API Examples: See backend/API_EXAMPLES.md

---

**Congratulations on deploying LoonCamp Admin Panel!**

Remember to:
- Keep credentials secure
- Regular backups
- Monitor performance
- Update dependencies periodically
- Review security best practices
