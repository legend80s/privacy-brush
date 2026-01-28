// @ts-check
import { verbose } from "./parse-args.mjs"

/**
 *
 * @param {Buffer} chunk
 * @returns {string}
 * @example
 * ❯ getmac -v | node src/cli.mjs # should decode gbk
 * ❯ ipconfig -all | node src/cli.mjs # should decode gbk
 */
export function tryDecode(chunk) {
  const utf8 = chunk.toString("utf8")

  if (!isLikelyGibberish(utf8)) {
    return utf8
  }

  const decoder = new TextDecoder("gbk")

  verbose &&
    console.log("[transform] isLikelyGibberish try decoding with `gbk`")

  const result = decoder.decode(chunk)

  if (!isLikelyGibberish(result)) {
    return result
  }

  verbose && console.log("[transform] still gibberish, using utf8")

  return utf8
}

/**
 * 检查是否是乱码
 * @param {string} text
 * @returns {boolean}
 */
function isLikelyGibberish(text) {
  // Windows 命令行常见乱码模式
  const patterns = [
    /�/g, // Unicode 替换字符
    // /涓/g, // 常见 UTF-8 转 GBK 乱码
    // /嶏/g, // 常见乱码字符
    // /[À-Å]/g, // 带重音的大写字母
    // /[È-Ë]/g, // 更多重音字母
    // /[Ì-Ï]/g,
    // /å/g,
    // /ä/g,
    // /ö/g, // 北欧字符
  ]

  return patterns.some(pattern => pattern.test(text))
}
