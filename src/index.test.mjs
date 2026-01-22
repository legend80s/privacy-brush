import { ProductionTerminalMasker } from "../";

// 使用示例
const masker = new ProductionTerminalMasker({
	maskChar: "█",
	preserveFirstPart: true,
});

// 处理终端输出
const terminalOutput = `❯ flutter devices
Flutter assets will be downloaded from https://storage.flutter-io.cn. Make sure you trust this source!
Found 4 connected devices:
  sdk gphone64 x86 64 (mobile) • emulator-5554 • android-x64    • Android 16 (API 36) (emulator)
  Windows (desktop)            • windows       • windows-x64    • Microsoft Windows [版本 10.0.19045.6456]
  Chrome (web)                 • chrome        • web-javascript • Google Chrome 144.0.7559.60
  Edge (web)                   • edge          • web-javascript • Microsoft Edge 144.0.3719.82

Run "flutter emulators" to list and start any available device emulators.

If you expected another device to be detected, please run "flutter doctor" to diagnose potential issues. You may also try
increasing the time to wait for connected devices with the "--device-timeout" flag. Visit https://flutter.dev/setup/ for 
troubleshooting tips.
`;

const safeOutput = masker.maskText(terminalOutput);

console.log("safeOutput:", safeOutput);

// // 处理日志文件
// masker.maskFile('terminal_log.txt', 'masked_log.txt');

// // 流式处理
// const readline = require('readline');
// const rl = readline.createInterface({
//   input: process.stdin,
//   output: masker.createMaskStream()
// });

// rl.pipe(process.stdout);
