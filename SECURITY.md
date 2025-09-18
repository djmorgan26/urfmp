# Security Guidelines

This document outlines security best practices for the URFMP project.

## 🔒 Environment Variables & Secrets

### ✅ What's Already Secure

- `.env` files are properly excluded from git via `.gitignore`
- All secrets use environment variables (no hardcoded secrets in code)
- JWT tokens use `process.env.JWT_SECRET`
- API keys use environment variable references

### ⚠️ Action Required for Production

1. **Generate Secure JWT Secrets**
   ```bash
   # Generate a secure JWT secret
   openssl rand -base64 32
   ```

2. **Replace ALL Placeholder Values**
   - All values in `.env.example` with `CHANGE_ME` or `your-*-here` must be replaced
   - **CRITICAL**: Database URL contains credentials - never use example values
   - Use strong, unique passwords for all services
   - Generate real API keys from vendor portals

3. **Database Security**
   ```bash
   # ❌ NEVER use this in production:
   DATABASE_URL=postgresql://username:CHANGE_ME_PASSWORD@localhost:5432/urfmp

   # ✅ Use strong credentials:
   DATABASE_URL=postgresql://myuser:SecureP@ssw0rd123@localhost:5432/urfmp_prod
   ```
   - Change default database passwords
   - Use strong passwords (minimum 16 characters)
   - Consider using environment-specific database names

## 📋 Security Checklist

### Before Deployment

- [ ] Replace all placeholder secrets in `.env`
- [ ] Generate strong JWT secrets using `openssl rand -base64 32`
- [ ] Change default database passwords
- [ ] Update SMTP credentials with real values
- [ ] Replace vendor API keys with production keys
- [ ] Verify `.env` is not committed to git
- [ ] Enable HTTPS in production
- [ ] Configure proper CORS origins
- [ ] Set up proper rate limiting
- [ ] Review and test authentication middleware

### Git Security

- [ ] Verify `.env` is in `.gitignore`
- [ ] Check no secrets are hardcoded in source files
- [ ] Scan commit history for accidentally committed secrets
- [ ] Set up pre-commit hooks to prevent secret commits

## 🚨 If Secrets Are Compromised

1. **Immediately rotate all affected secrets**
2. **Change database passwords**
3. **Regenerate JWT secrets** (will logout all users)
4. **Revoke and regenerate API keys**
5. **Check logs for unauthorized access**
6. **Notify team members**

## 🔧 Environment Variables

### Required for Security
```bash
# Critical - Generate with: openssl rand -base64 32
JWT_SECRET=<your-secure-jwt-secret>
ENCRYPTION_KEY=<32-character-encryption-key>

# Database
DATABASE_URL=postgresql://user:secure-password@host:5432/dbname

# External Services
UNIVERSAL_ROBOTS_API_KEY=<real-api-key>
KUKA_API_KEY=<real-api-key>
ABB_API_KEY=<real-api-key>

# Email
SMTP_PASSWORD=<real-smtp-password>
```

### Development vs Production

**Development:**
- Use `.env` for local secrets
- Use mock/test API keys when possible
- Use local database with test data

**Production:**
- Use secure secret management (AWS Secrets Manager, Azure Key Vault, etc.)
- Never log secrets
- Use environment-specific configurations
- Enable audit logging

## 🛡️ Code Security

### Current Implementation
- ✅ Environment variables for all secrets
- ✅ JWT tokens for authentication
- ✅ API key middleware for external access
- ✅ Rate limiting middleware
- ✅ CORS configuration
- ✅ Input validation middleware

### Additional Recommendations
- Use HTTPS in production
- Implement Content Security Policy (CSP)
- Add security headers middleware
- Enable audit logging
- Regular security dependency updates
- Implement proper session management

## 📞 Reporting Security Issues

If you discover a security vulnerability:

1. **DO NOT** create a public GitHub issue
2. Contact the development team privately
3. Provide detailed information about the vulnerability
4. Allow time for the issue to be resolved before disclosure

## 🔄 Regular Security Tasks

### Weekly
- [ ] Review access logs for anomalies
- [ ] Check for dependency security updates

### Monthly
- [ ] Rotate development secrets
- [ ] Review user access permissions
- [ ] Update security dependencies

### Quarterly
- [ ] Security audit of codebase
- [ ] Review and update security policies
- [ ] Test incident response procedures