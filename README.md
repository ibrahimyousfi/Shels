# Code Testing Agent - Gemini 3 Hackathon

Autonomous code testing and improvement system using Google Gemini 3 API with Marathon Agent capabilities.

## Technologies Used

- **Next.js 16** - Full-stack framework
- **React 19** - Frontend library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Gemini 3 API** - AI integration (Extended Context, Advanced Reasoning, Marathon Agent)

## Features

- ✅ **Code Analysis** - Comprehensive codebase analysis using Extended Context (1M tokens)
- ✅ **Test Generation** - Automatic generation of unit, integration, security, and performance tests
- ✅ **Issue Detection** - Find bugs, security vulnerabilities, performance issues, and code quality problems
- ✅ **Auto-Fix** - Automatic code fixes with AI-powered suggestions
- ✅ **Marathon Agent** - Long-running tasks with continuous monitoring (24/7)
- ✅ **GitHub Integration** - Connect directly to GitHub repositories

## Local Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Run production
npm start
```

## Deploy on Vercel

### Steps:

1. **Create Vercel Account** (free)
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub

2. **Connect Project**
   - Click "New Project"
   - Select GitHub repository
   - Vercel will auto-detect Next.js

3. **Add Environment Variables**
   - `GEMINI_API_KEY` - Gemini API key
   - `DATABASE_URL` - Database URL (if needed)

4. **Deploy**
   - Click "Deploy"
   - Vercel will deploy automatically

### Deployment URL:
After deployment, you'll get a URL like:
`https://p.vercel.app`

## Project Structure

```
code-testing-agent/
├── app/
│   ├── api/              # API Routes (Backend)
│   │   ├── analyze/      # Code analysis endpoint
│   │   ├── generate-tests/ # Test generation endpoint
│   │   └── fix/          # Auto-fix endpoint
│   ├── page.tsx          # Home page (UI)
│   └── layout.tsx        # Root layout
├── lib/
│   ├── services/         # Core services
│   │   ├── codeAnalyzer.ts    # Code analysis service
│   │   ├── testGenerator.ts   # Test generation service
│   │   ├── autoFix.ts         # Auto-fix service
│   │   └── repoReader.ts      # Repository reader service
│   └── gemini.ts         # Gemini API Service
└── package.json
```

## Gemini 3 Features Used

- **Extended Context (1M tokens)** - Read entire codebases at once for comprehensive analysis
- **Advanced Reasoning** - Complex code analysis, problem detection, and intelligent test generation
- **Marathon Agent** - Long-running autonomous testing tasks with Thought Signatures for continuity
- **Self-Correction** - Autonomous system that learns and improves from previous test cycles
- **Real-time API Integration** - Efficient streaming and response handling

## Strategic Track: Marathon Agent

This project implements the **Marathon Agent** strategic track, featuring:
- **Long-running tasks** - Continuous monitoring spanning hours or days
- **Thought Signatures** - Maintains continuity across multi-step tool calls
- **Self-correction** - Automatically improves testing strategy based on results
- **Autonomous operation** - Runs without human supervision

## Environment Variables

Create `.env.local` file:

```env
GEMINI_API_KEY=your_gemini_api_key_here
DATABASE_URL=your_database_url_here
```

## Contributing

This project is for Gemini 3 Hackathon participation.

## License

ISC
