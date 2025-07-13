# Authentication Guide

## Overview

The OTP Service provides dual authentication mechanisms for different user types:

- **Admin Authentication**: For service administrators
- **Customer Authentication**: For client users managing their projects

## Customer Authentication

### Registration

Register a new customer account:

```bash
POST /api/v1/auth/customer/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "companyName": "My Company Ltd"
}
```

**Response:**

```json
{
  "message": "Customer registered successfully",
  "customer": {
    "id": "customer_id",
    "email": "user@example.com",
    "companyName": "My Company Ltd",
    "apiKey": "api_key_here",
    "role": "customer"
  }
}
```

### Login

Authenticate and receive JWT token:

```bash
POST /api/v1/auth/customer/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**

```json
{
  "access_token": "jwt_token_here",
  "customer": {
    "id": "customer_id",
    "email": "user@example.com",
    "companyName": "My Company Ltd"
  }
}
```

### Profile Access

Get current customer profile:

```bash
GET /api/v1/auth/customer/profile
Authorization: Bearer <jwt_token>
```

### Change Password

Update customer password:

```bash
PUT /api/v1/auth/customer/change-password
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "currentPassword": "oldPassword",
  "newPassword": "newSecurePassword123"
}
```

## Admin Authentication

### Login

Admin login for administrative access:

```bash
POST /api/v1/admin/auth/login
Content-Type: application/json

{
  "email": "admin@company.com",
  "password": "adminPassword"
}
```

## API Key Authentication

For OTP operations, use the API key provided during customer registration:

### Headers Required

```bash
x-api-key: <your_api_key>
x-project-id: <project_id>
```

### Example OTP Request

```bash
POST /api/v1/otp/send
x-api-key: customer_api_key_here
x-project-id: PRJ_abc123def456
Content-Type: application/json

{
  "target": "recipient@example.com",
  "channel": "email"
}
```

## Security Notes

- JWT tokens expire and should be refreshed as needed
- API keys are unique per customer and should be kept secure
- Project IDs are required for all OTP operations to ensure proper scope
- All authentication endpoints use HTTPS in production
