# 📚 Documentation Guide

This document explains how to add and organize documentation files in GitHub repositories.

## 🔖 GitHub Community Standards Files

GitHub automatically recognizes these specific file names and displays them as tabs/links:

### Standard Files (Auto-Detected)

| File Name | Location | Tab/Link Location |
|-----------|----------|-------------------|
| `README.md` | Root | Main page (always visible) |
| `LICENSE` | Root | Community Profile |
| `CONTRIBUTING.md` | Root, `.github/`, or `docs/` | Community Profile + Tab |
| `CODE_OF_CONDUCT.md` | Root, `.github/`, or `docs/` | Community Profile |
| `SECURITY.md` | Root, `.github/`, or `docs/` | Security tab + Community Profile |

### How to Add More Documentation

#### Option 1: Add Files in Root Directory ✅ (Current Approach)

**Pros:**
- Files appear in file list
- Easy to access
- Direct links from README

**Cons:**
- No automatic tabs (except standard files)
- Files appear in main file list

**Example:**
```
react.wieps/
├── README.md
├── FEATURES.md          ← Visible in file list
├── INSTALLATION.md      ← Visible in file list
├── ARCHITECTURE.md      ← Visible in file list
└── ...
```

#### Option 2: Use GitHub Wiki 📝

**How:**
1. Go to repository → **Settings** → **Features**
2. Enable **Wiki**
3. Create pages in Wiki tab

**Pros:**
- Separate tab in repository
- Easy to organize
- Version controlled

**Cons:**
- Separate from main repository
- Different URL structure

#### Option 3: Use GitHub Pages 🌐

**How:**
1. Create `docs/` folder with documentation
2. Go to **Settings** → **Pages**
3. Enable Pages from `docs/` folder

**Pros:**
- Custom website for documentation
- Professional appearance
- Separate URL

**Cons:**
- Requires additional setup
- Separate from repository

#### Option 4: Use `.github/` Folder 📁

**How:**
1. Create `.github/` folder
2. Add files like:
   - `.github/CONTRIBUTING.md`
   - `.github/SECURITY.md`
   - `.github/FUNDING.yml` (for sponsors)
   - `.github/ISSUE_TEMPLATE/` (for issue templates)
   - `.github/PULL_REQUEST_TEMPLATE.md`

**Pros:**
- Organized in one place
- Some files get special treatment
- Issue/PR templates

**Cons:**
- Not all files get tabs automatically

---

## 📋 Recommended Structure for Shels

### Current Structure (Recommended) ✅

```
react.wieps/
├── README.md                    # Main documentation
├── LICENSE                      # MIT License
├── CONTRIBUTING.md              # Contribution guidelines
├── CODE_OF_CONDUCT.md           # Code of conduct
├── SECURITY.md                  # Security policy
│
├── FEATURES.md                  # Features documentation
├── INSTALLATION.md              # Installation guide
├── ARCHITECTURE.md              # Technical architecture
├── COMPARISON.md                # Tool comparisons
├── HACKATHON.md                 # Hackathon details
└── USE_CASES.md                 # Use cases
```

### Alternative: Using `.github/` Folder

```
react.wieps/
├── README.md
├── LICENSE
│
├── .github/
│   ├── CONTRIBUTING.md
│   ├── CODE_OF_CONDUCT.md
│   ├── SECURITY.md
│   ├── FUNDING.yml
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   └── PULL_REQUEST_TEMPLATE.md
│
└── docs/
    ├── FEATURES.md
    ├── INSTALLATION.md
    └── ...
```

---

## 🎯 Best Practices

1. **Keep README.md in root** - Always visible
2. **Use standard file names** - For auto-detection
3. **Link from README** - Easy navigation
4. **Organize logically** - Group related docs
5. **Keep files focused** - One topic per file

---

## 💡 Tips

- **File names matter**: Use descriptive, clear names
- **Update README links**: Keep navigation current
- **Use badges**: Show project status
- **Add examples**: Help users understand quickly

---

**Note**: GitHub only auto-detects specific file names (CONTRIBUTING, SECURITY, etc.). Other files appear in the file list but don't get special tabs automatically.
