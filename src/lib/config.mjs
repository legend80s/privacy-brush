/**
 * @satisfies {import('../type.js').IConfig}
 */
export const defaultConfig = {
  maskChar: "█",
  preserveFirstPart: true, // 是否保留版本号的第一部分
  maskPatternNames: [
    "windows_version",
    "browser_version",
    "ip_address",
    "mac_address",
    "user_name_in_path",
    "uuid",
  ],
  customPatterns: [],
}
