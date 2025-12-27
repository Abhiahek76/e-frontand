import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "./axios";

const getErrMsg = (err) =>
  err?.response?.data?.message ||
  err?.response?.data?.error ||
  err?.message ||
  "Request failed";

/**
 * GET /api/store/categories?withCounts=true
 */
export const fetchCategoriesThunk = createAsyncThunk(
  "store/fetchCategories",
  async ({ withCounts = true } = {}, { rejectWithValue }) => {
    try {
      const res = await api.get("/api/store/categories", {
        params: { withCounts },
      });
      return res.data; // { data: [...] }
    } catch (err) {
      return rejectWithValue(getErrMsg(err));
    }
  }
);

/**
 * GET /api/store/hero-slides
 */
export const fetchHeroSlidesThunk = createAsyncThunk(
  "store/fetchHeroSlides",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/api/store/hero-slides");
      return res.data; // { data: [...] }
    } catch (err) {
      return rejectWithValue(getErrMsg(err));
    }
  }
);

/**
 * GET /api/store/brands
 */
export const fetchBrandsThunk = createAsyncThunk(
  "store/fetchBrands",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/api/store/brands");
      return res.data; // { data: [...] }
    } catch (err) {
      return rejectWithValue(getErrMsg(err));
    }
  }
);

/**
 * GET /api/store/products
 * Supports your controller query params:
 * q, category, brand, featured, inStock, minPrice, maxPrice, minRating, sort, page, limit
 */
export const fetchProductsThunk = createAsyncThunk(
  "store/fetchProducts",
  async (
    {
      q,
      category,
      brand,
      featured,
      inStock,
      minPrice,
      maxPrice,
      minRating,
      sort = "newest",
      page = 1,
      limit = 12,
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const res = await api.get("/api/store/products", {
        params: {
          q,
          category,
          brand,
          featured,
          inStock,
          minPrice,
          maxPrice,
          minRating,
          sort,
          page,
          limit,
        },
      });
      return res.data; // { data: [...], meta: {...} }
    } catch (err) {
      return rejectWithValue(getErrMsg(err));
    }
  }
);

/**
 * GET /api/store/products/:slug
 */
export const fetchProductBySlugThunk = createAsyncThunk(
  "store/fetchProductBySlug",
  async (slug, { rejectWithValue }) => {
    try {
      const res = await api.get(`/api/store/products/${slug}`);
      return res.data; // { data: {...} }
    } catch (err) {
      return rejectWithValue(getErrMsg(err));
    }
  }
);

/**
 * GET /api/store/products/:slug/reviews?page=1&limit=10
 */
export const fetchReviewsBySlugThunk = createAsyncThunk(
  "store/fetchReviewsBySlug",
  async ({ slug, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const res = await api.get(`/api/store/products/${slug}/reviews`, {
        params: { page, limit },
      });
      return { slug, ...res.data }; // { slug, data: [...], meta: {...} }
    } catch (err) {
      return rejectWithValue(getErrMsg(err));
    }
  }
);

const storeSlice = createSlice({
  name: "store",
  initialState: {
    // categories
    categories: [],
    categoriesLoading: false,

    // hero slides
    heroSlides: [],
    heroLoading: false,

    // brands
    brands: [],
    brandsLoading: false,

    // products list
    products: [],
    productsMeta: { page: 1, limit: 12, total: 0, pages: 0 },
    productsLoading: false,

    // single product
    product: null,
    productLoading: false,

    // reviews (per product slug)
    reviewsBySlug: {}, // { [slug]: { items: [], meta, loading } }

    error: null,
  },
  reducers: {
    clearStoreError(state) {
      state.error = null;
    },
    clearProduct(state) {
      state.product = null;
    },
    clearReviews(state, action) {
      const slug = action.payload;
      if (!slug) state.reviewsBySlug = {};
      else delete state.reviewsBySlug[slug];
    },
  },
  extraReducers: (builder) => {
    builder
      // categories
      .addCase(fetchCategoriesThunk.pending, (state) => {
        state.categoriesLoading = true;
        state.error = null;
      })
      .addCase(fetchCategoriesThunk.fulfilled, (state, action) => {
        state.categoriesLoading = false;
        state.categories = action.payload?.data || [];
      })
      .addCase(fetchCategoriesThunk.rejected, (state, action) => {
        state.categoriesLoading = false;
        state.error = action.payload || "Failed to fetch categories";
      })

      // hero slides
      .addCase(fetchHeroSlidesThunk.pending, (state) => {
        state.heroLoading = true;
        state.error = null;
      })
      .addCase(fetchHeroSlidesThunk.fulfilled, (state, action) => {
        state.heroLoading = false;
        state.heroSlides = action.payload?.data || [];
      })
      .addCase(fetchHeroSlidesThunk.rejected, (state, action) => {
        state.heroLoading = false;
        state.error = action.payload || "Failed to fetch hero slides";
      })

      // brands
      .addCase(fetchBrandsThunk.pending, (state) => {
        state.brandsLoading = true;
        state.error = null;
      })
      .addCase(fetchBrandsThunk.fulfilled, (state, action) => {
        state.brandsLoading = false;
        state.brands = action.payload?.data || [];
      })
      .addCase(fetchBrandsThunk.rejected, (state, action) => {
        state.brandsLoading = false;
        state.error = action.payload || "Failed to fetch brands";
      })

      // products
      .addCase(fetchProductsThunk.pending, (state) => {
        state.productsLoading = true;
        state.error = null;
      })
      .addCase(fetchProductsThunk.fulfilled, (state, action) => {
        state.productsLoading = false;
        state.products = action.payload?.data || [];
        state.productsMeta = action.payload?.meta || state.productsMeta;
      })
      .addCase(fetchProductsThunk.rejected, (state, action) => {
        state.productsLoading = false;
        state.error = action.payload || "Failed to fetch products";
      })

      // product by slug
      .addCase(fetchProductBySlugThunk.pending, (state) => {
        state.productLoading = true;
        state.error = null;
      })
      .addCase(fetchProductBySlugThunk.fulfilled, (state, action) => {
        state.productLoading = false;
        state.product = action.payload?.data || null;
      })
      .addCase(fetchProductBySlugThunk.rejected, (state, action) => {
        state.productLoading = false;
        state.error = action.payload || "Failed to fetch product";
      })

      // reviews by slug
      .addCase(fetchReviewsBySlugThunk.pending, (state, action) => {
        const slug = action.meta.arg?.slug;
        if (!slug) return;
        state.reviewsBySlug[slug] = state.reviewsBySlug[slug] || {
          items: [],
          meta: { page: 1, limit: 10, total: 0, pages: 0 },
          loading: false,
        };
        state.reviewsBySlug[slug].loading = true;
        state.error = null;
      })
      .addCase(fetchReviewsBySlugThunk.fulfilled, (state, action) => {
        const slug = action.payload.slug;
        state.reviewsBySlug[slug] = state.reviewsBySlug[slug] || {
          items: [],
          meta: { page: 1, limit: 10, total: 0, pages: 0 },
          loading: false,
        };
        state.reviewsBySlug[slug].loading = false;
        state.reviewsBySlug[slug].items = action.payload?.data || [];
        state.reviewsBySlug[slug].meta =
          action.payload?.meta || state.reviewsBySlug[slug].meta;
      })
      .addCase(fetchReviewsBySlugThunk.rejected, (state, action) => {
        const slug = action.meta.arg?.slug;
        if (slug && state.reviewsBySlug[slug]) {
          state.reviewsBySlug[slug].loading = false;
        }
        state.error = action.payload || "Failed to fetch reviews";
      });
  },
});

export const { clearStoreError, clearProduct, clearReviews } =
  storeSlice.actions;
export default storeSlice.reducer;
