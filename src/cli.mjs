import { PrivacyBrush } from "./index.mjs"
import { parsedResult, verbose } from "./lib/parse-args.mjs"

// 流式处理：将 stdin 通过 masker 的 Transform 流处理后输出到 stdout
// Usage: some_command | node src/cli.mjs
// Example 1: echo "password" | node src/cli.mjs
// Example 2: flutter devices | node src/cli.mjs
// Example 3: ❯ echo 'Microsoft Windows [版本 10.0.12345.6785]' | node src/cli.mjs
// => Microsoft Windows [版本 10.█.█████.████]
// Example 4: ❯ node src/cli.mjs
// Input: Microsoft Windows [版本 10.0.12345.6785]
// Output: Microsoft Windows [版本 10.█.█████.████]

await main()

async function main() {
  const [err, result] = parsedResult

  if (err) {
    console.error(verbose ? err : String(err))
    console.error()
    await printHelp()

    process.exit(1)
    return
  }

  const { values } = result

  if (values.help) {
    await printHelp()
    return
  }

  if (values.version) {
    await printVersion()
    return
  }

  // console.log("values:", values)
  // console.log("positionals:", positionals)

  const config = values

  const masker = new PrivacyBrush({
    maskChar: config.mask,
    preserveFirstPart: config["preserve-first"],
  })

  // If an input file is provided, process it. If --output-file is provided write there, otherwise print to stdout.
  if (config["input-file"]) {
    try {
      if (config["output-file"]) {
        // maskFile will write to the output path
        masker.maskFile(config["input-file"], config["output-file"])
        return
      }

      const masked = masker.maskFile(config["input-file"])

      process.stdout.write(masked)
      return
    } catch {
      process.exitCode = 1
      return
    }
  }

  // If an output file was requested for piped or interactive stdin, collect all input, mask and write to file.
  if (config["output-file"]) {
    try {
      const chunks = []
      for await (const chunk of process.stdin) {
        chunks.push(String(chunk))
      }

      const inputText = chunks.join("")
      console.log(`inputText: |${inputText}|`)
      const masked = masker.maskText(inputText)

      const fs = await import("node:fs/promises")
      await fs.writeFile(config["output-file"], masked, "utf8")
      return
    } catch (error) {
      console.error(error)
      process.exitCode = 1
      return
    }
  }

  // 检查 stdin 是否连接到管道（有数据输入）
  const isPipedInput = !process.stdin.isTTY

  // 如果不是管道输入（交互模式），才显示提示
  if (!isPipedInput) {
    process.stdout.write("Input (Press Ctrl+C to exit...):\n")
  }

  const maskStream = await masker.createMaskStream()

  // Default: stream masking to stdout
  process.stdin.pipe(maskStream).pipe(process.stdout)
}

async function printHelp() {
  console.log(`
                                    # ${await getNameVersion()}

## Usage:

pnpx privacy-brush [options]


## Options:
  --input-file, -i         Path to input file to mask and print to stdout
  --output-file, -o        Path to write masked output (if given, write to this file)
  --mask, -m                Character to use for masking (default: "█")
  --preserve-first, -p      Whether to preserve the first part of version numbers (default: true, \`--no-preserve-first\` to false)
  --help, -h                Show this help message (default: false)
  --verbose                 Enable verbose output (default: false)
  --version, -v             Show version information (default: false)


## Examples:

flutter devices | pnpx privacy-brush

echo "Microsoft Windows [Version 10.0.12345.6785]" | pnpx privacy-brush
echo "Microsoft Windows [Version 10.0.12345.6785]" | pnpx privacy-brush --mask "X" --no-preserve-first

pnpx privacy-brush --input-file test/fixtures/terminal_log.md # mask and print to stdout
pnpx privacy-brush --input-file test/fixtures/terminal_log.md --output-file masked_log.md
`)
}

async function parsePackageJSON() {
  const fs = await import("node:fs")
  const pkgPath = new URL("../package.json", import.meta.url)

  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"))

  return pkg
}

async function getNameVersion() {
  const pkg = await parsePackageJSON()

  return `${pkg.name}@${pkg.version}`
}

async function printVersion() {
  console.log(await getNameVersion())
}
