# LeadTools POC

A proof-of-concept application demonstrating LEADTOOLS SDK integration with a .NET backend and React frontend.

## Project Structure

```
LeadToolsPOC/
├── backend/              # ASP.NET Core Web API
│   ├── Controllers/
│   ├── Services/
│   ├── LEADTOOLSEvaluationLicense/
│   └── LeadToolsPOC.csproj
├── frontend/             # React + TypeScript + Vite
│   ├── src/
│   ├── public/
│   └── package.json
└── README.md
```

## Prerequisites

- [.NET SDK](https://dotnet.microsoft.com/download) (version 6.0 or higher)
- [Node.js](https://nodejs.org/) (version 18 or higher)
- npm or yarn

## Getting Started

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Restore dependencies:
   ```bash
   dotnet restore
   ```

3. Run the backend:
   ```bash
   dotnet run
   ```

The API will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:3000`

## Development

### Running Both Services

You'll need two terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
dotnet run
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### API Proxy

The frontend is configured to proxy API requests to the backend during development. Any request to `/api/*` from the frontend will be forwarded to `http://localhost:5000/api/*`.

This is configured in `frontend/vite.config.ts`.

## Building for Production

### Backend
```bash
cd backend
dotnet build -c Release
```

### Frontend
```bash
cd frontend
npm run build
```

The optimized frontend files will be in `frontend/dist/`.

## Technologies

### Backend
- ASP.NET Core Web API
- LEADTOOLS SDK
- C#

### Frontend
- React 18
- TypeScript
- Vite (with SWC for fast compilation)
- React Router (if needed)

## License

LEADTOOLS Evaluation License - See `backend/LEADTOOLSEvaluationLicense/` for details.