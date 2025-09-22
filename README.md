# Node.js REST API Server

A modern REST API server built with Node.js and Express, featuring JWT authentication, in-memory database, and comprehensive CRUD operations for users, products, and orders.

## 🚀 Features

- **JWT Authentication** - Secure token-based authentication
- **RESTful API** - Clean and organized API endpoints
- **In-Memory Database** - Quick setup with no external dependencies
- **CORS Enabled** - Cross-origin resource sharing for frontend integration
- **Password Hashing** - Secure password storage with bcrypt
- **Request Logging** - Detailed request/response logging for debugging
- **Environment Variables** - Configuration through .env file

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## 🛠️ Installation

1. Clone the repository:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
PORT=5000
JWT_SECRET=your-jwt-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production
```

4. Start the server:
```bash
# Development mode with nodemon
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000` (or your configured PORT)

## 🔐 Test Credentials

The server comes with pre-populated test users:

- **Email:** test@example.com
- **Password:** password123

Other test accounts:
- john@example.com / password123
- jane@example.com / password123

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/signup` | Create new account | No |
| POST | `/auth/login` | Login to account | No |
| POST | `/auth/logout` | Logout from account | Yes |
| POST | `/auth/refresh` | Refresh access token | No |

### User Profile

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/user/profile` | Get user profile | Yes |
| PUT | `/user/profile` | Update profile | Yes |
| DELETE | `/user/account` | Delete account | Yes |

### Products

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/products` | List all products | No |
| GET | `/products/:id` | Get product details | No |
| POST | `/products` | Create new product | Yes |
| PUT | `/products/:id` | Update product | Yes |
| DELETE | `/products/:id` | Delete product | Yes |

Query parameters for `/products`:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `category` - Filter by category
- `search` - Search in name and description

### Orders

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/orders` | List all orders | Yes |
| GET | `/orders/:id` | Get order details | Yes |
| POST | `/orders` | Create new order | Yes |
| PUT | `/orders/:id` | Update order status | Yes |
| DELETE | `/orders/:id` | Delete order | Yes |

## 🔄 Request & Response Examples

### Login Request
```json
POST /auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

### Login Response
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "test@example.com",
    "name": "Test User",
    "avatar": null
  }
}
```

### Create Product Request
```json
POST /products
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Product",
  "description": "Product description",
  "price": 99.99,
  "image": "https://example.com/image.jpg",
  "category": "Electronics",
  "stock": 100
}
```

### Products List Response
```json
{
  "products": [
    {
      "id": "uuid",
      "name": "Laptop",
      "description": "High-performance laptop",
      "price": 999.99,
      "image": "https://via.placeholder.com/300x200",
      "category": "Electronics",
      "stock": 10,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 5,
  "page": 1,
  "limit": 10
}
```

## 🗂️ Project Structure

```
server/
├── server.js           # Main application file
├── package.json        # Dependencies and scripts
├── .env               # Environment variables
└── README.md          # This file
```

## 🛡️ Security Features

- **Password Hashing** - All passwords are hashed using bcrypt
- **JWT Tokens** - Secure token-based authentication
- **Token Expiration** - Access tokens expire in 1 hour
- **Refresh Tokens** - Refresh tokens valid for 7 days
- **CORS Configuration** - Controlled cross-origin access
- **Environment Variables** - Sensitive data in .env file

## 🔧 Configuration

The server can be configured using environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| JWT_SECRET | Secret key for JWT tokens | (required) |
| JWT_REFRESH_SECRET | Secret key for refresh tokens | (required) |

## 📊 In-Memory Database

The server uses an in-memory database with the following models:

### User Model
```javascript
{
  id: string (UUID),
  email: string,
  password: string (hashed),
  name: string,
  avatar: string | null,
  createdAt: string (ISO),
  updatedAt: string (ISO)
}
```

### Product Model
```javascript
{
  id: string (UUID),
  name: string,
  description: string,
  price: number,
  image: string,
  category: string,
  stock: number,
  createdAt: string (ISO),
  updatedAt: string (ISO)
}
```

### Order Model
```javascript
{
  id: string (UUID),
  userId: string,
  products: array,
  totalAmount: number,
  status: string,
  createdAt: string (ISO),
  updatedAt: string (ISO)
}
```

## 🚀 Deployment

For production deployment:

1. Set secure JWT secrets in environment variables
2. Use a persistent database (MongoDB, PostgreSQL, etc.)
3. Implement rate limiting
4. Add input validation and sanitization
5. Set up HTTPS with SSL certificates
6. Configure proper CORS origins
7. Add error monitoring (Sentry, etc.)
8. Implement logging (Winston, Morgan, etc.)

## 🧪 Testing

To test the API endpoints:

1. Use the provided test credentials
2. Test with tools like:
   - Postman
   - cURL
   - Thunder Client (VS Code)
   - Your React Native app

Example cURL command:
```bash
# Login
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get products
curl http://localhost:5000/products

# Get profile (with token)
curl http://localhost:5000/user/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📝 API Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "data": {},
  "message": "Success message"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": {}
}
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support, please open an issue in the repository or contact the development team.

## 🔄 Version History

- **1.0.0** - Initial release with basic CRUD operations
  - JWT authentication
  - User management
  - Product catalog
  - Order system
  - In-memory database

---

Built with ❤️ using Node.js and Express