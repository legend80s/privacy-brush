export class ProductionTerminalMasker {
  constructor(config = {}) {
    this.config = {
      maskChar: "█",
      preserveFirstPart: true, // 是否保留版本号的第一部分
      ...config,
    }

    this.sensitivePatterns = this.buildPatterns()
  }

  get maskChar() {
    return this.config.maskChar
  }

  buildPatterns() {
    return [
      // 操作系统版本 (Windows 10.0.19045.6456)
      {
        name: "windows_version",
        regex: /(\[版本\s+)(\d+\.\d+\.\d+\.\d+)(\])/,
        handler: (match, prefix, version, suffix) => {
          return prefix + this.maskVersion(version) + suffix
        },
      },

      // 浏览器版本 (Chrome 144.0.7559.60)
      {
        name: "browser_version",
        regex: /(Chrome|Edge)\s+(\d+\.\d+\.\d+\.\d+)/gi,
        handler: (match, browser, version) => {
          return `${browser} ${this.maskVersion(version)}`
        },
      },

      // API 版本 (API 36)
      {
        name: "api_version",
        regex: /(API\s+)(\d+)/gi,
        handler: (match, prefix, version) => {
          return prefix + this.maskChar.repeat(version.length)
        },
      },

      // Android 版本
      {
        name: "android_version",
        regex: /(Android\s+)(\d+)/gi,
        handler: (match, prefix, version) => {
          return prefix + this.maskChar.repeat(version.length)
        },
      },

      // 端口号 (emulator-5554)
      {
        name: "port_number",
        regex: /(emulator-)(\d{4})/,
        handler: (match, prefix, port) => {
          return prefix + this.maskChar.repeat(port.length)
        },
      },

      // IP地址
      {
        name: "ip_address",
        regex: /\b(\d{1,3}\.){3}\d{1,3}\b/g,
        handler: match => {
          const parts = match.split(".")
          return parts
            .map((part, index) =>
              index < 2 ? part : this.maskChar.repeat(part.length),
            )
            .join(".")
        },
      },
    ]
  }

  maskVersion(version) {
    const parts = version.split(".")

    if (!this.config.preserveFirstPart) {
      return parts.map(part => this.maskChar.repeat(part.length)).join(".")
    }

    return parts
      .map((part, index) => {
        return index === 0 ? part : this.maskChar.repeat(part.length)
      })
      .join(".")
  }

  /**
   *
   * @param {string} text
   * @returns
   */
  maskText(text) {
    let result = text

    this.sensitivePatterns.forEach(pattern => {
      result = result.replace(pattern.regex, pattern.handler)
    })

    return result
  }

  /**
   * 批量处理文件
   * @param {string} inputPath
   * @param {string} outputPath
   * @returns
   */
  maskFile(inputPath, outputPath) {
    try {
      const fs = require("fs")

      const content = fs.readFileSync(inputPath, "utf8")
      const maskedContent = this.maskText(content)

      if (outputPath) {
        fs.writeFileSync(outputPath, maskedContent, "utf8")
        console.log(`Masked file saved to: ${outputPath}`)
      }

      return maskedContent
    } catch (error) {
      console.error("Error processing file:", error.message)
      throw error
    }
  }

  // 实时流处理
  createMaskStream() {
    const { Transform } = require("stream")

    return new Transform({
      transform: (chunk, encoding, callback) => {
        const text = chunk.toString()
        const masked = this.maskText(text)
        callback(null, masked)
      },
    })
  }
}
