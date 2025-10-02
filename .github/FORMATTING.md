# Automatic Code Formatting

## 🎯 Overview

This project uses **automatic code formatting** to ensure consistent code style and prevent CI/CD failures. All formatting is handled automatically—you don't need to manually run Prettier.

## ⚙️ How It Works

### Git Pre-Commit Hooks (Husky + lint-staged)

Every time you run `git commit`, a pre-commit hook automatically:

1. **Detects staged files** matching `**/*.{ts,tsx,js,jsx,json,md}`
2. **Runs Prettier** to format them
3. **Re-stages formatted files**
4. **Completes the commit** with properly formatted code

### What Gets Formatted

- TypeScript files (`.ts`, `.tsx`)
- JavaScript files (`.js`, `.jsx`)
- JSON files (`.json`)
- Markdown files (`.md`)

## 📋 Commands

### Automatic (Recommended)

```bash
# Just commit normally - formatting happens automatically
git add .
git commit -m "Your commit message"
```

### Manual Formatting

```bash
# Format all files
npm run format

# Check formatting without fixing
npm run format:check

# Pre-deployment validation (includes formatting + tests + builds)
npm run pre-deploy
```

## 🚀 Setup for New Developers

When you clone the repository and run `npm install`, Husky automatically sets up the Git hooks via the `prepare` script. No additional setup required!

```bash
git clone <repo>
cd urfmp
npm install  # Automatically sets up Git hooks
```

## 🔧 Configuration

### Husky Configuration

- **Location**: `.husky/pre-commit`
- **Action**: Runs `npx lint-staged` before each commit

### lint-staged Configuration

Defined in `package.json`:

```json
{
  "lint-staged": {
    "**/*.{ts,tsx,js,jsx,json,md}": ["prettier --write"]
  }
}
```

### Prettier Configuration

Default Prettier settings are used. To customize, create a `.prettierrc` file.

## ✅ Benefits

- **Zero manual effort** - Formatting is automatic
- **No CI/CD failures** - All commits pass Prettier checks
- **Consistent code style** - Enforced across all contributors
- **Fast commits** - Only formats changed files
- **Industry standard** - Uses Husky + lint-staged (widely adopted)

## 🛠️ Troubleshooting

### Pre-commit hook not running

```bash
# Reinstall Husky
npm run prepare

# Check hook permissions
chmod +x .husky/pre-commit
```

### Formatting not being applied

```bash
# Manually format all files
npm run format

# Check if lint-staged is installed
npm ls lint-staged
```

### Bypassing the hook (NOT RECOMMENDED)

```bash
# Only use in emergencies
git commit --no-verify -m "Emergency fix"
```

⚠️ **Warning**: Bypassing the hook may cause CI/CD failures. Only use when absolutely necessary.

## 📚 Additional Resources

- [Husky Documentation](https://typicode.github.io/husky/)
- [lint-staged Documentation](https://github.com/okonet/lint-staged)
- [Prettier Documentation](https://prettier.io/docs/en/)

---

**Last Updated**: October 2025
**Maintained By**: URFMP Development Team
