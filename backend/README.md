# Backend Server Setup

## Quick Start

1. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

2. **Create `.env` file** in the `backend` directory with:
   ```
   MONGO_URI=your_mongodb_connection_string
   PORT=3001
   ```

3. **Start the server**:
   ```bash
   npm start
   ```
   
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

## Server Information

- **Default Port**: 3001
- **API Base URL**: `http://localhost:3001/api`
- **Health Check**: `http://localhost:3001/api/health`

## Available Endpoints

### Calculations
- `POST /api/calculations/concrete` - Calculate concrete quantities
- `POST /api/calculations/steel` - Calculate steel quantities
- `POST /api/calculations/cost-estimation` - Estimate costs
- `POST /api/calculations/generate-cost-report` - Generate cost report

### Health Check
- `GET /api/health` - Check if server is running

## Troubleshooting

### Port Already in Use

If you see "Port 3001 is already in use":

**Windows:**
```bash
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

**Mac/Linux:**
```bash
lsof -ti:3001 | xargs kill -9
```

Or use a different port:
```bash
PORT=3002 npm start
```

### MongoDB Connection Error

Make sure:
1. MongoDB is running
2. `.env` file has correct `MONGO_URI`
3. MongoDB connection string is valid

### CORS Issues

CORS is already enabled in the server. If you still have issues, check:
- Frontend is calling the correct URL (`http://localhost:3001/api`)
- No firewall blocking the connection

## Testing the Server

After starting the server, you can test it:

1. **Health Check**:
   ```bash
   curl http://localhost:3001/api/health
   ```

2. **Test Concrete Calculation**:
   ```bash
   curl -X POST http://localhost:3001/api/calculations/concrete \
     -H "Content-Type: application/json" \
     -d '{"projectArea":200,"floors":3,"foundationDepth":1.5,"wallThickness":0.2,"slabThickness":0.15}'
   ```

