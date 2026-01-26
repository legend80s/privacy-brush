// 流式处理

import { strict as assert } from "node:assert"
import { execSync, spawnSync } from "node:child_process"
import { test } from "node:test"

test("❯ echo | node src/cli.mjs", async () => {
  const text = "Microsoft Windows [Version 10.0.12345.6785]"

  // `echo "${text}"` will print text + newline to stdout
  // `echo -n "${text}"` will print -n and text + newline to stdout
  // So we use spawn with args [`-n`, text] to avoid the extra newline
  function pipeCommands() {
    const node = spawnSync("node", ["src/cli.mjs"], {
      input: text,
    })

    return node.stdout.toString("utf8")
  }

  const actual = pipeCommands()

  const expected = "Microsoft Windows [Version 10.█.█████.████]"
  assert.strictEqual(actual, expected)
})

test("--mask", async () => {
  const actual = execSync(
    'echo Microsoft Windows [Version 10.0.12345.6785] | node src/cli.mjs --mask "🔒" --no-preserve-first',
  ).toString("utf8").trim()

  // console.log(`actual:|${actual}|`)

  const expected =
    "Microsoft Windows [Version 🔒🔒.🔒.🔒🔒🔒🔒🔒.🔒🔒🔒🔒]"
  assert.strictEqual(actual, expected)
})

test("--input-file outputs masked file content", async () => {
  const { execSync } = await import("node:child_process")

  const inputPath = "test/fixtures/terminal_log.md"

  const actual = execSync(
    `node src/cli.mjs --input-file ${inputPath}`,
  ).toString("utf8")

  // compute expected via masker.maskFile and normalize EOLs
  const expected = `# h1

## flutter devices

❯ flutter devices
Flutter assets will be downloaded from <https://storage.flutter-io.cn>. Make sure you trust this source!
Found 4 connected devices:
  sdk gphone64 x86 64 (mobile) • emulator-5554 • android-x64    • Android 16 (API 36) (emulator)
  Windows (desktop)            • windows       • windows-x64    • Microsoft Windows [版本 10.█.█████.████]
  Chrome (web)                 • chrome        • web-javascript • Google Chrome 144.█.████.██
  Edge (web)                   • edge          • web-javascript • Microsoft Edge 144.█.████.██

Run "flutter emulators" to list and start any available device emulators.

If you expected another device to be detected, please run "flutter doctor" to diagnose potential issues. You may also try
increasing the time to wait for connected devices with the "--device-timeout" flag. Visit <https://flutter.dev/setup/> for
troubleshooting tips.

## log

DEBUG: User login from IP 192.███.█.███
DEBUG: Session ID: abc123def456
DEBUG: Browser: Chrome/144.0.1234.60
DEBUG: OS: Windows 10.0.12345
`

  assert.strictEqual(actual, expected)
})

test(`custom patterns`, () => {
  const input = `DEEPSEEK_API_KEY=sk-af75149812524eb08eb302bf9604c8e8`

  const actual = execSync(
    `echo ${input} | node src/cli.mjs --pattern '/sk-([a-z0-9]{20,})/'`,
  ).toString("utf8").trim()

  const expected = "DEEPSEEK_API_KEY=sk-████████████████████████████████"
  assert.strictEqual(actual, expected)
})

test(`custom patterns`, () => {
  const input = `DEEPSEEK_API_KEY=sk-af75149812524eb08eb302bf9604c8e8`

  const actual = execSync(
    `echo ${input} | node src/cli.mjs --pattern '/sk-[a-z0-9]{20,}/'`,
  ).toString("utf8").trim()

  const expected = "DEEPSEEK_API_KEY=███████████████████████████████████"
  assert.strictEqual(actual, expected)
})

test(`custom patterns`, () => {
  const input = `DEEPSEEK_API_KEY=sk-af75149812524eb08eb302bf9604c8e8`

  const actual = execSync(
    `echo ${input} | node src/cli.mjs --pattern '/([0-9]{2,})/'`,
  ).toString("utf8").trim()

  const expected = "DEEPSEEK_API_KEY=sk-af███████████eb██eb███bf████c8e8"
  assert.strictEqual(actual, expected)
})

/**
 * 将两个或多个命令通过管道连接起来执行，并返回最后一个命令的输出结果
 * @param {string} cmdStrWithPipes
 * @returns {string}
 */
function pipeCommands(cmdStrWithPipes) {
  // const echo = spawnSync("echo", ["-n", text])
  // const node = spawnSync("node", ["src/cli.mjs"], {
  //   input: echo.stdout,
  // })
  // 以下代码是以上代码的泛化版本
  const commands = cmdStrWithPipes
    .split("|")
    .map(cmd => cmd.trim())
    .filter(Boolean)

  if (commands.length < 2) {
    throw new Error("At least two commands are required for piping.")
  }

  const [first, ...restCommand] = commands
  const [cmdName, args] = splitCmdAndArgs(first)

  const lastCommand = restCommand.reduce(
    (prevProcess, cmdStr) => {
      const [cmd, args] = splitCmdAndArgs(cmdStr)

      const currentProcess = spawnSync(cmd, args, {
        input: prevProcess.stdout,
      })

      return currentProcess
    },
    spawnSync(cmdName, args),
  )

  return lastCommand.stdout.toString("utf8")
}

/**
 *
 * @param {string} cmd
 * @returns {[cmdName: string, args: string[]]}
 */
function splitCmdAndArgs(cmd) {
  const [cmdName, ...args] = cmd.split(" ").filter(Boolean)
  // console.log(`cmdName:|${cmdName}|`)
  // console.log("args:", args)
  return [cmdName, args]
}
