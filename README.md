# LeadTools POC

A proof-of-concept application demonstrating LEADTOOLS SDK integration with a .NET backend and React frontend.

## 🔄 Resuming Development on Another PC

If you're cloning this project on a different PC and want to continue the Claude Code conversation:

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd LeadToolsPOC
   ```

2. **Open Claude Code** in the project directory:
   ```bash
   claude-code
   ```

3. **Resume the conversation** by copying and pasting this to Claude:
   ```
   I'm continuing development of the LEADTOOLS POC project. The project has a .NET backend (port 5153) and React frontend (PrimeReact UI). Please help me continue from where we left off.
   ```

4. **Context for Claude:**
   - Backend API is at `http://localhost:5153/api/`
   - Frontend uses PrimeReact components (not Tailwind)
   - Two main endpoints: `/api/ImageCompression/compress` and `/api/ImageCompression/analyze`
   - Project structure: separate `backend/` and `frontend/` folders

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

The API will be available at `http://localhost:5153` (or the port shown in the console)

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

The frontend will be available at `http://localhost:3000` (Vite typically uses port 5173)

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

The frontend is configured to proxy API requests to the backend during development. Any request to `/api/*` from the frontend will be forwarded to `http://localhost:5153/api/*`.

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
- PrimeReact (professional UI component library)
- PrimeIcons (icon library)

## 📋 Future Enhancements (TODO)

### High Priority
1. **Add Compression Ratio to API Response**
   - Backend: Return compression percentage/ratio in the compress endpoint response
   - Frontend: Display the compression ratio in the UI (e.g., "Reduced by 65%")

2. **Improve Compression Flow (No Auto-Download)**
   - Backend: Return compressed image data instead of forcing download
   - Frontend: Show preview of compressed image first
   - Run analytics on BOTH original and compressed images
   - Show side-by-side comparison of analytics (before vs after)
   - Add manual "Download" button only after user reviews the comparison
   - Let user decide if they want to download based on the results

### Implementation Notes
- Current behavior: API forces direct download via `Content-Disposition` header
- Desired behavior: API returns image blob, frontend handles preview and optional download
- Analytics comparison should show: file size reduction, quality metrics, dimensions, etc.

## License

LEADTOOLS Evaluation License - See `backend/LEADTOOLSEvaluationLicense/` for details.

## 💡 Important Notes

- **Backend Port:** The .NET API runs on `http://localhost:5153` (may vary, check console output)
- **Frontend Port:** Vite dev server runs on `http://localhost:3000` or `5173`
- **UI Library:** Using PrimeReact (NOT Tailwind CSS)
- **API Proxy:** Frontend proxies `/api/*` requests to backend automatically
- **LEADTOOLS License:** Evaluation license located in `backend/LEADTOOLSEvaluationLicense/`