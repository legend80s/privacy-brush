import { parseArgs } from "node:util"

// get config from command line arguments use native `parseArgs`
// node src/cli.mjs --mask X --preserve-first false
const args = process.argv.slice(2)
// console.log("args:", args) // args: [ '--mask', 'X', '--preserve-first', 'false' ]

export const verbose = args.includes("--verbose")

export const parsedResult = safeCall(() =>
  parseArgs({
    allowPositionals: true,
    allowNegative: true,

    args,

    options: {
      // input file to mask
      "input-file": {
        type: "string",
        short: "i",
      },
      // custom regex pattern(s) to mask
      pattern: {
        type: "string",
        short: "r",
        multiple: true,
      },
      // output file to write masked content
      "output-file": {
        type: "string",
        short: "o",
      },
      mask: {
        type: "string",
        short: "m",
        default: "█",
      },
      "preserve-first": {
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
      // version
      version: {
        type: "boolean",
        short: "v",
      },
      // list built-in patterns
      "list-patterns": {
        type: "boolean",
      },
    },
  }),
)

/**
 * @template T
 * @param {(...args: any[]) => T} fn
 * @returns {[null, T] | [Error, null]}
 */
function safeCall(fn) {
  try {
    const result = fn()
    return [null, result]
  } catch (error) {
    // @ts-expect-error
    return [error, null]
  }
}
