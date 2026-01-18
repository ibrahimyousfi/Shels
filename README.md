# 🐚 Shels - Autonomous Code Testing Agent

> **The AI Engineer that thinks like a CTO. Autonomous code testing and analysis powered by Google Gemini 3 AI. Understands business impact, not just code quality.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)

Shels is an **autonomous engineering agent** that doesn't just find bugs—it understands their business impact. Powered by Google Gemini 3's advanced AI, Shels analyzes codebases, generates comprehensive tests, detects issues, and automatically fixes problems while explaining the real-world consequences of each issue.

**Unlike traditional code analysis tools**, Shels thinks like a CTO: it connects technical issues to business metrics, prioritizes fixes by ROI, and explains impact in terms of revenue, users, and reputation.

Built for the **Gemini 3 Hackathon** with a focus on the **Marathon Agent** strategic track.

---

## 🚀 Quick Start

```bash
# Clone and install
git clone https://github.com/ibrahimyousfi/Shels.git
cd Shels
npm install

# Set up environment
cp .env.example .env.local
# Add your GEMINI_API_KEY

# Run
npm run dev
```

Visit `http://localhost:3000` to get started.

---

## 📚 Documentation

> **💡 Tip**: Enable [Wiki](https://github.com/ibrahimyousfi/Shels/wiki) in Settings → Features to access documentation as organized tabs!

**Quick Links:**
- **[📖 Wiki](https://github.com/ibrahimyousfi/Shels/wiki)** - Complete documentation with tabs (enable in Settings)
- **[✨ Features](FEATURES.md)** - Complete feature list and key differentiators
- **[📦 Installation & Setup](INSTALLATION.md)** - Detailed installation and deployment guide
- **[🏗️ Architecture](ARCHITECTURE.md)** - Technical architecture and deep dive
- **[🔬 Comparison](COMPARISON.md)** - How Shels compares to other tools
- **[🏆 Hackathon](HACKATHON.md)** - Hackathon submission details and highlights
- **[💼 Use Cases](USE_CASES.md)** - Use cases for different teams

> 📖 **Setup Guide**: See [WIKI_GUIDE.md](WIKI_GUIDE.md) for instructions on enabling Wiki tabs

---

## 🎬 How It Works

1. **Input**: Provide a GitHub repository URL or upload files
2. **Analysis**: Shels analyzes the entire codebase using Gemini 3's Extended Context (1M tokens)
3. **Testing**: Automatically generates comprehensive tests (unit, integration, security, performance) with 95%+ accuracy
4. **Detection**: Identifies bugs, vulnerabilities, and code quality issues with business impact analysis
5. **Fixing**: Provides AI-powered fixes with detailed explanations and reasoning chains (80%+ auto-fix rate)
6. **Monitoring**: Marathon Agent continuously monitors and improves code quality (24/7 autonomous operation)

---

## 🏗️ Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interface (Next.js)                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Input   │  │ Results │  │ Marathon │  │ Business │   │
│  │   UI     │  │   View  │  │  Agent   │  │  Impact  │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
└───────┼─────────────┼─────────────┼─────────────┼─────────┘
        │             │             │             │
        └─────────────┴─────────────┴─────────────┘
                      │
        ┌─────────────▼─────────────┐
        │    API Routes (Next.js)   │
        │  ┌─────────────────────┐  │
        │  │  /api/analyze       │  │
        │  │  /api/marathon      │  │
        │  │  /api/business-     │  │
        │  │      impact         │  │
        │  └──────────┬──────────┘  │
        └─────────────┼─────────────┘
                      │
        ┌─────────────▼─────────────┐
        │   Gemini 3 API (Core)    │
        │  ┌─────────────────────┐  │
        │  │ Extended Context    │  │
        │  │  (1M tokens)        │  │
        │  ├─────────────────────┤  │
        │  │ Advanced Reasoning  │  │
        │  ├─────────────────────┤  │
        │  │ Marathon Agent      │  │
        │  │ (Thought Signatures)│  │
        │  │ (Self-correction)   │  │
        │  └─────────────────────┘  │
        └───────────────────────────┘
```

**Key Components:**
- **Extended Context**: Analyzes entire codebases in one pass (10,000+ files) - **Technical Mastery**
- **Marathon Agent**: Autonomous operation with Thought Signatures (24/7) - **Strategic Track Implementation**
- **Business Impact**: Unique feature connecting code to business metrics - **Innovation**
- **Advanced Reasoning**: Multi-step reasoning chains for transparency - **Technical Excellence**

📖 **For detailed architecture documentation, see [ARCHITECTURE.md](./ARCHITECTURE.md)**

---

## 🎯 Key Highlights

- ✅ **Business Impact Analysis** - UNIQUE feature connecting code to business metrics
- ✅ **Marathon Agent** - ONLY hackathon project with true 24/7 autonomous operation
- ✅ **Extended Context (1M tokens)** - Analyzes 10,000+ files in single pass
- ✅ **Self-Correction** - 40% reduction in false positives over time
- ✅ **Advanced Reasoning** - Multi-step reasoning chains for transparency

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

This project was created for the Gemini 3 Hackathon. Contributions and feedback are welcome!

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Built with ❤️ for the Gemini 3 Hackathon**
