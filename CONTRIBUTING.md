# Contributing to Shels

Thank you for your interest in contributing to Shels! This document provides guidelines and instructions for contributing to the project.

## 🤝 How to Contribute

### Reporting Bugs

If you find a bug, please open an issue with:
- **Clear title and description**
- **Steps to reproduce** the bug
- **Expected behavior** vs **Actual behavior**
- **Screenshots** (if applicable)
- **Environment details** (OS, Node version, etc.)

### Suggesting Features

We welcome feature suggestions! Please:
- Check if the feature already exists or has been suggested
- Open an issue with a clear description
- Explain the **use case** and **benefits**
- Consider implementation complexity

### Code Contributions

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes**
4. **Follow the coding standards** (see below)
5. **Test your changes**
6. **Commit with clear messages** (`git commit -m 'Add amazing feature'`)
7. **Push to your branch** (`git push origin feature/amazing-feature`)
8. **Open a Pull Request**

## 📋 Coding Standards

### TypeScript/JavaScript

- Use **TypeScript** for all new code
- Follow **ESLint** rules (run `npm run lint`)
- Use **meaningful variable names**
- Add **comments** for complex logic
- Keep functions **small and focused**

### Code Style

```typescript
// ✅ Good
function calculateBusinessImpact(issue: Issue): BusinessImpact {
  const impact = {
    revenue: calculateRevenueImpact(issue),
    users: estimateAffectedUsers(issue),
    reputation: assessReputationRisk(issue)
  };
  return impact;
}

// ❌ Bad
function calc(issue: any): any {
  // complex logic without comments
  return {...issue, impact: issue.severity * 10};
}
```

### Commit Messages

Use clear, descriptive commit messages:

```
✅ Good: "Add business impact calculation for security issues"
✅ Good: "Fix Marathon Agent state persistence bug"
❌ Bad: "fix"
❌ Bad: "update"
```

## 🧪 Testing

- Test your changes locally before submitting
- Ensure existing tests pass (`npm test` if available)
- Add tests for new features when possible

## 📝 Pull Request Process

1. **Update documentation** if needed
2. **Ensure code follows project style**
3. **Test thoroughly**
4. **Update CHANGELOG.md** (if exists)
5. **Request review** from maintainers

## 🎯 Project Focus

Shels is built for the **Gemini 3 Hackathon** with focus on:
- **Marathon Agent** (Strategic Track)
- **Extended Context** (1M tokens)
- **Business Impact Analysis** (Unique feature)
- **Advanced Reasoning** (Multi-step chains)

When contributing, keep these priorities in mind.

## ❓ Questions?

- Open an issue for questions
- Check existing issues and discussions
- Review the [README.md](README.md) and [ARCHITECTURE.md](ARCHITECTURE.md)

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to Shels! 🎉**
