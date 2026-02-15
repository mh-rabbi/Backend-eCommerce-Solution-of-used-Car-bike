# 🚗 Vehicle Marketplace Backend API

<div align="center">

![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![MySQL](https://img.shields.io/badge/mysql-%2300f.svg?style=for-the-badge&logo=mysql&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)

### 🎯 A Complete Full-Stack Vehicle Marketplace Ecosystem

**This is the Backend API of a comprehensive 3-tier system:**

📱 **Mobile App** → [View Repository](https://github.com/mh-rabbi/eCommerce-solution-for-used-car-bike)  
🖥️ **Admin Portal** → [View Repository](https://github.com/mh-rabbi/Admin-Portal-eCommerce-solution-for-used-car-bike)  
⚡ **Backend API** → *You are here!*

---

*A powerful, scalable backend system for buying and selling used cars and bikes with real-time updates, payment integration, and comprehensive admin controls.*

</div>

---

## 📋 Table of Contents

- [🌟 Features](#-features)
- [🏗️ System Architecture](#️-system-architecture)
- [🛠️ Tech Stack](#️-tech-stack)
- [📦 Installation](#-installation)
- [⚙️ Configuration](#️-configuration)
- [🚀 Running the Application](#-running-the-application)
- [📡 API Endpoints](#-api-endpoints)
- [🔌 WebSocket Events](#-websocket-events)
- [💳 Payment Integration](#-payment-integration)
- [🗄️ Database Schema](#️-database-schema)
- [🔐 Authentication & Authorization](#-authentication--authorization)
- [📊 Analytics & Reporting](#-analytics--reporting)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## 🌟 Features

### 🎯 Core Features

- ✅ **User Management**
  - Secure registration and authentication with JWT
  - Profile management with image uploads
  - Role-based access control (User/Admin)
  - Password encryption using bcrypt

- 🚗 **Vehicle Management**
  - Create, read, update vehicle listings
  - Multi-image upload support (up to 10 images)
  - Vehicle status tracking (Pending, Approved, Rejected, Sold)
  - Filter by type (Car/Bike) and status
  - Owner-only vehicle management

- ⚡ **Real-time Updates**
  - WebSocket integration for live notifications
  - Instant vehicle approval/rejection alerts
  - Real-time sold vehicle updates
  - Connection status monitoring

- 💳 **Payment System**
  - SSLCommerz payment gateway integration
  - Platform fee calculation (8% for cars, 5% for bikes)
  - Payment status tracking
  - Transaction history

- ❤️ **Favorites System**
  - Add/remove vehicles to favorites
  - Quick access to saved listings
  - Favorite status checking

- 📊 **Admin Dashboard**
  - Comprehensive analytics and insights
  - Revenue tracking and growth metrics
  - User and vehicle management
  - Payment statistics
  - Monthly/weekly revenue charts

### 🎨 Additional Features

- 📸 **Image Management**: Secure file upload with validation
- 🔍 **Advanced Filtering**: Search by status, type, and more
- 📈 **Analytics Engine**: Business intelligence and reporting
- 🔔 **Real-time Notifications**: Instant updates via WebSocket
- 🛡️ **Security**: JWT authentication, role guards, validation pipes
- 📝 **Comprehensive Logging**: Request/response logging for debugging

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Full-Stack Ecosystem                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  📱 Mobile App (Flutter)                                     │
│  └── User Interface for browsing & selling                   │
│       ├── Vehicle browsing                                   │
│       ├── Favorites management                               │
│       ├── Payment processing                                 │
│       └── Profile management                                 │
│                                                               │
│  🖥️ Admin Portal (React)                                     │
│  └── Administrative dashboard                                │
│       ├── Vehicle approval/rejection                         │
│       ├── User management                                    │
│       ├── Analytics & reports                                │
│       └── Payment monitoring                                 │
│                                                               │
│  ⚡ Backend API (NestJS) ← YOU ARE HERE                      │
│  └── Business logic & data management                        │
│       ├── RESTful API endpoints                              │
│       ├── WebSocket server                                   │
│       ├── Authentication & authorization                     │
│       ├── Payment gateway integration                        │
│       └── File upload handling                               │
│                                                               │
│  🗄️ Database (MySQL)                                         │
│  └── Data persistence layer                                  │
│       ├── Users & authentication                             │
│       ├── Vehicles & listings                                │
│       ├── Payments & transactions                            │
│       └── Favorites & relationships                          │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Core Framework
- **[NestJS](https://nestjs.com/)** - Progressive Node.js framework
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[TypeORM](https://typeorm.io/)** - ORM for database operations

### Database & Storage
- **[MySQL](https://www.mysql.com/)** - Relational database
- **[Multer](https://github.com/expressjs/multer)** - File upload middleware

### Authentication & Security
- **[Passport](http://www.passportjs.org/)** - Authentication middleware
- **[JWT](https://jwt.io/)** - JSON Web Tokens
- **[bcrypt](https://github.com/kelektiv/node.bcrypt.js)** - Password hashing

### Real-time Communication
- **[Socket.IO](https://socket.io/)** - WebSocket library

### Payment Gateway
- **[SSLCommerz](https://www.sslcommerz.com/)** - Bangladesh payment gateway

### Validation & Transformation
- **[class-validator](https://github.com/typestack/class-validator)** - Decorator-based validation
- **[class-transformer](https://github.com/typestack/class-transformer)** - Object transformation

---

## 📦 Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MySQL (v8.0 or higher)

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/vehicle-marketplace-backend.git
   cd vehicle-marketplace-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   ```sql
   CREATE DATABASE vehicle_marketplace;
   ```

4. **Configure environment variables** (see [Configuration](#️-configuration))

5. **Run database migrations** (TypeORM synchronize is enabled in development)
   ```bash
   npm run start:dev
   ```

---

## ⚙️ Configuration

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=password
DB_DATABASE=vehicle_marketplace

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# SSLCommerz Configuration (Optional)
SSLCOMMERZ_STORE_ID=your_store_id
SSLCOMMERZ_STORE_PASSWORD=your_store_password
SSLCOMMERZ_IS_LIVE=false

# File Upload Configuration
MAX_FILE_SIZE=10485760
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/gif,image/webp
```

### 🔐 Environment Variables Explained

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `DB_HOST` | MySQL host | `localhost` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_USERNAME` | Database user | `root` |
| `DB_PASSWORD` | Database password | `password` |
| `DB_DATABASE` | Database name | `vehicle_marketplace` |
| `JWT_SECRET` | Secret for JWT signing | `your-secret-key` |
| `JWT_EXPIRES_IN` | Token expiration | `7d` |

---

## 🚀 Running the Application

### Development Mode
```bash
npm run start:dev
```
Server runs on `http://localhost:3000` with hot-reload enabled.

### Production Mode
```bash
# Build the application
npm run build

# Start production server
npm run start:prod
```

### Debug Mode
```bash
npm run start:debug
```

### Running Tests
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

---

## 📡 API Endpoints

### 🔐 Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/auth/register` | Register new user | ❌ |
| `POST` | `/auth/login` | Login user | ❌ |

**Example Request (Register):**
```json
POST /auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Example Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### 👤 Users

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/users/profile` | Get current user profile | ✅ |
| `PUT` | `/users/profile` | Update profile | ✅ |
| `POST` | `/users/profile/upload-image` | Upload profile image | ✅ |

### 🚗 Vehicles

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/vehicles` | Get all approved vehicles | ❌ |
| `GET` | `/vehicles/:id` | Get vehicle by ID | ❌ |
| `GET` | `/vehicles/my-vehicles` | Get user's vehicles | ✅ |
| `POST` | `/vehicles` | Create new vehicle | ✅ |
| `POST` | `/vehicles/upload` | Upload vehicle images | ✅ |
| `PUT` | `/vehicles/:id/sold` | Mark vehicle as sold | ✅ |

**Example Request (Create Vehicle):**
```json
POST /vehicles
{
  "title": "Toyota Corolla 2020",
  "description": "Well maintained, single owner, a full detail overview of vehicle",
  "brand": "Toyota",
  "type": "car",
  "price": 2500000,
  "images": ["/uploads/vehicle-123.jpg"]
}
```

### ❤️ Favorites

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/favorites` | Get user favorites | ✅ |
| `POST` | `/favorites/:vehicleId` | Add to favorites | ✅ |
| `DELETE` | `/favorites/:vehicleId` | Remove from favorites | ✅ |
| `GET` | `/favorites/:vehicleId/check` | Check favorite status | ✅ |

### 💳 Payments

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/payments/initialize` | Initialize payment | ✅ |
| `GET` | `/payments/calculate-fee/:vehicleId` | Calculate platform fee | ✅ |
| `GET` | `/payments/vehicle/:vehicleId` | Get payment by vehicle | ✅ |
| `GET` | `/payments` | Get all payments | ✅ (Admin) |
| `GET` | `/payments/stats` | Get payment statistics | ✅ (Admin) |

### 👑 Admin

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/admin/vehicles/pending` | Get pending vehicles | ✅ (Admin) |
| `POST` | `/admin/vehicles/:id/approve` | Approve vehicle | ✅ (Admin) |
| `POST` | `/admin/vehicles/:id/reject` | Reject vehicle | ✅ (Admin) |
| `GET` | `/admin/users` | Get all users | ✅ (Admin) |
| `DELETE` | `/admin/users/:id` | Delete user | ✅ (Admin) |

### 📊 Analytics

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/analytics` | Get dashboard analytics | ✅ (Admin) |
| `GET` | `/analytics/brands` | Vehicles by brand | ✅ (Admin) |
| `GET` | `/analytics/types` | Vehicles by type | ✅ (Admin) |

---

## 🔌 WebSocket Events

Connect to WebSocket server at `ws://localhost:3000/vehicles`

### Client → Server

| Event | Description | Payload |
|-------|-------------|---------|
| `ping` | Keep connection alive | `{}` |

### Server → Client

| Event | Description | Payload |
|-------|-------------|---------|
| `connected` | Connection established | `{ message, clientId, timestamp }` |
| `pong` | Response to ping | `{ timestamp }` |
| `vehicle:approved` | Vehicle approved | `{ event, data, timestamp }` |
| `vehicle:rejected` | Vehicle rejected | `{ event, data, timestamp }` |
| `vehicle:created` | New vehicle created | `{ event, data, timestamp }` |
| `vehicle:updated` | Vehicle updated | `{ event, data, timestamp }` |
| `vehicle:sold` | Vehicle sold | `{ event, data, timestamp }` |

**Example WebSocket Client (JavaScript):**
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3000/vehicles');

socket.on('connected', (data) => {
  console.log('Connected:', data);
});

socket.on('vehicle:approved', (data) => {
  console.log('Vehicle approved:', data);
  // Update UI
});
```

---

## 💳 Payment Integration

### Platform Fee Structure

| Vehicle Type | Platform Fee |
|--------------|--------------|
| Car | 8% |
| Bike | 5% |

### Payment Flow

```
1. User creates vehicle listing
   ↓
2. System calculates platform fee
   ↓
3. Admin approves vehicle
   ↓
4. Payment initialized (status: PAID)
   ↓
5. Vehicle becomes visible to buyers
```

### SSLCommerz Integration

The system supports SSLCommerz payment gateway with the following callbacks:

- **Success**: `/payments/sslcommerz/success`
- **Failure**: `/payments/sslcommerz/fail`
- **Cancel**: `/payments/sslcommerz/cancel`
- **IPN**: `/payments/sslcommerz/ipn`

---

## 🗄️ Database Schema

### Tables Overview

- **users** - User accounts and profiles
- **vehicles** - Vehicle listings
- **favorites** - User favorite vehicles
- **payments** - Payment transactions

### Entity Relationships

```
users (1) ──────┬───── (N) vehicles
                │
                └───── (N) favorites
                
vehicles (1) ─────── (N) payments
         (1) ─────── (N) favorites
```

### Key Enums

**UserRole:**
- `USER` - Regular user
- `ADMIN` - Administrator

**VehicleStatus:**
- `PENDING` - Awaiting approval
- `APPROVED` - Approved and visible
- `REJECTED` - Rejected by admin
- `SOLD` - Marked as sold

**VehicleType:**
- `CAR` - Car listing
- `BIKE` - Bike listing

**PaymentStatus:**
- `PENDING` - Payment initiated
- `PAID` - Payment completed
- `FAILED` - Payment failed

---

## 🔐 Authentication & Authorization

### JWT Strategy

The system uses JWT (JSON Web Tokens) for authentication:

1. User registers or logs in
2. Server generates JWT token with user ID and email
3. Client stores token (typically in localStorage/SecureStorage)
4. Client sends token in `Authorization` header: `Bearer <token>`
5. Server validates token on protected routes

### Guards

- **JwtAuthGuard** - Protects routes requiring authentication
- **AdminGuard** - Protects admin-only routes

**Example Protected Route:**
```typescript
@Get('profile')
@UseGuards(JwtAuthGuard)
async getProfile(@CurrentUser() user: any) {
  return user;
}
```

**Example Admin Route:**
```typescript
@Get('users')
@UseGuards(JwtAuthGuard, AdminGuard)
async getAllUsers() {
  return this.adminService.getAllUsers();
}
```

---

## 📊 Analytics & Reporting

The analytics module provides comprehensive business insights:

### Available Metrics

- 📈 **Total Users** - Registered user count
- 🚗 **Total Vehicles** - All vehicles in system
- 💰 **Total Revenue** - Platform fees collected
- 📊 **Vehicle Status** - Breakdown by status
- 🏆 **Top Sellers** - Sellers with most sales
- 📅 **Monthly Revenue** - Revenue trends by month
- 📅 **Weekly Revenue** - Revenue trends by week
- 📈 **Growth Metrics** - MoM growth percentages

### Example Analytics Response

```json
{
  "totalUsers": 150,
  "totalVehicles": 450,
  "soldVehicles": 120,
  "totalRevenue": 25000000,
  "revenueGrowth": 15.5,
  "vehiclesSoldGrowth": 12.3,
  "activeListingsGrowth": 8.7,
  "conversionRateGrowth": 3.2,
  "topSellers": [
    {
      "name": "John Doe",
      "sales": 15,
      "revenue": 3500000
    }
  ],
  "revenueChartData": {
    "monthly": [...],
    "weekly": [...]
  }
}
```

---

## 🏗️ Project Structure

```
src/
├── common/                 # Shared utilities
│   ├── decorators/        # Custom decorators
│   ├── guards/            # Authentication guards
│   └── interceptors/      # Logging interceptors
├── database/              # Database configuration
│   └── typeorm.config.ts  # TypeORM setup
├── modules/               # Feature modules
│   ├── admin/            # Admin management
│   ├── analytics/        # Analytics & reporting
│   ├── auth/             # Authentication
│   ├── favorites/        # Favorites system
│   ├── payments/         # Payment processing
│   ├── users/            # User management
│   └── vehicles/         # Vehicle management
├── app.module.ts         # Root module
└── main.ts               # Application entry point
```

---

## 🔧 Development Tips

### Debugging

All requests are logged via the `LoggingInterceptor`:
```
=== Incoming Request ===
Method: POST
URL: /auth/login
Authorization Header: Bearer eyJhbGciOiJIUzI1...
Content-Type: application/json
✅ POST /auth/login - 200 (45ms)
```

### CORS Configuration

The API allows cross-origin requests from:
- `http://localhost:3000` (Admin Portal)
- `http://localhost:3001` (Frontend)
- `http://localhost:8080` (Flutter)
- `http://10.0.2.2:8080` (Android Emulator)
- Custom device IPs

### File Upload Limits

- **Max file size**: 10MB per file
- **Max files**: 10 images per vehicle
- **Allowed formats**: JPEG, PNG, GIF, WebP

---

## 🧪 Testing

### Test Structure

```
test/
├── unit/                 # Unit tests
│   └── *.spec.ts
└── e2e/                  # End-to-end tests
    └── *.e2e-spec.ts
```

### Running Tests

```bash
# Unit tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:cov

# E2E tests
npm run test:e2e
```

---

## 🐳 Docker Support (Optional)

Create a `Dockerfile`:

```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
```

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DB_HOST=mysql
      - DB_PORT=3306
      - DB_USERNAME=root
      - DB_PASSWORD=password
      - DB_DATABASE=vehicle_marketplace
    depends_on:
      - mysql

  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: password
      MYSQL_DATABASE: vehicle_marketplace
    ports:
      - "3306:3306"
    volumes:
      - mysql-data:/var/lib/mysql

volumes:
  mysql-data:
```

Run with Docker:
```bash
docker-compose up -d
```

---

## 📈 Performance Optimization

- ✅ Database indexing on frequently queried fields
- ✅ Eager loading of relations where needed
- ✅ Pagination for large datasets (can be added)
- ✅ Caching strategy (can be implemented with Redis)
- ✅ Image optimization (resizing can be added)

---

## 🔒 Security Best Practices

- ✅ Password hashing with bcrypt (10 rounds)
- ✅ JWT token-based authentication
- ✅ Role-based access control (RBAC)
- ✅ Input validation using class-validator
- ✅ SQL injection protection via TypeORM
- ✅ CORS configuration
- ✅ File upload validation
- ✅ Secure headers (can add Helmet.js)

---

## 🚦 API Response Formats

### Success Response
```json
{
  "id": 1,
  "title": "Toyota Corolla",
  "status": "approved",
  ...
}
```

### Error Response
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

---

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [Socket.IO Documentation](https://socket.io/docs/)
- [JWT Guide](https://jwt.io/introduction)

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards

- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Use ESLint and Prettier for code formatting

---

## 📝 Changelog

### Version 1.0.0 (Current)

- ✅ Initial release
- ✅ User authentication & authorization
- ✅ Vehicle CRUD operations
- ✅ Real-time WebSocket updates
- ✅ Payment integration
- ✅ Admin dashboard analytics
- ✅ Favorites system
- ✅ File upload handling

---

## 🐛 Known Issues

- None reported yet

If you encounter any issues, please [open an issue](https://github.com/yourusername/vehicle-marketplace-backend/issues).

---

## 🎯 Roadmap

- [ ] Add Redis caching for better performance
- [ ] Implement email notifications
- [ ] Add SMS notifications via Twilio
- [ ] Implement rate limiting
- [ ] Add API versioning
- [ ] Create Swagger/OpenAPI documentation
- [ ] Add GraphQL support
- [ ] Implement elastic search for vehicle search
- [ ] Add image compression and optimization
- [ ] Implement pagination for large datasets

---

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

---

## 👨‍💻 Author

**MH Rabbi**

- GitHub: [@mh-rabbi](https://github.com/mh-rabbi)
- LinkedIn: [Your LinkedIn Profile](https://www.linkedin.com/in/rabbi221)

---

## 🙏 Acknowledgments

- NestJS team for the amazing framework
- TypeORM contributors
- Socket.IO team
- All open-source contributors

---

## 📞 Support

For support, email support@vehiclemarketplace.com or join our Slack channel.

---

<div align="center">

### 🌟 Star this repository if you find it helpful! 🌟

**Built with ❤️ using NestJS**

[![GitHub Stars](https://img.shields.io/github/stars/yourusername/vehicle-marketplace-backend?style=social)](https://github.com/mh-rabbi/vehicle-marketplace-backend)
[![GitHub Forks](https://img.shields.io/github/forks/yourusername/vehicle-marketplace-backend?style=social)](https://github.com/mh-rabbi/vehicle-marketplace-backend)

</div>

---

## 🔗 Related Projects

📱 **Mobile App (Flutter)**: [View Repository](https://github.com/mh-rabbi/eCommerce-solution-for-used-car-bike)  
🖥️ **Admin Portal (React)**: [View Repository](https://github.com/mh-rabbi/Admin-Portal-eCommerce-solution-for-used-car-bike)

---

*Last Updated: February 2026*
