# FlySpring Backend API

A basic web API backend built with Express.js

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

### Running the Server

**Development mode** (with auto-reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

The server will start on `http://localhost:3000` (or the port specified in `.env`)

## API Endpoints

### Health Check
- `GET /health` - Check server status

### Users API
- `GET /api/users` - Get all users
- `POST /api/users` - Create a new user
  - Required body: `{ "name": "string", "email": "string" }`

### Root
- `GET /` - Welcome message

## Project Structure

```
flyspring/
├── server.js          # Main server file
├── package.json       # Project dependencies
├── .env.example       # Environment variables template
└── README.md          # This file
```

## Features

- Express.js server
- CORS enabled
- JSON request/response handling
- Health check endpoint
- User management API
- Error handling
- Environment configuration
