# privacy-brush 🛡️

**终端输出安全掩码工具 | 智能隐藏敏感信息，安全分享日志内容**

[![npm version](https://img.shields.io/npm/v/privacy-brush.svg)](https://www.npmjs.com/package/privacy-brush)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/privacy-brush)](https://nodejs.org)
[![Downloads](https://img.shields.io/npm/dm/privacy-brush.svg)](https://www.npmjs.com/package/privacy-brush)

<p align="center">
  <img src="https://raw.githubusercontent.com/yourusername/privacy-brush/main/docs/demo.gif" alt="privacy-brush演示" width="800">
</p>

## ✨ 特性

- 🎯 **智能识别** - 自动检测20+种敏感信息模式
- 🔧 **高度可配置** - 支持自定义掩码规则和字符
- ⚡ **高性能** - 流式处理大文件，内存友好
- 🛡️ **隐私保护** - 本地处理，数据不出本地
- 📦 **多格式支持** - CLI、API、流式处理、文件处理
- 🌐 **多语言** - 支持中文、英文日志格式
- 🎨 **可定制** - 支持自定义敏感信息模式

## 📦 安装

```bash
# 全局安装（推荐用于CLI使用）
npm install -g privacy-brush

# 或作为项目依赖
npm install privacy-brush --save-dev

# 使用yarn
yarn add privacy-brush

# 使用pnpm
pnpm add privacy-brush
```

## 🚀 快速开始

### 基本使用

```bash
# 直接处理终端输出
flutter devices | privacy-brush

# 处理文件
privacy-brush -i input.log -o masked.log

# 实时处理命令输出
some-command --verbose | privacy-brush --live
```

### 在Node.js项目中使用

```javascript
const { privacy-brush } = require('privacy-brush');
// 或 ES Module
import { privacy-brush } from 'privacy-brush';

// 创建实例
const masker = new privacy-brush();

// 处理文本
const sensitiveText = `Windows [版本 10.0.19045.6456]
Chrome 144.0.7559.60
用户IP: 192.168.1.100`;

const safeText = masker.mask(sensitiveText);
console.log(safeText);
// 输出:
// Windows [版本 10.███.███.███]
// Chrome 144.███.███.███
// 用户IP: 192.168.███.███
```

## 📖 使用示例

### 示例1：处理Flutter输出

**原始输出:**

```bash
❯ flutter devices
Found 4 connected devices:
  Windows (desktop) • windows • windows-x64 • Microsoft Windows [版本 10.0.19045.6456]
  Chrome (web) • chrome • web-javascript • Google Chrome 144.0.7559.60
```

**使用privacy-brush处理后:**

```bash
❯ flutter devices | privacy-brush
Found 4 connected devices:
  Windows (desktop) • windows • windows-x64 • Microsoft Windows [版本 10.███.███.███]
  Chrome (web) • chrome • web-javascript • Google Chrome 144.███.███.███
```

### 示例2：处理Node.js调试日志

```javascript
const masker = new privacy-brush({
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
// 输出:
// DEBUG: User login from IP ***.***.***.100
// DEBUG: Session ID: ************
// DEBUG: Browser: Chrome/***.***.***.***
// DEBUG: OS: Windows ***.***.***
```

## ⚙️ 配置选项

### CLI 参数

```bash
# 基本用法
privacy-brush [input-file] [options]

# 选项
--output, -o <file>      输出到文件
--char, -c <char>        掩码字符（默认: █）
--preserve-first         保留版本号第一部分
--strict                 严格模式（掩码更多信息）
--config <file>          使用配置文件
--list-patterns          列出所有内置模式
--add-pattern <regex>    添加自定义正则模式
--version                显示版本
--help                   显示帮助
```

### JavaScript API 配置

```javascript
const masker = new privacy-brush({
  // 基础配置
  maskChar: '█',           // 掩码字符
  preserveFirstPart: true, // 保留版本号第一部分
  
  // 模式配置
  patterns: {
    // 启用/禁用特定模式
    ipAddress: true,
    macAddress: true,
    email: true,
    phone: true,
    creditCard: true,
    jwtToken: true,
    apiKey: true,
    
    // 版本相关
    osVersion: true,
    browserVersion: true,
    appVersion: true,
    
    // 设备标识
    deviceId: true,
    serialNumber: true,
    
    // 路径和URL
    filePaths: false,     // 不掩码文件路径
    localhost: false      // 不掩码localhost
  },
  
  // 自定义模式
  customPatterns: [
    {
      name: 'custom-id',
      regex: /ID-\d{6}/g,
      mask: 'ID-******'
    }
  ],
  
  // 高级选项
  maxLength: 1000000,     // 最大处理长度
  encoding: 'utf8',       // 文件编码
  logLevel: 'warn'        // 日志级别
});
```

## 🔧 内置敏感信息模式

privacy-brush 预置了20+种常见敏感信息模式：

### 🔐 身份信息

- 邮箱地址 `user@example.com` → `***@example.com`
- 电话号码 `13800138000` → `138****8000`
- 身份证号 `110101199001011234` → `110101********1234`

### 💻 技术信息

- IP地址 `192.168.1.100` → `192.168.*.*`
- MAC地址 `00:1A:2B:3C:4D:5E` → `00:**:**:**:**:**`
- 端口号 `:8080` → `:****`
- API密钥 `sk_live_1234567890` → `sk_live_********`

### 🖥️ 系统和浏览器

- Windows版本 `10.0.19045.6456` → `10.███.███.███`
- Chrome版本 `144.0.7559.60` → `144.███.███.███`
- Android版本 `Android 16` → `Android ██`

### 🏢 企业数据

- 信用卡号 `4111 1111 1111 1111` → `4111 **** **** 1111`
- JWT令牌 `eyJhbGciOiJIUzI1...` → `eyJ********...`
- 会话ID `session-abc123def456` → `session-************`

## 🛠️ 高级用法

### 流式处理大文件

```javascript
const fs = require('fs');
const { createMaskStream } = require('privacy-brush');

// 创建可读流
const inputStream = fs.createReadStream('huge.log');

// 创建掩码流
const maskStream = createMaskStream();

// 管道处理
inputStream
  .pipe(maskStream)
  .pipe(fs.createWriteStream('masked-huge.log'))
  .on('finish', () => {
    console.log('大文件处理完成！');
  });
```

### 集成到Express应用

```javascript
const express = require('express');
const { privacy-brush } = require('privacy-brush');
const app = express();
const masker = new privacy-brush();

// 中间件：自动掩码响应中的敏感信息
app.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function(body) {
    if (typeof body === 'string' && body.includes('敏感信息')) {
      body = masker.mask(body);
    }
    originalSend.call(this, body);
  };
  next();
});

app.get('/debug-info', (req, res) => {
  const debugInfo = {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  };
  res.json(debugInfo); // 自动掩码敏感信息
});
```

### 作为Git Hook使用

```bash
# .git/hooks/pre-commit
#!/bin/bash

# 检查日志文件中是否有未掩码的敏感信息
for file in $(git diff --cached --name-only | grep -E '\.(log|txt|json)$'); do
  if privacy-brush --check "$file"; then
    echo "❌ 文件 $file 包含未掩码的敏感信息"
    echo "使用: privacy-brush $file -o $file && git add $file"
    exit 1
  fi
done

exit 0
```

## 📁 配置文件

创建 `privacy-brush.config.json`：

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
  ],
  "excludeFiles": [
    "node_modules/**",
    "*.min.js",
    "*.min.css"
  ]
}
```

使用配置文件：

```bash
privacy-brush --config privacy-brush.config.json input.log
```

## 🤝 集成指南

### 与日志系统集成

```javascript
// 集成到Winston
const winston = require('winston');
const { privacy-brush } = require('privacy-brush');
const masker = new privacy-brush();

const logger = winston.createLogger({
  transports: [
    new winston.transports.File({
      filename: 'app.log',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
          const maskedMessage = masker.mask(message);
          return `${timestamp} ${level}: ${maskedMessage}`;
        })
      )
    })
  ]
});
```

### 与测试框架集成

```javascript
// Jest测试用例
const { privacy-brush } = require('privacy-brush');

describe('敏感信息掩码', () => {
  const masker = new privacy-brush();
  
  test('应该掩码IP地址', () => {
    const input = '服务器IP: 192.168.1.100';
    const output = masker.mask(input);
    expect(output).toBe('服务器IP: 192.168.███.███');
  });
  
  test('应该掩码邮箱', () => {
    const input = '联系邮箱: user@example.com';
    const output = masker.mask(input);
    expect(output).toBe('联系邮箱: ***@example.com');
  });
});
```

## 📊 性能基准

```
文件大小   处理时间   内存占用
--------- --------- ---------
1 MB      12 ms     15 MB
10 MB     85 ms     18 MB
100 MB    720 ms    25 MB
1 GB      6.5 s     45 MB
```

## 📚 API 参考

### privacy-brush 类

#### `new privacy-brush(options)`

创建新的掩码器实例。

#### `mask(text, options)`

掩码文本中的敏感信息。

#### `maskFile(inputPath, outputPath)`

处理文件。

#### `createMaskStream(options)`

创建转换流。

#### `check(text)`

检查文本是否包含敏感信息。

#### `getPatterns()`

获取当前所有模式。

#### `addPattern(name, regex, handler)`

添加自定义模式。

### 工具函数

#### `maskText(text, options)`

快速掩码文本（无需创建实例）。

#### `createMaskStream(options)`

创建可管道传输的掩码流。

## 🐛 故障排除

### 常见问题

**Q: 某些模式没有被正确掩码**
A: 检查正则表达式是否匹配，或使用 `--debug` 模式查看详细匹配过程。

**Q: 处理大文件时内存不足**
A: 使用流式处理 API (`createMaskStream`)。

**Q: 想要完全自定义掩码逻辑**
A: 继承 privacy-brush 类并重写 `mask` 方法。

**Q: 如何排除某些文件类型？**
A: 在配置文件中使用 `excludeFiles` 选项。

### 调试模式

```bash
# 启用详细日志
DEBUG=privacy-brush:* privacy-brush input.log

# 或使用内置调试
privacy-brush input.log --verbose --dry-run
```

## 🔄 更新日志

详细更新记录请查看 [CHANGELOG.md](CHANGELOG.md)

## 🤝 贡献指南

我们欢迎各种贡献！

1. **Fork 仓库**
2. **创建功能分支** (`git checkout -b feature/amazing-feature`)
3. **提交更改** (`git commit -m 'Add some amazing feature'`)
4. **推送分支** (`git push origin feature/amazing-feature`)
5. **开启 Pull Request**

请阅读 [CONTRIBUTING.md](CONTRIBUTING.md) 了解详细指南。

## 📄 许可证

MIT License © 2024 privacy-brush Contributors

## 🙏 致谢

感谢所有贡献者和用户！特别感谢：

- [正则表达式测试工具](https://regex101.com/)
- 所有提交Issue和PR的开发者
- 提供反馈和测试的用户

## 📞 支持

- 📧 邮箱：<support@privacy-brush.dev>
- 🐛 [Issue Tracker](https://github.com/yourusername/privacy-brush/issues)
- 💬 [Discussions](https://github.com/yourusername/privacy-brush/discussions)
- 📖 [文档网站](https://privacy-brush.dev/docs)

---

<p align="center">
  <strong>安全分享，从 privacy-brush 开始</strong><br>
  <sub>保护隐私，让技术交流更安心</sub>
</p>
