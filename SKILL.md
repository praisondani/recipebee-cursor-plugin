---
name: recipebee
description: Search public RecipeBee recipes and save private recipes or meal plans through RecipeBee's public API and MCP server. Use when the user wants to find a recipe, preview or save a recipe in RecipeBee, or import a meal plan.
---

# RecipeBee

RecipeBee helps people discover public recipes and cook them later on iPhone.

## When to use this skill

Use this skill when the user asks to find a recipe, preview a recipe in RecipeBee, save a recipe privately, attach or generate a RecipeBee recipe image, or import a complete meal plan.

## Public REST

No API key is required for public reads.

- Catalog: `GET https://recipebee.app/api`
- OpenAPI: `https://recipebee.app/openapi.json`
- Search recipes: `GET https://recipebee.app/api/v1/public/recipes?q={query}&per_page=20`
- Page with a cursor: `GET https://recipebee.app/api/v1/public/recipes?cursor={cursor}`
- Recipe by slug: `GET https://recipebee.app/api/v1/public/recipes/{slug}`

## MCP

Remote server: `https://recipebee.app/mcp`

- `preview_recipe` and `preview_meal_plan` are anonymous
- Saving, images, and meal-plan import require OAuth
- Unknown tools return JSON-RPC `error.code` and `error.message`

Only claim a save or import succeeded when the tool result has `persisted=true`.
