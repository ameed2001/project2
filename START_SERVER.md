# How to Start the Backend Server

## Problem
When clicking "حساب كميات الباطون" or "حساب كميات الحديد", you get: "Failed to connect to server. Please make sure it runs on port 3001"

## Solution: Start the Backend Server

### Step 1: Open Terminal in the Backend Folder

Navigate to the `backend` directory:
```bash
cd backend
```

### Step 2: Check if .env File Exists

Make sure you have a `.env` file in the `backend` folder with:
```
MONGO_URI=your_mongodb_connection_string
PORT=3001
```

### Step 3: Start the Server

**Option A: Using npm**
```bash
npm start
```

**Option B: Using node directly**
```bash
node server.js
```

**Option C: Development mode (auto-reload on changes)**
```bash
npm run dev
```

### Step 4: Verify Server is Running

You should see output like:
```
✅ MongoDB connected
✅ Server running on port 3001
✅ API Base URL: http://localhost:3001/api
✅ Health check: http://localhost:3001/api/health
✅ Calculations endpoint: http://localhost:3001/api/calculations/concrete
```

### Step 5: Test the Connection

Open your browser and go to:
```
http://localhost:3001/api/health
```

You should see a JSON response with `"success": true`

## Troubleshooting

### Port 3001 Already in Use

**Windows:**
```bash
# Find the process using port 3001
netstat -ano | findstr :3001

# Kill the process (replace <PID> with the actual process ID)
taskkill /PID <PID> /F
```

**Mac/Linux:**
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

**Or use a different port:**
```bash
PORT=3002 npm start
```
Then update `frontend/src/lib/api.ts` to use port 3002.

### MongoDB Connection Error

Make sure:
1. MongoDB is installed and running
2. Your `.env` file has the correct `MONGO_URI`
3. The MongoDB connection string is valid

### Server Starts But Still Can't Connect

1. Check the browser console (F12) for the exact error
2. Verify the server is actually running on port 3001
3. Check if firewall is blocking the connection
4. Make sure you're using `http://localhost:3001` (not `https://`)

## Quick Test

After starting the server, test the concrete calculation endpoint:

**Using curl (if available):**
```bash
curl -X POST http://localhost:3001/api/calculations/concrete \
  -H "Content-Type: application/json" \
  -d "{\"projectArea\":200,\"floors\":3,\"foundationDepth\":1.5,\"wallThickness\":0.2,\"slabThickness\":0.15}"
```

**Or use Postman/Thunder Client:**
- Method: POST
- URL: `http://localhost:3001/api/calculations/concrete`
- Headers: `Content-Type: application/json`
- Body:
```json
{
  "projectArea": 200,
  "floors": 3,
  "foundationDepth": 1.5,
  "wallThickness": 0.2,
  "slabThickness": 0.15
}
```

## What Changed

The following improvements were made:

1. ✅ Added `createdByUserId` field to projects (projects now only visible to creator)
2. ✅ Created calculations API endpoints (`/api/calculations/concrete` and `/api/calculations/steel`)
3. ✅ Added better error handling and logging
4. ✅ Added server connection testing before making requests
5. ✅ Improved error messages in Arabic

## Next Steps

1. **Start the backend server** (see steps above)
2. **Refresh your frontend** application
3. **Try the calculations again** - they should work now!

If you still have issues, check:
- Browser console (F12) for detailed error messages
- Backend server console for any errors
- Network tab in browser DevTools to see the actual request/response

