import { ProductionTerminalMasker } from "./index.mjs"

// 流式处理：将 stdin 通过 masker 的 Transform 流处理后输出到 stdout
// Usage: some_command | node src/cli.mjs
// Example 1: echo "password" | node src/cli.mjs
// Example 2: flutter devices | node src/cli.mjs
// Example 3: ❯ echo 'Microsoft Windows [版本 10.0.12345.6785]' | node src/cli.mjs
// => Microsoft Windows [版本 10.█.█████.████]
// Example 4: ❯ node src/cli.mjs
// Input: Microsoft Windows [版本 10.0.12345.6785]
// Output: Microsoft Windows [版本 10.█.█████.████]
const masker = new ProductionTerminalMasker()
const maskStream = await masker.createMaskStream()

// 检查 stdin 是否连接到管道（有数据输入）
const isPipedInput = !process.stdin.isTTY

// 如果不是管道输入（交互模式），才显示提示
if (!isPipedInput) {
  process.stdout.write("Input (Press Ctrl+C to exit...):\n")
}

// 处理所有数据
process.stdin.pipe(maskStream).pipe(process.stdout)
