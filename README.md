# 🐚 Shels - Autonomous Code Testing Agent

> **Autonomous code testing and analysis agent powered by Google Gemini 3 AI. Automate testing, find bugs, and fix code automatically.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)

Shels is an intelligent autonomous testing agent that leverages Google Gemini 3's advanced AI capabilities to analyze codebases, generate comprehensive tests, detect issues, and automatically fix problems. Built for the **Gemini 3 Hackathon** with a focus on the **Marathon Agent** strategic track.

## ✨ Features

- 🔍 **Comprehensive Code Analysis** - Analyze entire codebases using Extended Context (1M tokens)
- 🧪 **Intelligent Test Generation** - Automatically generate unit, integration, security, and performance tests
- 🐛 **Advanced Issue Detection** - Find bugs, security vulnerabilities, performance issues, and code quality problems
- 🔧 **AI-Powered Auto-Fix** - Automatic code fixes with context-aware suggestions
- ⚡ **Marathon Agent** - Long-running autonomous tasks with continuous monitoring (24/7)
- 🔗 **GitHub Integration** - Connect directly to GitHub repositories for seamless workflow
- 📊 **Risk Timeline** - Visualize potential risks and their evolution over time
- 📈 **Code Metrics** - Track code quality, complexity, and maintainability metrics
- 🧠 **Reasoning Chains** - Understand AI decision-making process with detailed reasoning
- 💾 **Session Management** - Save and restore analysis sessions

## 🚀 Technologies

- **Next.js 16** - Full-stack React framework
- **React 19** - Modern UI library
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Google Gemini 3 API** - Advanced AI capabilities:
  - Extended Context (1M tokens)
  - Advanced Reasoning
  - Marathon Agent (Strategic Track)
  - Thought Signatures
  - Self-correction

## 🎯 Gemini 3 Features Used

### Extended Context (1M tokens)
Read and analyze entire codebases at once for comprehensive understanding and context-aware analysis.

### Advanced Reasoning
Complex code analysis, intelligent problem detection, and sophisticated test generation using multi-step reasoning.

### Marathon Agent (Strategic Track)
Long-running autonomous testing tasks that:
- Maintain continuity across multi-step tool calls using Thought Signatures
- Self-correct and improve testing strategy based on results
- Run autonomously without human supervision
- Monitor code continuously (24/7)

### Self-Correction
Autonomous system that learns from previous test cycles and improves its approach over time.

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/ibrahimyousfi/Shels.git
cd Shels

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your GEMINI_API_KEY to .env.local
```

## 🛠️ Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

The application will be available at `http://localhost:3000`

## 🌐 Deployment

### Deploy on Vercel (Recommended)

1. **Create Vercel Account**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub

2. **Connect Project**
   - Click "New Project"
   - Select your GitHub repository
   - Vercel will auto-detect Next.js

3. **Add Environment Variables**
   - `GEMINI_API_KEY` - Your Gemini API key (required)
   - `DATABASE_URL` - Database URL (optional)

4. **Deploy**
   - Click "Deploy"
   - Vercel will deploy automatically

After deployment, you'll get a URL like: `https://shels.vercel.app`

## 📁 Project Structure

```
shels/
├── app/
│   ├── api/                    # API Routes (Backend)
│   │   ├── analyze/            # Code analysis endpoint
│   │   ├── generate-tests/     # Test generation endpoint
│   │   ├── run-tests/          # Test execution endpoint
│   │   ├── fix/                # Auto-fix endpoint
│   │   ├── marathon/           # Marathon Agent endpoint
│   │   ├── risk-timeline/      # Risk timeline generation
│   │   ├── code-metrics/       # Code metrics calculation
│   │   ├── explain-fix/        # Fix explanation
│   │   ├── context-aware-fix/  # Context-aware fixes
│   │   ├── reasoning-chain/    # Reasoning chain generation
│   │   └── sessions/           # Session management API
│   ├── page.tsx                # Home page (Main UI)
│   ├── layout.tsx              # Root layout
│   ├── globals.css             # Global styles
│   └── icon.png                # App icon
├── components/                 # React components
│   ├── Sidebar.tsx             # Navigation sidebar
│   ├── Header.tsx              # Top header
│   ├── ResultsView.tsx         # Results display
│   ├── RiskTimelineView.tsx    # Risk timeline visualization
│   ├── CodeMetricsView.tsx     # Code metrics display
│   ├── IssuesList.tsx         # Issues list component
│   ├── IssueItem.tsx          # Individual issue item
│   ├── TestConfig.tsx         # Test configuration
│   ├── LoadingSpinner.tsx     # Loading indicator
│   ├── ErrorMessage.tsx       # Error display
│   ├── FixExplanationModal.tsx # Fix explanation modal
│   └── ReasoningChainModal.tsx  # Reasoning chain modal
├── lib/
│   ├── services/               # Core services
│   │   ├── codeAnalyzer.ts    # Code analysis logic
│   │   ├── testGenerator.ts   # Test generation logic
│   │   ├── testRunner.ts      # Test execution logic
│   │   ├── autoFix.ts         # Auto-fix logic
│   │   ├── marathonAgent.ts   # Marathon Agent implementation
│   │   ├── riskTimeline.ts    # Risk timeline generation
│   │   ├── codeMetrics.ts     # Code metrics calculation
│   │   ├── repoReader.ts      # Repository reader
│   │   ├── fixExplainer.ts    # Fix explanation service
│   │   ├── contextAwareFix.ts # Context-aware fix service
│   │   ├── reasoningChains.ts # Reasoning chain service
│   │   └── sessionStorage.ts  # Session storage service
│   └── utils/                  # Utility functions
│       ├── aiHelper.ts        # AI helper functions (Gemini integration)
│       ├── apiHelper.ts       # API response helpers
│       └── fetchHelper.ts     # Fetch utilities
├── hooks/
│   └── useCodeTesting.ts      # Main testing hook
├── data/
│   └── sessions/              # Session data storage (JSON files)
├── public/                     # Static assets
│   └── icon.png                # Public app icon
└── package.json
```

## 🔑 Environment Variables

Create a `.env.local` file in the root directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
DATABASE_URL=your_database_url_here  # Optional
```

Get your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

## 🎬 How It Works

1. **Input**: Provide a GitHub repository URL or upload files
2. **Analysis**: Shels analyzes the entire codebase using Gemini 3's Extended Context
3. **Testing**: Automatically generates comprehensive tests (unit, integration, security, performance)
4. **Detection**: Identifies bugs, vulnerabilities, and code quality issues
5. **Fixing**: Provides AI-powered fixes with detailed explanations
6. **Monitoring**: Marathon Agent continuously monitors and improves code quality

## 🏆 Hackathon Submission

This project is submitted for the **Google Gemini 3 Hackathon** and implements the **Marathon Agent** strategic track.

### Key Highlights:
- ✅ Uses Gemini 3 Extended Context (1M tokens)
- ✅ Implements Marathon Agent for long-running tasks
- ✅ Advanced Reasoning for complex code analysis
- ✅ Self-correction capabilities
- ✅ Thought Signatures for continuity

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

This project was created for the Gemini 3 Hackathon. Contributions and feedback are welcome!

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Built with ❤️ for the Gemini 3 Hackathon**
