# Project Management Guide

## Overview

Projects are independent configurations that contain tokens, templates, and settings for OTP operations. Each customer can create and manage multiple projects.

## Project Structure

Each project contains:

- **Basic Information**: Name, description, status
- **Token Management**: Token allocation and consumption tracking
- **Templates**: Custom email and WhatsApp message templates
- **Environment Settings**: Production/development mode
- **Rate Limiting**: Requests per minute limits

## Customer Project Management

### Create Project

Create a new project under your account:

```bash
POST /api/v1/projects
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Production API",
  "description": "Main production OTP service",
  "tokens": 1000,
  "rateLimitPerMinute": 60,
  "emailTemplate": {
    "subject": "Your Verification Code",
    "body": "<h1>Your code is: {{code}}</h1>"
  },
  "whatsappTemplate": {
    "message": "Your verification code is: {{code}}"
  }
}
```

**Response:**

```json
{
  "id": "project_object_id",
  "projectId": "PRJ_abc123def456",
  "name": "Production API",
  "description": "Main production OTP service",
  "isActive": true,
  "tokens": 1000,
  "tokensUsed": 0,
  "remainingTokens": 1000,
  "hasUnlimitedTokens": false,
  "isProduction": false,
  "rateLimitPerMinute": 60,
  "emailTemplate": {
    "subject": "Your Verification Code",
    "body": "<h1>Your code is: {{code}}</h1>"
  },
  "whatsappTemplate": {
    "message": "Your verification code is: {{code}}"
  }
}
```

### List Projects

Get all your projects:

```bash
GET /api/v1/projects
Authorization: Bearer <jwt_token>
```

### Get Project Details

Get specific project information:

```bash
GET /api/v1/projects/PRJ_abc123def456
Authorization: Bearer <jwt_token>
```

### Update Project

Update project configuration:

```bash
PUT /api/v1/projects/PRJ_abc123def456
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Updated Project Name",
  "description": "Updated description",
  "rateLimitPerMinute": 120,
  "emailTemplate": {
    "subject": "New Subject",
    "body": "<p>Your verification code: <strong>{{code}}</strong></p>"
  }
}
```

### Activate/Deactivate Project

Activate a project:

```bash
PATCH /api/v1/projects/PRJ_abc123def456/activate
Authorization: Bearer <jwt_token>
```

Deactivate a project:

```bash
PATCH /api/v1/projects/PRJ_abc123def456/deactivate
Authorization: Bearer <jwt_token>
```

## Admin Project Management

Administrators have additional capabilities for managing all projects across the system.

### List All Projects

Get all projects in the system:

```bash
GET /api/v1/admin/projects
Authorization: Bearer <admin_jwt_token>
```

### Get Any Project

View any project details:

```bash
GET /api/v1/admin/projects/{project_id}
Authorization: Bearer <admin_jwt_token>
```

### Update Any Project

Modify any project (admin only):

```bash
PUT /api/v1/admin/projects/{project_id}
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "tokens": 5000,
  "hasUnlimitedTokens": true,
  "isProduction": true
}
```

### Add Tokens

Add tokens to a project:

```bash
PATCH /api/v1/admin/projects/{project_id}/add-tokens
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "amount": 1000
}
```

### Set Unlimited Tokens

Enable/disable unlimited tokens:

```bash
PATCH /api/v1/admin/projects/{project_id}/unlimited-tokens
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "unlimited": true
}
```

### Set Production Mode

Enable/disable production mode:

```bash
PATCH /api/v1/admin/projects/{project_id}/production
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "production": true
}
```

## Template Variables

Both email and WhatsApp templates support the following variables:

- `{{code}}`: The 6-digit OTP code
- Custom variables can be added as needed

## Best Practices

- Use descriptive project names and descriptions
- Set appropriate rate limits based on your use case
- Test templates in development mode before enabling production
- Monitor token usage regularly
- Keep project credentials secure
