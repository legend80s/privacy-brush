export type IConfig = {
  maskChar?: string
  preserveFirstPart?: boolean
  maskPatternNames?: IPatternName[]
}

export type IPatternName =
  | "windows_version"
  | "browser_version"
  | "android_version"
  | "ip_address"

export type IPattern = {
  name: IPatternName
  regex: RegExp
  replacer: (substring: string, ...args: any[]) => string
}
