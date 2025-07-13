# 🔐 OTP Service - Multi-Project Architecture

A robust, scalable OTP (One-Time Password) service built with NestJS that supports multi-project management, allowing clients to manage multiple independent projects with their own tokens, settings, and templates.

## ✨ Features

- 🏢 **Multi-Project Management**: Each client can create and manage multiple projects
- 🔑 **Dual Authentication**: JWT for dashboard access, API keys for OTP operations
- 📧 **Multi-Channel Support**: Email and WhatsApp OTP delivery
- 🎨 **Custom Templates**: Configurable email and WhatsApp message templates per project
- 🚀 **Production Ready**: Environment flags, rate limiting, and comprehensive logging
- 📊 **Analytics**: Detailed statistics and reporting for each project
- 🔒 **Security**: Token-based authentication with project-scoped access
- ⚡ **High Performance**: Redis-backed queues and MongoDB storage

## 🏗️ Architecture

The service follows a hierarchical structure:

```
Client (User Account)
├── Project 1 (Independent tokens, templates, settings)
│   ├── OTP Records
│   └── Analytics
├── Project 2
│   ├── OTP Records
│   └── Analytics
└── Project N...
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v18+)
- MongoDB
- Redis
- Email service (Resend)
- WhatsApp API credentials

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd otp-service

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Configure your environment variables
# Edit .env with your database and service credentials

# Start in development mode
npm run start:dev
```

### Environment Variables

```bash
# Database
MONGO_URI=mongodb://localhost:27017/otp-service

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# Email Service (Resend)
RESEND_API_KEY=your-resend-api-key

# WhatsApp API
WHATSAPP_API_URL=your-whatsapp-api-url
WHATSAPP_API_TOKEN=your-whatsapp-token

# OTP Configuration
OTP_EXPIRATION=300
RATE_LIMIT_WINDOW_MS=60000

# Application
PORT=3000
NODE_ENV=development
```

## 📖 Documentation

### API Documentation

- 📚 **[API Overview](src/core/docs/api-overview.md)** - Complete service overview and quick start
- 🔐 **[Authentication Guide](src/core/docs/authentication.md)** - Customer and admin authentication
- 📋 **[Project Management](src/core/docs/project-management.md)** - Creating and managing projects
- 📱 **[OTP Operations](src/core/docs/otp-operations.md)** - Sending and verifying OTPs

### Interactive Documentation

- 🌐 **Public API Docs**: `http://localhost:3000/api-docs`
- 🛠️ **Admin Panel Docs**: `http://localhost:3000/admin-docs`

## 💻 Usage Examples

### 1. Register a Customer

```bash
curl -X POST http://localhost:3000/api/v1/auth/customer/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123",
    "companyName": "My Company"
  }'
```

### 2. Create a Project

```bash
curl -X POST http://localhost:3000/api/v1/projects \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Production API",
    "description": "Main production OTP service"
  }'
```

### 3. Send OTP

```bash
curl -X POST http://localhost:3000/api/v1/otp/send \
  -H "x-api-key: <your_api_key>" \
  -H "x-project-id: <project_id>" \
  -H "Content-Type: application/json" \
  -d '{
    "target": "user@example.com",
    "channel": "email"
  }'
```

### 4. Verify OTP

```bash
curl -X POST http://localhost:3000/api/v1/otp/verify \
  -H "x-api-key: <your_api_key>" \
  -H "x-project-id: <project_id>" \
  -H "Content-Type: application/json" \
  -d '{
    "target": "user@example.com",
    "code": "123456"
  }'
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# End-to-end tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 🏭 Production Deployment

### Docker Deployment

```bash
# Build the Docker image
docker build -t otp-service .

# Run with Docker Compose
docker-compose up -d
```

### Environment Setup

Ensure all production environment variables are properly configured:

- Database connections with proper credentials
- Redis configuration for high availability
- Email service API keys
- WhatsApp API credentials
- Proper JWT secrets and expiration times

## 🔧 Development

### Project Structure

```
src/
├── core/                    # Core functionality
│   ├── docs/               # API documentation
│   ├── database/           # Database schemas and configuration
│   ├── interfaces/         # TypeScript interfaces
│   └── enums/              # Shared enumerations
├── modules/                # Feature modules
│   ├── auth/               # API key authentication
│   ├── admin-auth/         # Admin authentication
│   ├── client-auth/        # Customer authentication
│   ├── clients/            # Client management
│   ├── projects/           # Project management
│   ├── otp/                # OTP operations
│   ├── mail/               # Email service
│   └── whatsapp/           # WhatsApp service
└── main.ts                 # Application entry point
```

### Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📊 Monitoring and Analytics

The service provides comprehensive analytics including:

- Token usage tracking per project
- OTP delivery and verification rates
- Channel performance (email vs WhatsApp)
- Rate limiting metrics
- Error tracking and logging

## 🔒 Security Features

- JWT-based authentication with configurable expiration
- API key validation with project scoping
- Rate limiting per project
- Input validation and sanitization
- Secure password hashing
- Environment-based configuration

## 📞 Support

For technical support or questions:

- Create an issue in the repository
- Check the [documentation](src/core/docs/) for detailed guides
- Review the interactive API documentation at `/api-docs`

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
