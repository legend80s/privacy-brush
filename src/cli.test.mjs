// 流式处理

import { strict as assert } from "node:assert"
import { execSync } from "node:child_process"
import { test } from "node:test"

test("❯ echo 'Microsoft Windows [Version 10.0.12345.6785]' | node src/cli.mjs", async () => {
  const actual = execSync(
    "echo Microsoft Windows [Version 10.0.12345.6785] | node src/cli.mjs",
  ).toString("utf8")

  // console.log(`actual:|${actual}|`)

  const expected = "Microsoft Windows [Version 10.█.█████.████] \r\n"
  assert.strictEqual(actual, expected)
})

test("--mask", async () => {
  const actual = execSync(
    'echo Microsoft Windows [Version 10.0.12345.6785] | node src/cli.mjs --mask "🔒" --no-preserve-first',
  ).toString("utf8")

  // console.log(`actual:|${actual}|`)

  const expected =
    "Microsoft Windows [Version 🔒🔒.🔒.🔒🔒🔒🔒🔒.🔒🔒🔒🔒] \r\n"
  assert.strictEqual(actual, expected)
})
