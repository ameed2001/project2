# Construction Project Management Backend

Backend API for the construction project management system using Node.js, Express, TypeScript, and Prisma with PostgreSQL.

## Features

- **Real-time Calculations**: Concrete and steel quantity calculations
- **Cost Estimation**: Automated cost reports generation
- **Project Management**: Full CRUD operations for projects
- **User Management**: Authentication and authorization
- **Database Integration**: PostgreSQL with Prisma ORM

## Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

## Installation

1. **Clone and navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the backend directory:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/construction_db?schema=public"
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   NODE_ENV="development"
   PORT=3001
   FRONTEND_URL="http://localhost:3000"
   ```

4. **Set up PostgreSQL database:**
   ```sql
   CREATE DATABASE construction_db;
   ```

5. **Generate Prisma client:**
   ```bash
   npm run db:generate
   ```

6. **Run database migrations:**
   ```bash
   npm run db:push
   ```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

## API Endpoints

### Calculations
- `POST /api/calculations/concrete` - Calculate concrete quantities
- `POST /api/calculations/steel` - Calculate steel quantities  
- `POST /api/calculations/cost-estimation` - Estimate project costs
- `POST /api/calculations/generate-cost-report` - Generate cost report

### Health Check
- `GET /api/health` - Server health status

## Database Schema

The application uses the following main models:
- **User**: User management and authentication
- **Project**: Project information and details
- **TimelineTask**: Project timeline tasks
- **CostReport**: Cost reports and estimates
- **ProjectPhoto**: Project media files
- **ProjectComment**: Project comments and communication

## Development

### Database Commands
```bash
# Generate Prisma client
npm run db:generate

# Push schema changes to database
npm run db:push

# Create and run migrations
npm run db:migrate

# Open Prisma Studio
npm run db:studio
```

### Project Structure
```
backend/
├── src/
│   ├── lib/
│   │   ├── db.ts          # Prisma client
│   │   └── calculations.ts # Calculation logic
│   ├── routes/
│   │   └── calculations.ts # API routes
│   └── server.ts          # Express server
├── prisma/
│   └── schema.prisma      # Database schema
├── package.json
└── README.md
```

## API Usage Examples

### Calculate Concrete Quantities
```javascript
const response = await fetch('/api/calculations/concrete', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    projectArea: 200,
    floors: 3,
    foundationDepth: 1.5,
    wallThickness: 0.2,
    slabThickness: 0.15
  })
});
```

### Calculate Steel Quantities
```javascript
const response = await fetch('/api/calculations/steel', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    concreteVolume: 150,
    steelRatio: 80
  })
});
```

## Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Request rate limiting
- **Input Validation**: Request validation
- **Error Handling**: Comprehensive error handling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License