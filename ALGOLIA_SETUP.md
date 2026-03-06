# Algolia Search Integration Guide

## Overview
This guide explains how to replace the current database search with **Algolia** for features like Typo Tolerance, Instant Filtering, and Recommendations.

## Prerequisites
1.  **Create Algolia Account**: Go to [algolia.com](https://www.algolia.com/) and sign up.
2.  **Create Application**: Create a new App (e.g., `TopStore`).
3.  **Get API Keys**: Go to **Settings > API Keys** and copy:
    *   **Application ID**
    *   **Search-Only API Key** (for Frontend)
    *   **Admin API Key** (for Backend - Keep Secret!)

## Implementation Steps

### 1. Backend: Sync Data (D1 -> Algolia)
You need a mechanism to send product data to Algolia whenever a product is created, updated, or deleted.

**File:** `functions/api/products.ts` (Modify `POST`, `PUT`, `DELETE`)

```typescript
// Example: Syncing after DB insert
import algoliasearch from 'algoliasearch';

// Initialize Client (Use Admin Key)
const client = algoliasearch('YOUR_APP_ID', 'YOUR_ADMIN_KEY');
const index = client.initIndex('products');

// Inside onRequestPost...
await env.DB.prepare("INSERT INTO products...").run();

// Send to Algolia
await index.saveObject({
    objectID: productId, // Must be unique
    name: "iPhone 15",
    price: 79999,
    category: "Mobile",
    image: "https://...",
    rating: 4.5
});
```

### 2. Frontend: Instant Search UI
Replace your current search logic with Algolia's React hooks.

**Install Dependencies:**
```bash
npm install algoliasearch react-instantsearch
```

**File:** `src/components/Search.tsx` (New Component)

```tsx
import { algoliasearch } from 'algoliasearch/lite';
import { InstantSearch, SearchBox, Hits } from 'react-instantsearch';

const searchClient = algoliasearch('YOUR_APP_ID', 'YOUR_SEARCH_ONLY_KEY');

function Search() {
  return (
    <InstantSearch searchClient={searchClient} indexName="products">
      <SearchBox placeholder="Search products..." />
      <Hits hitComponent={({ hit }) => (
          <div>
              <img src={hit.image} alt={hit.name} />
              <p>{hit.name}</p>
              <p>₹{hit.price}</p>
          </div>
      )} />
    </InstantSearch>
  );
}
```

## Costs
*   **Free Plan**: Up to 10,000 records and 10,000 searches/month.
*   **Paid**: Standard plans start if you exceed limits.

## Recommendation
For now, your current **D1 SQLite Search** is sufficient and cost-effective (Free). Move to Algolia only if:
1.  You have >5,000 products.
2.  Users complain about search quality (typos not working).
