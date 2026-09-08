---
name: save-generated-recipe
description: Understand ordinary-language requests to preview recipes, privately save recipes, or add complete meal plans to RecipeBee. Use when the user asks to preview or save a recipe in RecipeBee, manage a RecipeBee recipe image, or import a meal plan into RecipeBee.
---

# RecipeBee request routing

Users do not need to know MCP tool names or describe the internal workflow. Infer the supported action from the request, and keep the user-facing response about the recipe rather than the implementation.

## Intent routing

- If the user asks to preview or review a recipe and not save it, call `preview_recipe` only.
- If the user explicitly asks to save a complete recipe privately without an image, call `save_recipe` once.
- If the user explicitly asks RecipeBee to generate an image while saving, call `save_recipe_with_image` once. This consumes RecipeBee image credits or monthly image allowance.
- If the user asks for an image generated or uploaded by the host app, call `save_recipe` once, then use the image controls in the rendered RecipeBee card. Call `attach_recipe_image` only after a file or HTTPS image URL is available.
- If the user explicitly asks RecipeBee to create a new image for an existing private recipe, call `generate_recipe_image`. Do not use it merely because the user asks the host app to create an image.
- If a meal-plan import returns an image batch, use `get_image_generation_batch` only to read progress. Never start, cancel, or charge image generation from the host app; the user must select recipes and confirm image generation inside RecipeBee.
- After a later image mutation, call `show_recipe` once to render the authoritative saved recipe and image status. Do not attach the widget to every data-only action.
- If the user asks the host app to create a meal plan but does not ask to save it, build and show the complete plan in the conversation. Use `preview_meal_plan` only when the user explicitly asks for a RecipeBee meal-plan preview without importing it.
- If the user explicitly asks to add the completed meal plan to RecipeBee, call `prepare_meal_plan_import` once with the complete structured plan. This step checks the user's private recipes and creates only a short-lived import draft; it does not create recipes or a meal plan.
- If preparation returns matches, present every match and wait for the user to choose `use_existing` or `create_new` for each recipe. Never silently reuse a recipe. After all choices are explicit, call `commit_meal_plan_import` once.
- If preparation returns no matches, call `commit_meal_plan_import` with `create_new` for every recipe. Do not call individual recipe-save tools first.

## Execution rules

1. Ensure every complete recipe has a title, realistic integer `prep_time_minutes`, `cook_time_minutes`, and `total_time_minutes` values, at least one ingredient, and at least one instruction step. Estimate times when the user does not provide them; use `0` only when that part genuinely takes no time.
2. Do not call `preview_recipe` as a mandatory intermediate step when the user has already explicitly asked to save.
3. Treat private saving as the default only after the user explicitly requests saving. Never infer save consent from a recipe-generation request alone.
4. If the tool returns an OAuth challenge, ask the user to connect RecipeBee and continue the same workflow after authorization.
5. Save once per user request. Do not create a second copy after a retry or ambiguous response.
6. Do not use browser control or visit `recipebee.app` to perform the integration workflow.
7. Never claim that an image is attached until the attachment result has `persisted=true` and `needs_image_selection=false`.
8. Keep post-tool narration to one short sentence. Do not repeat full ingredients, steps, or picker instructions already rendered in the widget.
9. Report the saved recipe ID and URL returned by RecipeBee when available.
10. A meal plan must include a title, date range, at least one complete recipe definition per unique recipe reference, and at least one dated meal assignment. Do not import a plan that contains only recipe names or links.
11. A meal-plan import creates one private meal plan and new private recipes atomically. Report success only when the commit result has `persisted=true`, and include the meal-plan URL and counts when returned.
12. If a meal-plan draft expires, prepare it again from the same complete plan. If a recipe choice becomes stale, ask the user to review the matches again; do not substitute a different recipe automatically.
13. Treat dietary, allergy, and health requirements as user-provided preferences, not medical guidance. Do not claim that an AI-generated recipe is medically safe; ask the user to verify medically important restrictions with a qualified professional.
14. Do not request or transmit passwords, API keys, MFA codes, payment-card numbers, government IDs, health records, or other unrelated sensitive data through the RecipeBee integration.
15. Do not initiate checkout, purchase credits, or upgrade a plan from the host app. If RecipeBee reports that an image feature is unavailable, explain that the user can review options inside RecipeBee without promising a purchase or bypassing the entitlement check.

Never publish a recipe, edit an existing recipe, list recipes, or delete recipes. Never use browser control for RecipeBee. If the request is incomplete, ask for the missing recipe details or the explicit private-save/import decision.
