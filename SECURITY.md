# Security Policy

## 🔒 Supported Versions

We actively support security updates for the current version of Shels.

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |
| < Latest| :x:                |

## 🛡️ Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please follow these steps:

### 1. **Do NOT** open a public issue

Security vulnerabilities should be reported privately to protect users.

### 2. Report via Email

Send an email to: **[Your Email]** or open a **private security advisory** on GitHub.

### 3. Include Details

Please provide:
- **Description** of the vulnerability
- **Steps to reproduce**
- **Potential impact**
- **Suggested fix** (if any)

### 4. Response Time

We will:
- **Acknowledge** your report within 48 hours
- **Investigate** and provide updates within 7 days
- **Fix** and release a patch as soon as possible

## 🔐 Security Best Practices

### For Users

- **Keep dependencies updated**: Run `npm audit` regularly
- **Use environment variables**: Never commit API keys or secrets
- **Review code changes**: Before deploying to production
- **Monitor logs**: Watch for suspicious activity

### For Contributors

- **Never commit secrets**: Use `.env.local` for sensitive data
- **Sanitize inputs**: Always validate and sanitize user inputs
- **Use HTTPS**: For all API communications
- **Review dependencies**: Check for known vulnerabilities

## 🚨 Known Security Considerations

### API Keys

- **Gemini API Key**: Stored in environment variables, never in code
- **GitHub Tokens**: If used, must be stored securely

### Data Handling

- **Session Data**: Stored locally or in secure storage
- **Code Analysis**: Code is sent to Gemini API - ensure compliance with your organization's policies

## 📋 Security Checklist

Before deploying:

- [ ] All dependencies are up to date
- [ ] No secrets in code or commits
- [ ] Environment variables are set correctly
- [ ] HTTPS is enabled
- [ ] Input validation is in place
- [ ] Error messages don't leak sensitive information

## 🙏 Recognition

We appreciate responsible disclosure. Security researchers who report valid vulnerabilities will be:
- **Credited** in security advisories (if desired)
- **Thanked** for helping improve Shels security

---

**Thank you for helping keep Shels secure! 🔒**
