import { parseArgs } from "node:util"
import { PrivacyBrush } from "./index.mjs"

// 流式处理：将 stdin 通过 masker 的 Transform 流处理后输出到 stdout
// Usage: some_command | node src/cli.mjs
// Example 1: echo "password" | node src/cli.mjs
// Example 2: flutter devices | node src/cli.mjs
// Example 3: ❯ echo 'Microsoft Windows [版本 10.0.12345.6785]' | node src/cli.mjs
// => Microsoft Windows [版本 10.█.█████.████]
// Example 4: ❯ node src/cli.mjs
// Input: Microsoft Windows [版本 10.0.12345.6785]
// Output: Microsoft Windows [版本 10.█.█████.████]

// get config from command line arguments use native `parseArgs`
// node src/cli.mjs --maskChar X --preserveFirstPart false
const args = process.argv.slice(2)
// console.log("args:", args) // args: [ '--maskChar', 'X', '--preserveFirstPart', 'false' ]

const verbose = args.includes('--verbose')

const [err, result] = safeCall(() =>
  parseArgs({
    allowPositionals: true,
    allowNegative: true,

    args,

    options: {
      maskChar: {
        type: "string",
        short: "m",
        default: "█",
      },
      preserveFirstPart: {
        type: "boolean",
        short: "p",
        default: true,
      },
      // help
      help: {
        type: "boolean",
        short: "h",
      },
      // verbose
      verbose: {
        type: "boolean",
      },
    },
  }),
)

await main()

async function main() {
  if (err) {
    console.error(verbose ? err : String(err))
    console.error()
    printHelp()

    process.exit(1)
  }

  const { values } = result

  if (values.help) {
    printHelp()
    process.exit(0)
  }

  // console.log("values:", values)
  // console.log("positionals:", positionals)

  const config = values

  const masker = new PrivacyBrush(config)
  const maskStream = await masker.createMaskStream()

  // 检查 stdin 是否连接到管道（有数据输入）
  const isPipedInput = !process.stdin.isTTY

  // 如果不是管道输入（交互模式），才显示提示
  if (!isPipedInput) {
    process.stdout.write("Input (Press Ctrl+C to exit...):\n")
  }

  // 处理所有数据
  process.stdin.pipe(maskStream).pipe(process.stdout)
}
/**
 *
 * @param {(...args: any[]) => any} fn
 * @returns
 */
function safeCall(fn) {
  try {
    const result = fn()
    return [null, result]
  } catch (error) {
    return [error, null]
  }
}

function printHelp() {
  console.log(`Usage: node src/cli.mjs [options]

Options:
  --maskChar, -m            Character to use for masking (default: "█")
  --preserveFirstPart, -p   Whether to preserve the first part of version numbers (default: true, \`--no-preserveFirstPart\` to false)
  --help, -h                Show this help message (default: false)
  --verbose                 Enable verbose output (default: false)
`)
}
