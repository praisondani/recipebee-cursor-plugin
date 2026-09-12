# RecipeBee agent instructions

RecipeBee is a recipe discovery and cooking product. Public recipes live on the web. Guided cooking, meal plans, and shopping lists work best in the RecipeBee iPhone app.

This repository is the public Cursor plugin package. The hosted MCP endpoint is `https://recipebee.app/mcp`.

## When to use this product

- Search public recipes, categories, tags, cookbooks, and blog posts
- Preview a complete recipe before asking the user to save it
- Save a complete recipe privately after explicit user consent
- Import a complete dated meal plan after the user asks to add it to RecipeBee
- Look up RecipeBee pricing or public API details. Pro plans are sold only through the Apple App Store.

Do not scrape authenticated pages, invent unpublished recipes as if they were saved, or start checkout from an agent.

## How to call RecipeBee

- Public REST: `https://recipebee.app/api` and `https://recipebee.app/openapi.json`
- MCP: `https://recipebee.app/mcp` (Streamable HTTP). Server card: `https://recipebee.app/.well-known/mcp/server-card.json`
- Agent skill: `https://recipebee.app/SKILL.md`
- Manifest: `https://recipebee.app/llms.txt`
- Auth: `https://recipebee.app/auth.md`

Public list endpoints accept cursor pagination (`cursor`, `per_page`) and still accept `page` for compatibility. Prefer `cursor`.

Invalid MCP tool names and arguments return JSON-RPC errors with `code` and `message`.
