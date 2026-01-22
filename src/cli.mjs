import { ProductionTerminalMasker } from "./index.mjs"

// 流式处理：将 stdin 通过 masker 的 Transform 流处理后输出到 stdout
// Usage: some_command | node src/cli.mjs
// Example 1: echo "password" | node src/cli.mjs
// Example 2: flutter devices | node src/cli.mjs
// Example 3： ❯ echo 'Microsoft Windows [版本 10.0.12345.6785]' | node src/cli.mjs
// => Microsoft Windows [版本 10.█.█████.████]
const masker = new ProductionTerminalMasker()
const maskStream = await masker.createMaskStream()

process.stdin.pipe(maskStream).pipe(process.stdout)
