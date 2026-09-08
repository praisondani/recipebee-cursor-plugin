# RecipeBee plugin

This package connects Cursor, Codex, and other compatible MCP clients to the
RecipeBee MCP service. It includes a Cursor plugin manifest, a reusable agent
skill, and the production MCP server configuration.

The distributed endpoint is `https://recipebee.app/mcp`. For local development,
temporarily change both `mcp.json` and `.mcp.json` to
`http://localhost:3002/mcp`, then restore the production URL before packaging
or submission.

## Install in Cursor

After the plugin is published, open Cursor's **Customize** page, find
**RecipeBee**, and select **Install**. Cursor connects to the hosted MCP server.
When a protected action first runs, sign in to RecipeBee and approve the
requested OAuth scopes. No API key or local server is required.

For local package testing, link this directory into Cursor's local plugin
directory, then run **Developer: Reload Window**:

```bash
mkdir -p ~/.cursor/plugins/local
ln -s /absolute/path/to/recipebee-plugin ~/.cursor/plugins/local/recipebee
```

The package keeps Cursor's `mcp.json` separate from `.mcp.json`, which is used
by other plugin hosts. Both files connect to the same production endpoint.

## Publish to the Cursor Marketplace

Cursor requires the plugin source to be in a public Git repository. Publish
the contents of this directory as the root of a dedicated public repository,
then submit that repository URL at
[cursor.com/marketplace/publish](https://cursor.com/marketplace/publish).

Do not make the private RecipeBee application monorepo public. The marketplace
package needs only this directory's manifest, MCP configurations, skill, logo,
README, and license.

The plugin exposes these workflows:

- preview_recipe: validate and preview a complete recipe without persistence.
- preview_meal_plan: preview a complete meal plan without persistence.
- save_recipe: save a complete recipe privately after the user explicitly requests it and completes RecipeBee OAuth.
- save_recipe_with_image: save a complete recipe privately and create a RecipeBee-generated food image.
- attach_recipe_image: attach an image supplied by the connected client or selected in the RecipeBee fallback flow.
- generate_recipe_image: create an image for an existing private RecipeBee recipe.
- get_recipe_image: check the status of a generated image.
- show_recipe: read the authoritative private recipe and image status.
- prepare_meal_plan_import: validate a complete meal plan, identify matching private recipes, and create a short-lived import draft without creating recipes or a meal plan.
- commit_meal_plan_import: atomically create the selected new recipes and one private meal plan after explicit recipe choices.
- get_image_generation_batch: read optional meal-plan image-batch progress without starting or charging image generation.

Users can use ordinary language such as “save this recipe and create an image” or “add this meal plan to RecipeBee.” They do not need to name tools, mention MCP, use browser control, or describe the attachment workflow.

Complete recipes include realistic integer preparation, cooking, and total time
values in minutes. When a user does not provide times, the connected model
estimates them before invoking RecipeBee.

Meal plans are generated in the conversation first. RecipeBee is invoked only when the user asks for a preview or explicitly asks to add the completed plan. Existing private recipe matches are shown for an explicit use-existing/create-new choice; RecipeBee never silently reuses a recipe.

Meal-plan import and image generation are separate actions. Import creates the private recipes and meal plan first; users can later choose recipes and confirm image generation inside RecipeBee. This keeps free recipe-generation flows from consuming image credits in the host app.

The server advertises protected-resource metadata, OAuth discovery, DCR-compatible public clients, JWKS-backed token verification, and standard MCP Apps resources. Hosts that support MCP Apps receive interactive cards; other clients receive the same structured tool results.

## Package contents

- `.cursor-plugin/plugin.json`: Cursor plugin manifest and marketplace metadata.
- `mcp.json`: Cursor remote MCP configuration.
- `.codex-plugin/plugin.json`: Codex plugin manifest.
- `.mcp.json`: MCP configuration for compatible plugin hosts.
- `skills/save-generated-recipe/SKILL.md`: intent routing and safety guidance.

## Privacy and support

RecipeBee saves content privately and only after an explicit save request.
Review the [privacy policy](https://recipebee.app/privacy),
[terms of service](https://recipebee.app/terms), or
[contact support](https://recipebee.app/contact).
