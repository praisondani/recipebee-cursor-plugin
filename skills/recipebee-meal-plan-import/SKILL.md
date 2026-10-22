---
name: recipebee-meal-plan-import
description: Import complete, user-approved meal plans into RecipeBee. Use when someone explicitly asks to save or import a dated meal plan to RecipeBee.
---

# Import a meal plan to RecipeBee

Use this skill only when the user explicitly asks to add a completed meal plan to RecipeBee.

## Prepare the plan

Before sending a plan, make sure it has a title, date range, at least one dated meal assignment, and a complete recipe definition for each recipe. Each recipe needs a title, ingredients, instruction steps, and realistic integer prep, cook, and total times. Estimate missing times when needed.

## Import flow

1. Call `prepare_meal_plan_import` once with the complete structured plan. This creates a short-lived draft and checks the user’s private recipes; it does not save recipes or a meal plan.
2. If the result lists possible matches, show every match and ask the user whether to reuse it or create a new recipe. Do not silently reuse a private recipe.
3. After the user chooses for every match, call `commit_meal_plan_import` once with those choices. If there are no matches, choose `create_new` for each recipe.
4. Report success only when the commit result has `persisted=true`. Include the meal-plan URL and counts when RecipeBee returns them.

## Safety

- Do not import a meal plan when the user only asked to create or view one.
- Do not call individual recipe-save tools before committing a meal-plan import.
- If a draft expires, prepare it again. If a match becomes stale, ask the user to review the choices again.
- Do not start image generation, purchase credits, or upgrade a plan as part of an import.
- If the MCP server returns an OAuth challenge, ask the user to connect RecipeBee before continuing.
