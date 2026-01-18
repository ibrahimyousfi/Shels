# 📦 Installation & Setup

## Installation

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

---

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

---

## 🔑 Environment Variables

Create a `.env.local` file in the root directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
DATABASE_URL=your_database_url_here  # Optional
```

Get your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

---

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
│   ├── Header.tsx                # Top header
│   ├── ResultsView.tsx        # Results display
│   ├── RiskTimelineView.tsx   # Risk timeline visualization
│   ├── CodeMetricsView.tsx    # Code metrics display
│   ├── IssuesList.tsx         # Issues list component
│   ├── IssueItem.tsx          # Individual issue item
│   ├── TestConfig.tsx         # Test configuration
│   ├── LoadingSpinner.tsx      # Loading indicator
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
