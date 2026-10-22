const DEFAULT_API_BASE_URL = "https://recipebee.app/api/v1";

function normalizeApiBaseUrl(value) {
  const url = new URL(value);
  if (url.search || url.hash) {
    throw new TypeError("apiBaseUrl must not include a query string or fragment");
  }

  url.pathname = `${url.pathname.replace(/\/+$/, "")}/`;
  return url;
}

function encodePathSegment(value, label) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new TypeError(`${label} must be a non-empty string`);
  }

  return encodeURIComponent(value.trim()).replace(/[!'()*]/g, (character) =>
    `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

function appendQuery(url, query) {
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    if (value === "" && key !== "cursor") continue;

    const serializedValue = Array.isArray(value)
      ? value.filter((item) => item !== undefined && item !== null).join(",")
      : String(value);

    if (serializedValue !== "" || key === "cursor") {
      url.searchParams.set(key, serializedValue);
    }
  }

  return url;
}

function readApiError(body) {
  if (!body || typeof body !== "object") return {};

  const nestedError = body.error && typeof body.error === "object" ? body.error : {};
  return {
    message:
      body.message || nestedError.message || body.detail ||
      (typeof body.error === "string" ? body.error : undefined),
    code: body.code || nestedError.code,
  };
}

/** An HTTP or response error returned by the RecipeBee public API. */
export class RecipeBeeApiError extends Error {
  constructor(message, { status, code, body, retryAfter } = {}) {
    super(message);
    this.name = "RecipeBeeApiError";
    this.status = status;
    this.code = code;
    this.body = body;
    this.retryAfter = retryAfter;
  }
}

/**
 * Read the public RecipeBee API. This client intentionally exposes GET
 * operations only; private saves and other account actions use the MCP server.
 */
export class RecipeBeeClient {
  constructor({
    apiBaseUrl = DEFAULT_API_BASE_URL,
    fetch: fetchImplementation = globalThis.fetch,
    timeoutMs = 15_000,
  } = {}) {
    if (typeof fetchImplementation !== "function") {
      throw new TypeError("A Fetch-compatible function is required");
    }
    if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
      throw new TypeError("timeoutMs must be a positive number");
    }

    this.apiBaseUrl = normalizeApiBaseUrl(apiBaseUrl);
    this.fetchImplementation = fetchImplementation;
    this.timeoutMs = timeoutMs;
  }

  async #get(path, { query = {}, signal } = {}) {
    const url = appendQuery(new URL(path, this.apiBaseUrl), query);
    const controller = new AbortController();
    let timedOut = false;
    const abortFromCaller = () => controller.abort(signal.reason);

    if (signal?.aborted) {
      abortFromCaller();
    } else {
      signal?.addEventListener("abort", abortFromCaller, { once: true });
    }

    const timeout = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, this.timeoutMs);

    try {
      const response = await this.fetchImplementation(url.toString(), {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });
      const responseText = await response.text();
      let body;

      try {
        body = responseText ? JSON.parse(responseText) : null;
      } catch {
        body = responseText;
      }

      if (!response.ok) {
        const apiError = readApiError(body);
        throw new RecipeBeeApiError(
          apiError.message || `RecipeBee API request failed with HTTP ${response.status}`,
          {
            status: response.status,
            code: apiError.code,
            body,
            retryAfter: response.headers.get("retry-after"),
          },
        );
      }

      if (typeof body === "string") {
        throw new RecipeBeeApiError("RecipeBee returned a non-JSON response", {
          status: response.status,
          code: "INVALID_RESPONSE",
          body,
        });
      }

      return body;
    } catch (error) {
      if (timedOut && error?.name === "AbortError") {
        throw new RecipeBeeApiError(`RecipeBee API request timed out after ${this.timeoutMs} ms`, {
          code: "REQUEST_TIMEOUT",
          body: null,
        });
      }

      throw error;
    } finally {
      clearTimeout(timeout);
      signal?.removeEventListener("abort", abortFromCaller);
    }
  }

  /** List public recipes, with optional search, filters, and cursor pagination. */
  listRecipes(options = {}) {
    const {
      q,
      query,
      perPage,
      cursor,
      page,
      view,
      categories,
      tags,
      signal,
    } = options;

    return this.#get("public/recipes", {
      signal,
      query: {
        q: q ?? query,
        per_page: perPage,
        cursor,
        page,
        view,
        categories,
        tags,
      },
    });
  }

  /** Get a public recipe by slug. */
  getRecipe(slug, { signal } = {}) {
    return this.#get(`public/recipes/${encodePathSegment(slug, "slug")}`, { signal });
  }

  /** List public recipe categories. */
  listCategories(options = {}) {
    const { parent, tree, activeOnly, perPage, signal } = options;
    return this.#get("categories", {
      signal,
      query: {
        parent,
        tree,
        active_only: activeOnly,
        per_page: perPage,
      },
    });
  }

  /** Get a public category by slug. */
  getCategory(slug, { signal } = {}) {
    return this.#get(`categories/${encodePathSegment(slug, "slug")}`, { signal });
  }

  /** Search public recipe tags. */
  listTags(options = {}) {
    const { q, query, signal } = options;
    return this.#get("tags", { signal, query: { q: q ?? query } });
  }

  /** Get a public recipe tag by slug. */
  getTag(slug, { signal } = {}) {
    return this.#get(`tags/${encodePathSegment(slug, "slug")}`, { signal });
  }

  /** Get a public shared cookbook by slug. */
  getCookbook(slug, { signal } = {}) {
    return this.#get(`public/cookbooks/${encodePathSegment(slug, "slug")}`, { signal });
  }

  /** List published RecipeBee blog posts. */
  listBlogPosts(options = {}) {
    const { perPage, page, signal } = options;
    return this.#get("blog-posts", {
      signal,
      query: { per_page: perPage, page },
    });
  }

  /** Get a published RecipeBee blog post by slug. */
  getBlogPost(slug, { signal } = {}) {
    return this.#get(`blog-posts/${encodePathSegment(slug, "slug")}`, { signal });
  }

  /**
   * Yield public recipes across cursor pages. Stop iteration early by breaking
   * from the loop or passing an AbortSignal.
   */
  async *iterateRecipes(options = {}) {
    const { maxPages = Number.POSITIVE_INFINITY, ...recipeOptions } = options;
    const pageLimit = Number.isInteger(maxPages) && maxPages > 0
      ? maxPages
      : Number.POSITIVE_INFINITY;
    const seenCursors = new Set();
    let cursor = recipeOptions.cursor ?? "";

    for (let pageNumber = 0; pageNumber < pageLimit; pageNumber += 1) {
      const response = await this.listRecipes({ ...recipeOptions, cursor });
      const page = response?.data;

      for (const recipe of page?.data ?? []) yield recipe;

      const nextCursor = page?.meta?.next_cursor;
      if (!nextCursor || nextCursor === cursor || seenCursors.has(nextCursor)) return;

      seenCursors.add(nextCursor);
      cursor = nextCursor;
    }
  }
}

export { DEFAULT_API_BASE_URL };
