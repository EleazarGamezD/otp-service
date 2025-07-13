# OTP Service API Overview

## Introduction
This OTP Service provides a multi-project architecture where clients can manage multiple independent projects, each with their own tokens, settings, and templates for sending One-Time Passwords via email or WhatsApp.

## Architecture
The service follows a hierarchical structure:
- **Clients**: User accounts with authentication
- **Projects**: Independent configurations with tokens and templates
- **OTPs**: Messages linked to specific projects

## Key Features
- ✅ Multi-project management per client
- ✅ Independent token management per project
- ✅ Customizable email and WhatsApp templates
- ✅ Production/development environment flags
- ✅ Rate limiting and security controls
- ✅ JWT authentication for admin and customer access
- ✅ API key validation with project scope
- ✅ Comprehensive analytics and reporting

## Quick Start

### 1. Customer Registration
```bash
POST /api/v1/auth/customer/register
{
  "email": "user@example.com",
  "password": "password123",
  "companyName": "My Company"
}
```

### 2. Create a Project
```bash
POST /api/v1/projects
Authorization: Bearer <jwt_token>
{
  "name": "My First Project",
  "description": "Production OTP service"
}
```

### 3. Send OTP
```bash
POST /api/v1/otp/send
x-api-key: <your_api_key>
x-project-id: <project_id>
{
  "target": "user@example.com",
  "channel": "email"
}
```

### 4. Verify OTP
```bash
POST /api/v1/otp/verify
x-api-key: <your_api_key>
x-project-id: <project_id>
{
  "target": "user@example.com",
  "code": "123456"
}
```

## Headers Required for OTP Operations
- `x-api-key`: Your client's API key
- `x-project-id`: The specific project ID

## Response Format
All responses follow a consistent format:
- Success: 200/201 with data
- Client Error: 400 with error message
- Authentication Error: 401 with error message
- Server Error: 500 with error message
