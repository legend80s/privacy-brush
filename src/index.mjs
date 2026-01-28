/** @import { IConfig, IPattern, IPatternName } from "./type.js" */

import { createRequire } from "node:module"
import { defaultConfig } from "./lib/config.mjs"
import { verbose } from "./lib/parse-args.mjs"

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

      // user name `/Users/test/code/` => `/Users/████/code/`
      {
        /** @type {IPatternName} */
        name: "user_name_in_path",
        regex: /\/Users\/([^\/]+)\//g,
        /**
         * Handle user name in file path masking.
         * @param {string} match
         * @param {string} userName
         * @returns {string}
         */
        replacer: (match, userName) => {
          return match.replace(userName, this.maskChar.repeat(userName.length))
        },
      },

      // uuid
      {
        name: "uuid",
        regex:
          /\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\b/g,
        /**
         * Handle UUID masking.
         * @param {string} match
         * @returns {string}
         */
        replacer: match => {
          return this.maskUUID(match)
        },
      },
    ]

    return allPatterns
  }

  /**
   * Parse custom pattern inputs into maskable patterns.
   * Accepts strings like '/sk-[a-z0-9]{20,}/i' or raw pattern bodies.
   * @returns {IPattern[]}
   */
  get customSensitivePatterns() {
    const customPatterns = this.config.customPatterns || []

    /**
     * Parse string pattern to RegExp.
     * @param {string | RegExp} pattern
     * @returns {RegExp} returns Parsed RegExp with global flag
     * @example
     * '/\\d{1,}/' => /\d{1,}/g
     */
    const parse = pattern => {
      if (pattern instanceof RegExp) {
        // always replace globally
        const flags = pattern.flags.includes("g")
          ? pattern.flags
          : `${pattern.flags}g`

        return new RegExp(pattern.source, flags)
      }

      const patternStr = pattern.trim()
      // `/\d{1,}/g`.match(/^\/(.*)\/(\w*)$/) => [/\d{1,}/g, '\d{1,}', 'g']
      const matches = patternStr.match(/^\/(.*)\/(\w*)$/)

      if (matches) {
        const body = matches[1]
        let flags = matches[2] ?? ""

        if (!flags.includes("g")) flags += "g"

        return new RegExp(body, flags)
      }

      // treat as literal body
      return new RegExp(patternStr, "g")
    }

    return customPatterns.map((pattern, i) => {
      const regex = parse(pattern)
      return {
        name: `custom_${i + 1}`,
        regex,
        replacer: (match, group) => {
          // const groups = rest.slice(0, -2) // last two are offset and input string
          verbose && console.log("custom pattern match:", { match, group })

          if (typeof group === "string") {
            return match.replace(group, this.maskChar.repeat(group.length))
          }

          return this.maskChar.repeat(match.length)
        },
      }
    })
  }

  get maskChar() {
    return this.config.maskChar ?? defaultConfig.maskChar
  }

  /**
   *
   * @returns {IPattern[]}
   */
  get sensitivePatterns() {
    const base = this.defaultSensitivePatterns.filter(({ name }) =>
      this.config.maskPatternNames?.includes(name),
    )

    const customSensitivePatterns = this.customSensitivePatterns
    verbose &&
      console.log(
        "🚀 ~ PrivacyBrush ~ sensitivePatterns ~ customSensitivePatterns:",
        customSensitivePatterns,
      )

    return base.concat(customSensitivePatterns)
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
    verbose && console.log(`[PrivacyBrush] Masking text: |${text}|`)

    let result = text

    this.sensitivePatterns.forEach(pattern => {
      verbose && console.log("pattern:", pattern)
      result = result.replace(pattern.regex, pattern.replacer)
    })

    return result
  }

  /**
   * 批量处理文件
   * @param {string} inputPath
   * @param {string} [outputPath]
   * @returns
   */
  maskFile(inputPath, outputPath) {
    try {
      // Delay-load fs to avoid startup cost when this method is not used
      const require = createRequire(import.meta.url)
      const fs = require("node:fs")

      const content = fs.readFileSync(inputPath, "utf8")
      const maskedContent = this.maskText(content)

      if (outputPath) {
        fs.writeFileSync(outputPath, maskedContent, "utf8")
        verbose && console.log(`Masked file saved to: ${outputPath}`)
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

  /**
   * mask uuid by version
   * - version 4: 6ba7b810-xxxx-4xxx-xxxx-xxxxxxxxxxxx
   * - other versions: xxxxxxxx-xxxx-vxxx-xxxx-xxxxxxxxxxxx (v is 1-5)
   * @param {string} uuid
   * @returns
   */
  maskUUID(uuid) {
    return uuid.replace(
      /\b([0-9a-fA-F]{8})-([0-9a-fA-F]{4})-([1-5])([0-9a-fA-F]{3})-([0-9a-fA-F]{4})-([0-9a-fA-F]{12})\b/g,
      (match, p1, p2, p3, p4, p5, p6) => {
        /** @type {(target: string) => string} */
        const mask = target => this.maskChar.repeat(target.length)

        const maskedP2 = mask(p2)
        const maskedP4 = mask(p4)
        const maskedP5 = mask(p5)
        const maskedP6 = mask(p6)

        if (p3 === "4") {
          return `${p1}-${maskedP2}-4${maskedP4}-${maskedP5}-${maskedP6}`
        }

        const maskedP1 = mask(p1)

        return `${maskedP1}-${maskedP2}-${p3}${maskedP4}-${maskedP5}-${maskedP6}`
      },
    )
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
