# OTP Operations Guide

## Overview

The OTP Service provides secure one-time password generation and verification for email and WhatsApp channels. All OTP operations require both an API key and a project ID.

## Required Headers

All OTP endpoints require these headers:

```bash
x-api-key: <your_api_key>
x-project-id: <project_id>
```

## Send OTP

Generate and send an OTP to a target recipient.

### Email OTP

```bash
POST /api/v1/otp/send
x-api-key: <your_api_key>
x-project-id: PRJ_abc123def456
Content-Type: application/json

{
  "target": "user@example.com",
  "channel": "email",
  "recordId": "order_12345"
}
```

### WhatsApp OTP

```bash
POST /api/v1/otp/send
x-api-key: <your_api_key>
x-project-id: PRJ_abc123def456
Content-Type: application/json

{
  "target": "1234567890",
  "channel": "whatsapp",
  "countryCode": "+1",
  "recordId": "user_registration_67890"
}
```

**Response:**

```json
{
  "message": "OTP generated and queued",
  "expiresIn": 300,
  "recordId": "507f1f77bcf86cd799439011"
}
```

## Verify OTP

Verify the OTP code provided by the user.

```bash
POST /api/v1/otp/verify
x-api-key: <your_api_key>
x-project-id: PRJ_abc123def456
Content-Type: application/json

{
  "target": "user@example.com",
  "code": "123456",
  "recordId": "order_12345"
}
```

**Success Response:**

```json
{
  "valid": true,
  "recordId": "507f1f77bcf86cd799439011",
  "verifiedAt": "2025-07-13T10:30:00.000Z"
}
```

**Failure Response:**

```json
{
  "valid": false,
  "reason": "Code has expired"
}
```

## Get OTP Records

Retrieve OTP history for analytics and debugging.

```bash
GET /api/v1/otp/records?page=1&limit=10&channel=email&verified=true
x-api-key: <your_api_key>
x-project-id: PRJ_abc123def456
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Records per page (default: 10)
- `channel` (optional): Filter by 'email' or 'whatsapp'
- `verified` (optional): Filter by verification status (true/false)

**Response:**

```json
{
  "records": [
    {
      "target": "user@example.com",
      "channel": "email",
      "verified": true,
      "recordId": "order_12345",
      "createdAt": "2025-07-13T10:25:00.000Z",
      "expiresAt": "2025-07-13T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

## Get OTP Statistics

Get statistical information about OTP usage.

```bash
GET /api/v1/otp/stats?dateFrom=2025-07-01&dateTo=2025-07-13
x-api-key: <your_api_key>
x-project-id: PRJ_abc123def456
```

**Query Parameters:**

- `dateFrom` (optional): Start date (ISO string)
- `dateTo` (optional): End date (ISO string)

**Response:**

```json
{
  "total": 150,
  "verified": 120,
  "unverified": 30,
  "verificationRate": "80.00",
  "byChannel": {
    "email": 100,
    "whatsapp": 50
  }
}
```

## Get Token Information

Check current token usage for your project.

```bash
GET /api/v1/otp/token-info
x-api-key: <your_api_key>
x-project-id: PRJ_abc123def456
```

**Response:**

```json
{
  "tokens": 1000,
  "tokensUsed": 250,
  "remainingTokens": 750,
  "hasUnlimitedTokens": false
}
```

## Error Handling

### Common Error Responses

**Invalid API Key:**

```json
{
  "statusCode": 401,
  "message": "Invalid API key"
}
```

**Project Not Found:**

```json
{
  "statusCode": 401,
  "message": "Invalid project ID or access denied"
}
```

**Insufficient Tokens:**

```json
{
  "statusCode": 400,
  "message": "Insufficient tokens"
}
```

**Invalid Input:**

```json
{
  "statusCode": 400,
  "message": "Country code is required for WhatsApp channel"
}
```

## Rate Limiting

Each project has its own rate limiting configuration. When the limit is exceeded:

```json
{
  "statusCode": 429,
  "message": "Too many requests - Rate limit exceeded"
}
```

## Best Practices

- Always include meaningful `recordId` values for tracking
- Verify OTPs immediately after user input
- Monitor token usage to avoid service interruption
- Use appropriate expiration times for your use case
- Implement proper error handling in your application
- Store only necessary OTP metadata, never the actual codes
