# SurplusFood Backend

A Node.js backend API for SurplusFood platform that connects food sellers with buyers to reduce food waste.

## Features

- User authentication with JWT
- Email verification system
- Role-based access (Buyer/Seller)
- Food listing management
- Order processing
- Messaging system
- Complaint handling
- File uploads with Cloudinary

## Prerequisites

Before running this project, make sure you have:

- Node.js
- Atlas MongoDB
- Gmail account (for email services)
- Cloudinary account

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Backend-Code
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in the root directory with following variables:
```env


## Usage

To start the development server:

```bash
npm run dev
```

The server will start on `http://localhost:8000`


## Error Handling

The API uses a custom error handling system with `ApiError` and `ApiResponse` classes for consistent error responses.

## Authentication

- Uses JWT for authentication
- Access tokens expire in 1 day
- Refresh tokens expire in 7 days


