#!/usr/bin/env node

import { RecipeBeeClient } from "../src/index.js";

const HELP = `RecipeBee public API CLI

Usage:
  recipebee search [query] [--limit number] [--cursor cursor] [--category slug] [--tag slug]
  recipebee recipe <slug>
  recipebee categories [--parent slug] [--tree]
  recipebee tags [query]
  recipebee tag <slug>
  recipebee cookbook <slug>
  recipebee blogs [--limit number] [--page number]
  recipebee blog <slug>

The CLI reads public RecipeBee data. Private actions require the RecipeBee MCP
server and OAuth; this package does not perform saves or account changes.
`;

function parseArguments(args) {
  const positional = [];
  const options = {};
  const booleanFlags = new Set(["--tree"]);

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (!argument.startsWith("--")) {
      positional.push(argument);
      continue;
    }

    const equalsIndex = argument.indexOf("=");
    const key = equalsIndex === -1 ? argument : argument.slice(0, equalsIndex);
    const inlineValue = equalsIndex === -1 ? undefined : argument.slice(equalsIndex + 1);

    if (booleanFlags.has(key)) {
      options[key.slice(2)] = true;
      continue;
    }

    const value = inlineValue ?? args[index + 1];
    if (value === undefined || value.startsWith("--")) {
      throw new TypeError(`${key} requires a value`);
    }
    if (inlineValue === undefined) index += 1;
    options[key.slice(2)] = value;
  }

  return { positional, options };
}

function readPositiveInteger(value, label) {
  if (value === undefined) return undefined;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new TypeError(`${label} must be a positive integer`);
  }
  return parsed;
}

async function run() {
  const [command, ...args] = process.argv.slice(2);
  if (!command || command === "--help" || command === "-h" || command === "help") {
    process.stdout.write(HELP);
    return;
  }

  const { positional, options } = parseArguments(args);
  const client = new RecipeBeeClient({
    apiBaseUrl: process.env.RECIPEBEE_API_BASE_URL,
  });
  const limit = readPositiveInteger(options.limit, "--limit");
  const page = readPositiveInteger(options.page, "--page");
  let result;

  switch (command) {
    case "search":
      result = await client.listRecipes({
        q: positional.join(" ") || undefined,
        perPage: limit,
        cursor: options.cursor ?? "",
        page,
        categories: options.category,
        tags: options.tag,
      });
      break;
    case "recipe":
      result = await client.getRecipe(positional[0]);
      break;
    case "categories":
      result = await client.listCategories({
        parent: options.parent,
        tree: options.tree,
        perPage: limit,
      });
      break;
    case "tags":
      result = await client.listTags({ query: positional.join(" ") || undefined });
      break;
    case "tag":
      result = await client.getTag(positional[0]);
      break;
    case "cookbook":
      result = await client.getCookbook(positional[0]);
      break;
    case "blogs":
      result = await client.listBlogPosts({ perPage: limit, page });
      break;
    case "blog":
      result = await client.getBlogPost(positional[0]);
      break;
    default:
      throw new TypeError(`Unknown command: ${command}\n\n${HELP}`);
  }

  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

run().catch((error) => {
  const status = error?.status ? ` (HTTP ${error.status})` : "";
  process.stderr.write(`recipebee: ${error?.message || "Request failed"}${status}\n`);
  process.exitCode = 1;
});
