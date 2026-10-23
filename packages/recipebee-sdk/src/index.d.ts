export type QueryValue = string | number | boolean | readonly string[] | null | undefined;

export interface ApiEnvelope<T> {
  status?: string;
  statusCode?: number;
  message?: string;
  data: T;
  timestamp?: string;
  [key: string]: unknown;
}

export interface PaginationMeta {
  pagination?: "cursor" | "page";
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
  has_more?: boolean;
  next_cursor?: string | null;
  prev_cursor?: string | null;
}

export interface PageLinks {
  first?: string | null;
  last?: string | null;
  next?: string | null;
  prev?: string | null;
}

export interface PaginatedData<T> {
  data: T[];
  meta?: PaginationMeta;
  links?: PageLinks;
}

export interface RecipeIngredient {
  name: string;
  quantity?: string | number | null;
  unit?: string | null;
  preparation?: string | null;
  group?: string | null;
  optional?: boolean;
  [key: string]: unknown;
}

export interface RecipeStep {
  order?: number;
  instruction: string;
  duration_minutes?: number | null;
  heat_level?: string | null;
  equipment?: string[];
  tip?: string | null;
  [key: string]: unknown;
}

export interface RecipePayload {
  ingredients?: RecipeIngredient[];
  recipeIngredient?: string[];
  steps?: RecipeStep[];
  [key: string]: unknown;
}

export interface PublicRecipe {
  id?: string;
  title: string;
  slug: string;
  summary?: string | null;
  description?: string | null;
  servings?: number | null;
  prep_time_minutes?: number | null;
  cook_time_minutes?: number | null;
  total_time_min?: number | null;
  is_public?: boolean;
  payload?: RecipePayload;
  categories?: Array<{ id?: string; name: string; slug: string }>;
  tags?: Array<{ id?: string; name: string; slug: string }>;
  [key: string]: unknown;
}

export interface Category {
  id?: string;
  name: string;
  slug: string;
  description?: string | null;
  parent_id?: string | null;
  depth?: number;
  recipe_count?: number;
  [key: string]: unknown;
}

export interface Tag {
  id?: string;
  name: string;
  slug: string;
  recipe_count?: number;
  [key: string]: unknown;
}

export interface PublicCookbook {
  id?: string;
  title: string;
  slug: string;
  recipes?: PublicRecipe[];
  [key: string]: unknown;
}

export interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string;
  published_at?: string | null;
  [key: string]: unknown;
}

export interface RecipeListOptions {
  q?: string;
  query?: string;
  perPage?: number;
  cursor?: string;
  page?: number;
  view?: "card" | "full";
  categories?: string | readonly string[];
  tags?: string | readonly string[];
  signal?: AbortSignal;
}

export interface CategoryListOptions {
  parent?: string;
  tree?: boolean;
  activeOnly?: boolean;
  perPage?: number;
  signal?: AbortSignal;
}

export interface TagListOptions {
  q?: string;
  query?: string;
  signal?: AbortSignal;
}

export interface BlogPostListOptions {
  perPage?: number;
  page?: number;
  signal?: AbortSignal;
}

export interface RecipeBeeClientOptions {
  apiBaseUrl?: string;
  fetch?: typeof globalThis.fetch;
  timeoutMs?: number;
}

export interface RecipeBeeApiErrorOptions {
  status?: number;
  code?: string;
  body?: unknown;
  retryAfter?: string | null;
}

export class RecipeBeeApiError extends Error {
  constructor(message: string, options?: RecipeBeeApiErrorOptions);
  readonly name: "RecipeBeeApiError";
  readonly status?: number;
  readonly code?: string;
  readonly body?: unknown;
  readonly retryAfter?: string | null;
}

export interface IterateRecipesOptions extends RecipeListOptions {
  maxPages?: number;
}

export class RecipeBeeClient {
  constructor(options?: RecipeBeeClientOptions);
  readonly apiBaseUrl: URL;
  readonly timeoutMs: number;
  listRecipes(options?: RecipeListOptions): Promise<ApiEnvelope<PaginatedData<PublicRecipe>>>;
  getRecipe(slug: string, options?: { signal?: AbortSignal }): Promise<ApiEnvelope<PublicRecipe>>;
  listCategories(options?: CategoryListOptions): Promise<ApiEnvelope<Category[]>>;
  getCategory(slug: string, options?: { signal?: AbortSignal }): Promise<ApiEnvelope<Category>>;
  listTags(options?: TagListOptions): Promise<ApiEnvelope<Tag[]>>;
  getTag(slug: string, options?: { signal?: AbortSignal }): Promise<ApiEnvelope<Tag>>;
  getCookbook(slug: string, options?: { signal?: AbortSignal }): Promise<ApiEnvelope<PublicCookbook>>;
  listBlogPosts(options?: BlogPostListOptions): Promise<ApiEnvelope<PaginatedData<BlogPost>>>;
  getBlogPost(slug: string, options?: { signal?: AbortSignal }): Promise<ApiEnvelope<BlogPost>>;
  iterateRecipes(options?: IterateRecipesOptions): AsyncGenerator<PublicRecipe, void, unknown>;
}

export const DEFAULT_API_BASE_URL: string;
