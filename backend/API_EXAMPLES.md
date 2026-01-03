# LoonCamp API Examples

Complete API testing guide with cURL examples.

## Base URL
- Local: `http://localhost:5001/api`
- Production: `https://yourdomain.com/api`

---

## 1. Health Check

Test if the API is running.

```bash
curl -X GET http://localhost:5001/api/health
```

Response:
```json
{
  "success": true,
  "message": "LoonCamp Admin API is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## 2. Authentication

### Login

```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@looncamp.com",
    "password": "admin123"
  }'
```

Success Response:
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

Error Response (Invalid credentials):
```json
{
  "success": false,
  "message": "Invalid credentials."
}
```

**Save the token for subsequent requests!**

---

## 3. Properties Management (Protected Routes)

### Set Authorization Header
```bash
# Replace YOUR_JWT_TOKEN with the token from login
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 3.1 List All Properties (Admin)

```bash
curl -X GET http://localhost:5001/api/properties/list \
  -H "Authorization: Bearer $TOKEN"
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Luxury Lakeside Cottage",
      "slug": "luxury-lakeside-cottage",
      "category": "cottage",
      "location": "Pawna Lake",
      "price": "₹7,499",
      "is_active": true,
      "is_top_selling": true,
      "images": [
        {
          "id": 1,
          "image_url": "https://example.com/image1.jpg",
          "display_order": 0
        }
      ]
    }
  ]
}
```

### 3.2 Get Single Property

```bash
curl -X GET http://localhost:5001/api/properties/1 \
  -H "Authorization: Bearer $TOKEN"
```

### 3.3 Create Property

```bash
curl -X POST http://localhost:5001/api/properties/create \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Sunset Villa Retreat",
    "description": "Beautiful villa with sunset views",
    "category": "villa",
    "location": "Lonavala",
    "price": "₹12,999",
    "price_note": "per person with meal",
    "capacity": 4,
    "max_capacity": 6,
    "rating": 4.8,
    "is_top_selling": true,
    "is_active": true,
    "check_in_time": "3:00 PM",
    "check_out_time": "11:00 AM",
    "contact": "+91 8669505727",
    "address": "Lonavala Hills, Maharashtra",
    "amenities": [
      "Private Pool",
      "AC",
      "WiFi",
      "Kitchen"
    ],
    "highlights": [
      "Sunset views",
      "Mountain backdrop",
      "Private garden"
    ],
    "activities": [
      "Hiking",
      "Swimming",
      "Barbecue"
    ],
    "policies": [
      "No smoking",
      "Pet friendly"
    ],
    "images": [
      "https://example.com/villa1.jpg",
      "https://example.com/villa2.jpg",
      "https://example.com/villa3.jpg"
    ]
  }'
```

Success Response:
```json
{
  "success": true,
  "message": "Property created successfully.",
  "data": {
    "id": 5,
    "slug": "sunset-villa-retreat"
  }
}
```

### 3.4 Update Property

```bash
curl -X PUT http://localhost:5001/api/properties/update/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Villa Name",
    "price": "₹15,999",
    "is_top_selling": false
  }'
```

Response:
```json
{
  "success": true,
  "message": "Property updated successfully."
}
```

### 3.5 Toggle Property Status

**Toggle Active Status:**
```bash
curl -X PATCH http://localhost:5001/api/properties/toggle-status/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "field": "is_active",
    "value": false
  }'
```

**Toggle Top Selling:**
```bash
curl -X PATCH http://localhost:5001/api/properties/toggle-status/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "field": "is_top_selling",
    "value": true
  }'
```

Response:
```json
{
  "success": true,
  "message": "Property status updated successfully."
}
```

### 3.6 Delete Property

```bash
curl -X DELETE http://localhost:5001/api/properties/delete/1 \
  -H "Authorization: Bearer $TOKEN"
```

Response:
```json
{
  "success": true,
  "message": "Property deleted successfully."
}
```

---

## 4. Public API (No Authentication)

### 4.1 List Active Properties

```bash
curl -X GET http://localhost:5001/api/properties/public-list
```

Response: (Only returns properties where `is_active = true`)
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Luxury Lakeside Cottage",
      "category": "cottage",
      "is_active": true,
      "images": [...]
    }
  ]
}
```

---

## Error Responses

### 401 Unauthorized (No token)
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

### 403 Forbidden (Invalid token)
```json
{
  "success": false,
  "message": "Invalid or expired token."
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Property not found."
}
```

### 400 Bad Request
```json
{
  "success": false,
  "message": "Title and category are required."
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Server error. Please try again."
}
```

---

## Testing Workflow

### Complete Test Sequence

```bash
#!/bin/bash

# 1. Health check
echo "Testing health endpoint..."
curl -X GET http://localhost:5001/api/health
echo -e "\n"

# 2. Login
echo "Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@looncamp.com","password":"admin123"}')

echo $LOGIN_RESPONSE
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "Token: $TOKEN"
echo -e "\n"

# 3. List properties
echo "Listing properties..."
curl -X GET http://localhost:5001/api/properties/list \
  -H "Authorization: Bearer $TOKEN"
echo -e "\n"

# 4. Create property
echo "Creating property..."
curl -X POST http://localhost:5001/api/properties/create \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Property",
    "category": "camping",
    "location": "Test Location",
    "price": "₹5,000",
    "is_active": true
  }'
echo -e "\n"

# 5. Public list
echo "Getting public properties..."
curl -X GET http://localhost:5001/api/properties/public-list
echo -e "\n"
```

---

## Postman Collection

Import this JSON into Postman:

```json
{
  "info": {
    "name": "LoonCamp Admin API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:5001/api"
    },
    {
      "key": "token",
      "value": ""
    }
  ],
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Login",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "if (pm.response.code === 200) {",
                  "    const response = pm.response.json();",
                  "    pm.collectionVariables.set('token', response.data.token);",
                  "}"
                ]
              }
            }
          ],
          "request": {
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"admin@looncamp.com\",\n  \"password\": \"admin123\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "{{baseUrl}}/auth/login",
              "host": ["{{baseUrl}}"],
              "path": ["auth", "login"]
            }
          }
        }
      ]
    },
    {
      "name": "Properties",
      "item": [
        {
          "name": "List All",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/properties/list",
              "host": ["{{baseUrl}}"],
              "path": ["properties", "list"]
            }
          }
        },
        {
          "name": "Create Property",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"title\": \"New Property\",\n  \"category\": \"cottage\",\n  \"location\": \"Pawna Lake\",\n  \"price\": \"₹5,999\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "{{baseUrl}}/properties/create",
              "host": ["{{baseUrl}}"],
              "path": ["properties", "create"]
            }
          }
        }
      ]
    }
  ]
}
```

---

## JavaScript/Fetch Examples

### Login
```javascript
const login = async () => {
  const response = await fetch('http://localhost:5001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@looncamp.com',
      password: 'admin123'
    })
  });

  const data = await response.json();
  if (data.success) {
    localStorage.setItem('token', data.data.token);
  }
};
```

### Create Property
```javascript
const createProperty = async (propertyData) => {
  const token = localStorage.getItem('token');

  const response = await fetch('http://localhost:5001/api/properties/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(propertyData)
  });

  return await response.json();
};
```

---

## Testing Tips

1. **Save token after login** - Store it in environment variable or Postman collection
2. **Check HTTP status codes** - 200 (success), 401 (unauthorized), 404 (not found)
3. **Validate JSON** - Ensure request body is valid JSON
4. **Test authentication** - Try requests without token (should fail with 401)
5. **Test validation** - Send incomplete data (should fail with 400)

---

## Production Testing

When testing on production:

```bash
# Replace localhost with your domain
API_URL="https://yourdomain.com/api"

# Test health
curl -X GET $API_URL/health

# Test login
curl -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email","password":"your-password"}'
```

---

**Happy Testing!**
