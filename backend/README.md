# LoonCamp Backend API

Node.js + Express REST API for LoonCamp admin panel.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your MySQL credentials
```

### 3. Setup Database
```bash
# Create database in MySQL
mysql -u root -p -e "CREATE DATABASE looncamp_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Import schema
mysql -u root -p looncamp_db < schema.sql

# Generate admin password hash
node scripts/generate-password.js your_secure_password

# Insert admin user (use hash from previous step)
mysql -u root -p looncamp_db -e "INSERT INTO admins (email, password_hash) VALUES ('admin@looncamp.com', 'your_generated_hash');"
```

### 4. Start Server
```bash
# Development
npm run dev

# Production
npm start
```

### 5. Test API
```bash
# Health check
curl http://localhost:5001/api/health

# Should return:
# {"success":true,"message":"LoonCamp Admin API is running","timestamp":"..."}
```

## Environment Variables

Required variables in `.env`:

```env
PORT=5001
NODE_ENV=production

DB_HOST=localhost
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=looncamp_db
DB_PORT=3306

JWT_SECRET=your_strong_secret_key_min_32_chars
JWT_EXPIRES_IN=24h

FRONTEND_URL=http://localhost:5000
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login

### Properties (Protected)
- `GET /api/properties/list` - List all properties (admin)
- `GET /api/properties/:id` - Get property by ID
- `POST /api/properties/create` - Create property
- `PUT /api/properties/update/:id` - Update property
- `DELETE /api/properties/delete/:id` - Delete property
- `PATCH /api/properties/toggle-status/:id` - Toggle status

### Public
- `GET /api/properties/public-list` - List active properties (no auth)

## Project Structure

```
backend/
├── server.js              # Entry point
├── db.js                  # MySQL connection
├── package.json           # Dependencies
├── .env.example           # Environment template
├── schema.sql             # Database schema
│
├── middleware/
│   └── auth.js           # JWT authentication
│
├── routes/
│   ├── auth.routes.js    # Auth endpoints
│   └── properties.routes.js # Property endpoints
│
├── controllers/
│   ├── auth.controller.js
│   └── properties.controller.js
│
└── scripts/
    └── generate-password.js  # Password hash generator
```

## Security Features

- Bcrypt password hashing (10 rounds)
- JWT token-based authentication
- SQL injection prevention (prepared statements)
- CORS protection
- Input validation
- Secure headers

## Database Schema

### admins
- `id` (INT, PK, AUTO_INCREMENT)
- `email` (VARCHAR, UNIQUE)
- `password_hash` (VARCHAR)
- `created_at` (TIMESTAMP)

### properties
- `id` (INT, PK, AUTO_INCREMENT)
- `title`, `slug` (VARCHAR, UNIQUE)
- `description` (TEXT)
- `category` (ENUM: camping, cottage, villa)
- `location`, `address` (VARCHAR/TEXT)
- `price`, `price_note` (VARCHAR)
- `capacity`, `max_capacity` (INT)
- `rating` (DECIMAL)
- `is_active`, `is_top_selling` (BOOLEAN)
- `check_in_time`, `check_out_time` (VARCHAR)
- `contact` (VARCHAR)
- `amenities`, `highlights`, `activities`, `policies` (JSON)
- `created_at`, `updated_at` (TIMESTAMP)

### property_images
- `id` (INT, PK, AUTO_INCREMENT)
- `property_id` (INT, FK)
- `image_url` (VARCHAR)
- `display_order` (INT)
- `created_at` (TIMESTAMP)

## Production Deployment

See [ADMIN_README.md](../ADMIN_README.md) for complete deployment guide.

### Hostinger Deployment Checklist
- [ ] MySQL database created
- [ ] Schema imported
- [ ] Admin user created
- [ ] Environment variables configured
- [ ] Node.js app created in cPanel
- [ ] Dependencies installed
- [ ] Application started
- [ ] Health check passing

## Troubleshooting

**Database connection failed**
- Verify MySQL credentials in .env
- Check MySQL is running
- Use `localhost` or `127.0.0.1` for DB_HOST

**JWT token invalid**
- Check JWT_SECRET matches
- Verify token hasn't expired
- Clear localStorage and login again

**CORS errors**
- Set FRONTEND_URL in .env
- Check CORS config in server.js

## Support

For issues, check:
1. Server logs (console output)
2. MySQL connection
3. Environment variables
4. API health endpoint

## License

Proprietary - LoonCamp
