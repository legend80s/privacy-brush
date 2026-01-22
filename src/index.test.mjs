import { strict as assert } from "node:assert"
import { test } from "node:test"
import { ProductionTerminalMasker } from "./index.mjs"

const WINDOWS_VERSION_SAMPLE = "10.0.12345.6785"
const GOOGLE_BROWSER_VERSION_SAMPLE = "144.0.1234.56"
const EDGE_BROWSER_VERSION_SAMPLE = "144.0.3421.12"

test("default configurations", () => {
  // 使用示例
  const masker = new ProductionTerminalMasker()

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
  const masker = new ProductionTerminalMasker({
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
  const masker = new ProductionTerminalMasker({
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

// // 处理日志文件
// masker.maskFile('terminal_log.txt', 'masked_log.txt');
