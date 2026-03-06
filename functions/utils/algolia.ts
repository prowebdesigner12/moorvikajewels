
// Algolia Sync Logic
// This file is intended to be imported/used by products.ts

import algoliasearch from 'algoliasearch';

// BE CAREFUL: This uses the Admin Write Key. Do not expose to client.
const ALGOLIA_APP_ID = "149SUVKCWZ";
const ALGOLIA_ADMIN_KEY = "2b04beb301fe738a0dc4e8fe97605e77";

export const syncProductToAlgolia = async (product: any, action: 'create' | 'update' | 'delete') => {
    try {
        const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY);
        const index = client.initIndex("products");

        if (action === 'delete') {
            await index.deleteObject(product.id);
            console.log(`Algolia: Deleted ${product.id}`);
            return;
        }

        const object = {
            objectID: product.id,
            name: product.name,
            price: product.price,
            description: product.description,
            category: product.category,
            image: product.images ? JSON.parse(product.images)[0] : '', // Use first image
            rating: product.rating || 0,
            reviews: product.reviews || 0,
            created_at: product.created_at
        };

        await index.saveObject(object);
        console.log(`Algolia: Synced ${product.id}`);

    } catch (error) {
        console.error("Algolia Sync Error:", error);
    }
};
