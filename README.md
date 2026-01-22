# Privacy-brush 🛡️

**Terminal Output Masking Tool | Safely Share Logs by Hiding Sensitive Information**

[![npm version](https://img.shields.io/npm/v/privacy-brush.svg)](https://www.npmjs.com/package/privacy-brush)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Typecheck](https://github.com/legend80s/privacy-brush/actions/workflows/typecheck.yml/badge.svg?branch=master)](https://github.com/legend80s/privacy-brush/actions/workflows/typecheck.yml)

<p align="center">
  <img src="https://raw.githubusercontent.com/legend80s/privacy-brush/main/docs/demo.gif" alt="Privacy-brush Demo" width="800">
</p>

## ✨ Features

- 🎯 **Smart Detection** - Auto-detects 20+ sensitive information patterns
- 🔧 **Highly Configurable** - Custom masking rules and characters
- ⚡ **High Performance** - Stream processing for large files
- 🛡️ **Privacy First** - Local processing only, no data leaves your machine
- 📦 **Multiple Formats** - CLI, API, Stream, File processing
- 🌐 **Multi-language** - Supports English, Chinese, and other log formats
- 🎨 **Customizable** - Add your own sensitive patterns

## 📦 Installation

```bash
# Global install (recommended for CLI)
npm install -g privacy-brush

# Or as dev dependency
npm install privacy-brush --save-dev

# Using yarn
yarn add privacy-brush

# Using pnpm
pnpm add privacy-brush
```

## 🚀 Quick Start

### Basic Usage

```bash
# Direct terminal output processing
flutter devices | privacy-brush

# Process files
privacy-brush input.log -o masked.log

# Real-time command output
some-command --verbose | privacy-brush --live
```

### In Your Node.js Project

```javascript
const { Privacy-brush } = require('privacy-brush');
// Or ES Module
import { Privacy-brush } from 'privacy-brush';

// Create instance
const masker = new Privacy-brush();

// Process text
const sensitiveText = `Windows [Version 10.0.19045.6456]
Chrome 144.0.7559.60
User IP: 192.168.1.100`;

const safeText = masker.mask(sensitiveText);
console.log(safeText);
// Output:
// Windows [Version 10.███.███.███]
// Chrome 144.███.███.███
// User IP: 192.168.███.███
```

## 📖 Examples

### Example 1: Process Flutter Output

**Original:**

```bash
❯ flutter devices
Found 4 connected devices:
  Windows (desktop) • windows • windows-x64 • Microsoft Windows [Version 10.0.19045.6456]
  Chrome (web) • chrome • web-javascript • Google Chrome 144.0.7559.60
```

**After Privacy-brush:**

```bash
❯ flutter devices | privacy-brush
Found 4 connected devices:
  Windows (desktop) • windows • windows-x64 • Microsoft Windows [Version 10.███.███.███]
  Chrome (web) • chrome • web-javascript • Google Chrome 144.███.███.███
```

### Example 2: Process Node.js Debug Logs

```javascript
const masker = new Privacy-brush({
  maskChar: '*',
  preserveFirstPart: false
});

const debugLog = `
DEBUG: User login from IP 192.168.1.100
DEBUG: Session ID: abc123def456
DEBUG: Browser: Chrome/144.0.7559.60
DEBUG: OS: Windows 10.0.19045
`;

console.log(masker.mask(debugLog));
// Output:
// DEBUG: User login from IP ***.***.***.100
// DEBUG: Session ID: ************
// DEBUG: Browser: Chrome/***.***.***.***
// DEBUG: OS: Windows ***.***.***
```

## ⚙️ Configuration

### CLI Options

```bash
# Basic usage
privacy-brush [input-file] [options]

# Options
--output, -o <file>      Output to file
--char, -c <char>        Mask character (default: █)
--preserve-first         Keep first part of version numbers
--strict                 Strict mode (mask more info)
--config <file>          Use config file
--list-patterns          List all built-in patterns
--add-pattern <regex>    Add custom regex pattern
--version                Show version
--help                   Show help
```

### JavaScript API Options

```javascript
const masker = new Privacy-brush({
  // Basic config
  maskChar: '█',           // Mask character
  preserveFirstPart: true, // Keep first part of versions
  
  // Pattern config
  patterns: {
    ipAddress: true,
    macAddress: true,
    email: true,
    phone: true,
    creditCard: true,
    jwtToken: true,
    apiKey: true,
    
    osVersion: true,
    browserVersion: true,
    appVersion: true,
    
    deviceId: true,
    serialNumber: true,
    
    filePaths: false,     // Don't mask file paths
    localhost: false      // Don't mask localhost
  },
  
  // Custom patterns
  customPatterns: [
    {
      name: 'custom-id',
      regex: /ID-\d{6}/g,
      mask: 'ID-******'
    }
  ]
});
```

## 🔧 Built-in Patterns

Privacy-brush includes 20+ pre-configured sensitive information patterns:

### 🔐 Personal Information

- Email addresses `user@example.com` → `***@example.com`
- Phone numbers `13800138000` → `138****8000`
- ID numbers `110101199001011234` → `110101********1234`

### 💻 Technical Information

- IP addresses `192.168.1.100` → `192.168.*.*`
- MAC addresses `00:1A:2B:3C:4D:5E` → `00:**:**:**:**:**`
- Port numbers `:8080` → `:****`
- API keys `sk_live_1234567890` → `sk_live_********`

### 🖥️ System & Browser

- Windows versions `10.0.19045.6456` → `10.███.███.███`
- Chrome versions `144.0.7559.60` → `144.███.███.███`
- Android versions `Android 16` → `Android ██`

### 🏢 Business Data

- Credit cards `4111 1111 1111 1111` → `4111 **** **** 1111`
- JWT tokens `eyJhbGciOiJIUzI1...` → `eyJ********...`
- Session IDs `session-abc123def456` → `session-************`

## 🛠️ Advanced Usage

### Stream Processing for Large Files

```javascript
const fs = require('fs');
const { createMaskStream } = require('privacy-brush');

const inputStream = fs.createReadStream('huge.log');
const maskStream = createMaskStream();

inputStream
  .pipe(maskStream)
  .pipe(fs.createWriteStream('masked-huge.log'))
  .on('finish', () => {
    console.log('Large file processing completed!');
  });
```

### Express.js Integration

```javascript
const express = require('express');
const { Privacy-brush } = require('privacy-brush');
const app = express();
const masker = new Privacy-brush();

// Middleware: auto-mask sensitive info in responses
app.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function(body) {
    if (typeof body === 'string' && body.includes('sensitive')) {
      body = masker.mask(body);
    }
    originalSend.call(this, body);
  };
  next();
});
```

### Git Hook Integration

```bash
#!/bin/bash
# .git/hooks/pre-commit

for file in $(git diff --cached --name-only | grep -E '\.(log|txt|json)$'); do
  if privacy-brush --check "$file"; then
    echo "❌ File $file contains unmasked sensitive information"
    echo "Use: privacy-brush $file -o $file && git add $file"
    exit 1
  fi
done
```

## 📁 Configuration File

Create `privacy-brush.config.json`:

```json
{
  "maskChar": "█",
  "preserveFirstPart": true,
  "patterns": {
    "ipAddress": true,
    "email": true,
    "phone": true,
    "osVersion": true,
    "browserVersion": true
  },
  "customPatterns": [
    {
      "name": "project-api-key",
      "regex": "PROJECT_API_KEY=\\w{32}",
      "mask": "PROJECT_API_KEY=******************************"
    }
  ]
}
```

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License © 2024 Privacy-brush Contributors

## 📞 Support

- 📧 Email: <support@privacy-brush.dev>
- 🐛 [Issue Tracker](https://github.com/legend80s/privacy-brush/issues)
- 💬 [Discussions](https://github.com/legend80s/privacy-brush/discussions)
- 📖 [Documentation](https://privacy-brush.dev/docs)

---

<p align="center">
  <strong>Share Safely, Start with Privacy-brush</strong><br>
  <sub>Protect privacy, communicate with confidence</sub>
</p>
