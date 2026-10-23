# RecipeBee JavaScript SDK

`recipebee-sdk` provides a zero-dependency JavaScript client and command-line tool for RecipeBee's public API. It supports recipe search, categories, tags, public cookbooks, and published blog posts.

The SDK uses anonymous `GET` endpoints only. Private saves and account actions are available through RecipeBee's remote MCP server with OAuth.

## Install

```bash
npm install recipebee-sdk
```

Requires Node.js 20 or later.

## Use the SDK

```js
import { RecipeBeeClient } from "recipebee-sdk";

const recipebee = new RecipeBeeClient();
const result = await recipebee.listRecipes({ q: "pasta", perPage: 5 });

for (const recipe of result.data.data) {
  console.log(recipe.title, recipe.slug);
}
```

Fetch one public recipe by its slug:

```js
const result = await recipebee.getRecipe("pan-fried-fish-with-potato-cakes");
console.log(result.data.title);
```

List methods return RecipeBee's API envelope. `RecipeBeeApiError` includes the HTTP status, API error code, response body, and `Retry-After` value when the API returns an error.

The client accepts an `AbortSignal` on each request. Set `apiBaseUrl` to use a local or compatible API host, and set `timeoutMs` to change the default 15-second timeout.

### Cursor pagination

`listRecipes` accepts a cursor. Pass an empty string to request the first cursor page; omitting `cursor` keeps the API's page-based compatibility mode. `iterateRecipes` requests the first cursor page, follows subsequent cursors, and yields recipes one at a time:

```js
for await (const recipe of recipebee.iterateRecipes({ q: "vegetarian", perPage: 20 })) {
  console.log(recipe.title);
}
```

Pass `maxPages` to stop after a fixed number of pages or `signal` to cancel the requests.

## Use the CLI

```bash
npx --yes --package recipebee-sdk recipebee search "pasta" --limit 5
npx --yes --package recipebee-sdk recipebee recipe pan-fried-fish-with-potato-cakes
npx --yes --package recipebee-sdk recipebee categories --limit 20
npx --yes --package recipebee-sdk recipebee tags "quick"
npx --yes --package recipebee-sdk recipebee cookbook weeknight-dinners
npx --yes --package recipebee-sdk recipebee blogs --limit 5
```

The `recipebee` command writes the API response as JSON. Set `RECIPEBEE_API_BASE_URL` to use another compatible host. Run `recipebee --help` to see all commands.

## API coverage

- `listRecipes` and `getRecipe`
- `listCategories` and `getCategory`
- `listTags` and `getTag`
- `getCookbook`
- `listBlogPosts` and `getBlogPost`
- `iterateRecipes` for cursor pagination

See the [RecipeBee developer resources](https://recipebee.app/developers) and [public OpenAPI specification](https://recipebee.app/openapi.json) for the API contract.

## Publish

The repository workflow publishes this package when a `recipebee-sdk-v*` tag is pushed. Configure npm trusted publishing for `praisondani/recipebee-cursor-plugin` and `.github/workflows/publish-sdk.yml` before creating the release tag.
