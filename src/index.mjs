/** @import { IConfig, IPattern, IPatternName } from "./type.js" */

import { defaultConfig } from "./lib/config.mjs"

export class PrivacyBrush {
  /**
   * @param {IConfig} [config]
   */
  constructor(config) {
    this.config = {
      ...defaultConfig,
      ...config,
    }
  }

  get defaultSensitivePatterns() {
    /** @type {IPattern[]} */
    const allPatterns = [
      // 操作系统版本 (Windows 10.0.19045.6456)
      {
        /** @type {IPatternName} */
        name: "windows_version",
        // match both Chinese "版本" and English "Version"
        regex: /(\[(?:版本|Version)\s+)(\d+\.\d+\.\d+\.\d+)(\])/i,
        /**
         * Handle windows version masking.
         * @param {string} match
         * @param {string} prefix
         * @param {string} version
         * @param {string} suffix
         * @returns {string}
         */
        replacer: (match, prefix, version, suffix) => {
          return prefix + this.maskVersion(version) + suffix
        },
      },

      // 浏览器版本 (Chrome 144.0.7559.60)
      {
        /** @type {IPatternName} */
        name: "browser_version",
        regex: /(Chrome|Edge)\s+(\d+\.\d+\.\d+\.\d+)/gi,
        /**
         * Handle browser version masking.
         * @param {string} match
         * @param {string} browser
         * @param {string} version
         * @returns {string}
         */
        replacer: (match, browser, version) => {
          return `${browser} ${this.maskVersion(version)}`
        },
      },

      // IP地址
      {
        /** @type {IPatternName} */
        name: "ip_address",
        regex: /\b(\d{1,3}\.){3}\d{1,3}\b/g,
        /**
         * Handle IP address masking.
         * @param {string} match
         * @returns {string}
         */
        replacer: match => {
          return this.maskVersion(match)
        },
      },
    ]

    return allPatterns
  }

  get maskChar() {
    return this.config.maskChar ?? defaultConfig.maskChar
  }

  /**
   *
   * @returns {IPattern[]}
   */
  get sensitivePatterns() {
    return this.defaultSensitivePatterns.filter(({ name }) =>
      this.config.maskPatternNames?.includes(name),
    )
  }

  /**
   * Mask a version string.
   * @param {string} version
   * @returns {string}
   */
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
      result = result.replace(pattern.regex, pattern.replacer)
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
      const fs = require("node:fs")

      const content = fs.readFileSync(inputPath, "utf8")
      const maskedContent = this.maskText(content)

      if (outputPath) {
        fs.writeFileSync(outputPath, maskedContent, "utf8")
        console.log(`Masked file saved to: ${outputPath}`)
      }

      return maskedContent
    } catch (error) {
      console.error(
        "Error processing file:",
        error instanceof Error ? error.message : String(error),
      )
      throw error
    }
  }

  // 实时流处理
  async createMaskStream() {
    const { Transform } = await import("node:stream")

    return new Transform({
      transform: (chunk, encoding, callback) => {
        const text = String(chunk)
        const masked = this.maskText(text)
        callback(null, masked)
      },
    })
  }
}
