import { strict as assert } from "node:assert"
import { test } from "node:test"
import { PrivacyBrush } from "./index.mjs"

const WINDOWS_VERSION_SAMPLE = "10.0.12345.6785"
const GOOGLE_BROWSER_VERSION_SAMPLE = "144.0.1234.56"
const EDGE_BROWSER_VERSION_SAMPLE = "144.0.3421.12"

test("default configurations", () => {
  // 使用示例
  const masker = new PrivacyBrush()

  // 处理终端输出
  const terminalOutput = `❯ flutter devices
Flutter assets will be downloaded from https://storage.flutter-io.cn. Make sure you trust this source!
Found 4 connected devices:
  sdk gphone64 x86 64 (mobile) • emulator-5554 • android-x64    • Android 16 (API 36) (emulator)
  Windows (desktop)            • windows       • windows-x64    • Microsoft Windows [版本 ${WINDOWS_VERSION_SAMPLE}]
  Chrome (web)                 • chrome        • web-javascript • Google Chrome ${GOOGLE_BROWSER_VERSION_SAMPLE}
  Edge (web)                   • edge          • web-javascript • Microsoft Edge ${EDGE_BROWSER_VERSION_SAMPLE}

Run "flutter emulators" to list and start any available device emulators.

If you expected another device to be detected, please run "flutter doctor" to diagnose potential issues. You may also try
increasing the time to wait for connected devices with the "--device-timeout" flag. Visit https://flutter.dev/setup/ for
troubleshooting tips.
`

  const safeOutput = masker.maskText(terminalOutput)

  // console.log("safeOutput:", safeOutput)

  const expectedOutput = `❯ flutter devices
Flutter assets will be downloaded from https://storage.flutter-io.cn. Make sure you trust this source!
Found 4 connected devices:
  sdk gphone64 x86 64 (mobile) • emulator-5554 • android-x64    • Android 16 (API 36) (emulator)
  Windows (desktop)            • windows       • windows-x64    • Microsoft Windows [版本 10.█.█████.████]
  Chrome (web)                 • chrome        • web-javascript • Google Chrome 144.█.████.██
  Edge (web)                   • edge          • web-javascript • Microsoft Edge 144.█.████.██

Run "flutter emulators" to list and start any available device emulators.

If you expected another device to be detected, please run "flutter doctor" to diagnose potential issues. You may also try
increasing the time to wait for connected devices with the "--device-timeout" flag. Visit https://flutter.dev/setup/ for
troubleshooting tips.
`

  assert.strictEqual(safeOutput, expectedOutput)
})

test("use custom maskChar and not preserveFirstPart", () => {
  // 使用示例
  const masker = new PrivacyBrush({
    maskChar: "░",
    preserveFirstPart: false,
  })

  // 处理终端输出
  const terminalOutput = `❯ flutter devices
Flutter assets will be downloaded from https://storage.flutter-io.cn. Make sure you trust this source!
Found 4 connected devices:
  sdk gphone64 x86 64 (mobile) • emulator-5554 • android-x64    • Android 16 (API 36) (emulator)
  Windows (desktop)            • windows       • windows-x64    • Microsoft Windows [版本 ${WINDOWS_VERSION_SAMPLE}]
  Chrome (web)                 • chrome        • web-javascript • Google Chrome ${GOOGLE_BROWSER_VERSION_SAMPLE}
  Edge (web)                   • edge          • web-javascript • Microsoft Edge ${EDGE_BROWSER_VERSION_SAMPLE}

Run "flutter emulators" to list and start any available device emulators.

If you expected another device to be detected, please run "flutter doctor" to diagnose potential issues. You may also try
increasing the time to wait for connected devices with the "--device-timeout" flag. Visit https://flutter.dev/setup/ for
troubleshooting tips.
`

  const safeOutput = masker.maskText(terminalOutput)

  // console.log("safeOutput2:", safeOutput)

  const expectedOutput = `❯ flutter devices
Flutter assets will be downloaded from https://storage.flutter-io.cn. Make sure you trust this source!
Found 4 connected devices:
  sdk gphone64 x86 64 (mobile) • emulator-5554 • android-x64    • Android 16 (API 36) (emulator)
  Windows (desktop)            • windows       • windows-x64    • Microsoft Windows [版本 ░░.░.░░░░░.░░░░]
  Chrome (web)                 • chrome        • web-javascript • Google Chrome ░░░.░.░░░░.░░
  Edge (web)                   • edge          • web-javascript • Microsoft Edge ░░░.░.░░░░.░░

Run "flutter emulators" to list and start any available device emulators.

If you expected another device to be detected, please run "flutter doctor" to diagnose potential issues. You may also try
increasing the time to wait for connected devices with the "--device-timeout" flag. Visit https://flutter.dev/setup/ for
troubleshooting tips.
`

  assert.strictEqual(safeOutput, expectedOutput)
})

test("only mask browser_version", () => {
  // 使用示例
  const masker = new PrivacyBrush({
    maskPatternNames: ["browser_version"],
  })

  // 处理终端输出
  const terminalOutput = `❯ flutter devices
Flutter assets will be downloaded from https://storage.flutter-io.cn. Make sure you trust this source!
Found 4 connected devices:
  sdk gphone64 x86 64 (mobile) • emulator-5554 • android-x64    • Android 16 (API 36) (emulator)
  Windows (desktop)            • windows       • windows-x64    • Microsoft Windows [版本 ${WINDOWS_VERSION_SAMPLE}]
  Chrome (web)                 • chrome        • web-javascript • Google Chrome ${GOOGLE_BROWSER_VERSION_SAMPLE}
  Edge (web)                   • edge          • web-javascript • Microsoft Edge ${EDGE_BROWSER_VERSION_SAMPLE}

Run "flutter emulators" to list and start any available device emulators.

If you expected another device to be detected, please run "flutter doctor" to diagnose potential issues. You may also try
increasing the time to wait for connected devices with the "--device-timeout" flag. Visit https://flutter.dev/setup/ for
troubleshooting tips.
`

  const safeOutput = masker.maskText(terminalOutput)

  // console.log("safeOutput3:", safeOutput)

  const expectedOutput = `❯ flutter devices
Flutter assets will be downloaded from https://storage.flutter-io.cn. Make sure you trust this source!
Found 4 connected devices:
  sdk gphone64 x86 64 (mobile) • emulator-5554 • android-x64    • Android 16 (API 36) (emulator)
  Windows (desktop)            • windows       • windows-x64    • Microsoft Windows [版本 ${WINDOWS_VERSION_SAMPLE}]
  Chrome (web)                 • chrome        • web-javascript • Google Chrome 144.█.████.██
  Edge (web)                   • edge          • web-javascript • Microsoft Edge 144.█.████.██

Run "flutter emulators" to list and start any available device emulators.

If you expected another device to be detected, please run "flutter doctor" to diagnose potential issues. You may also try
increasing the time to wait for connected devices with the "--device-timeout" flag. Visit https://flutter.dev/setup/ for
troubleshooting tips.
`

  assert.strictEqual(safeOutput, expectedOutput)
})

test("mask username in path", () => {
  // 使用示例
  const masker = new PrivacyBrush()

  // 处理终端输出
  const input = `/c/Users/legend80s/AppData/  /Users/test/code/`

  const safeOutput = masker.maskText(input)

  // console.log("safeOutput3:", safeOutput)

  const expectedOutput = `/c/Users/█████████/AppData/  /Users/████/code/`

  assert.strictEqual(safeOutput, expectedOutput)
})

test("mask IP", () => {
  // 使用示例
  const masker = new PrivacyBrush()

  // 处理终端输出
  const terminalOutput = `Windows [Version 10.0.12345.1234]
Chrome 144.0.1234.12
User IP: 10.12.123.12`

  const safeOutput = masker.maskText(terminalOutput)

  // console.log("safeOutput3:", safeOutput)

  const expectedOutput = `Windows [Version 10.█.█████.████]
Chrome 144.█.████.██
User IP: 10.██.███.██`

  assert.strictEqual(safeOutput, expectedOutput)
})

test("mask uuid", () => {
  // 使用示例
  const masker = new PrivacyBrush()

  // 处理终端输出
  const terminalOutput = `
UUID v1: 11111111-1111-1111-8111-111111111111
UUID v2: 22222222-2222-2222-8222-222222222222
UUID v3: 33333333-3333-3333-8333-333333333333
UUID v4: 44444444-4444-4444-8444-444444444444
UUID v5: 55555555-5555-5555-8555-555555555555
`

  const safeOutput = masker.maskText(terminalOutput)

  // console.log("safeOutput3:", safeOutput)

  const expectedOutput = `
UUID v1: ████████-████-1███-████-████████████
UUID v2: ████████-████-2███-████-████████████
UUID v3: ████████-████-3███-████-████████████
UUID v4: 44444444-████-4███-████-████████████
UUID v5: ████████-████-5███-████-████████████
`

  assert.strictEqual(safeOutput, expectedOutput)
})

test("mask mac address", () => {
  // 使用示例
  const masker = new PrivacyBrush()

  // 处理终端输出
  const input = `
CA:FE:BA:BE:12:34  # "Cafe Babe"
DE:AD:BE:EF:CA:FE  # "Dead Beef Cafe"
BA:DC:0F:FE:E0:0D  # "Bad Coffee Feed"

CA-FE-BA-BE-12-34  # "Cafe Babe"
DE-AD-BE-EF-CA-FE  # "Dead Beef Cafe"
BA-DC-0F-FE-E0-0D  # "Bad Coffee Feed"
`

  const safeOutput = masker.maskText(input)

  // console.log("safeOutput3:", safeOutput)

  const expectedOutput = `
██:██:██:██:██:██  # "Cafe Babe"
██:██:██:██:██:██  # "Dead Beef Cafe"
██:██:██:██:██:██  # "Bad Coffee Feed"

██-██-██-██-██-██  # "Cafe Babe"
██-██-██-██-██-██  # "Dead Beef Cafe"
██-██-██-██-██-██  # "Bad Coffee Feed"
`

  assert.strictEqual(safeOutput, expectedOutput)
})
