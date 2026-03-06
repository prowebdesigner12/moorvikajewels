-- Seed products from src/data/products.ts
INSERT OR IGNORE INTO products (id, name, description, price, original_price, category, images, variants, tags, rating, reviews, status) VALUES 
('1', 'Premium Cotton T-Shirt', 'Ultra-soft premium cotton t-shirt with a comfortable fit. Perfect for everyday wear.', 799, 1299, 'Clothing', 
  '["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500","https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500"]',
  '[{"id":"v1","size":"S","color":"White","stock":15,"price":799},{"id":"v2","size":"M","color":"White","stock":20,"price":799},{"id":"v3","size":"L","color":"White","stock":10,"price":799},{"id":"v4","size":"M","color":"Black","stock":25,"price":799},{"id":"v5","size":"L","color":"Black","stock":12,"price":799}]',
  '["bestseller","cotton"]', 4.5, 128, 'active'
),
('2', 'Slim Fit Denim Jeans', 'Classic slim fit jeans with stretch fabric for ultimate comfort and style.', 1499, 2499, 'Clothing', 
  '["https://images.unsplash.com/photo-1542272604-787c3835535d?w=500","https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500"]',
  '[{"id":"v6","size":"30","color":"Blue","stock":8,"price":1499},{"id":"v7","size":"32","color":"Blue","stock":15,"price":1499},{"id":"v8","size":"34","color":"Blue","stock":10,"price":1499},{"id":"v9","size":"32","color":"Black","stock":12,"price":1499}]',
  '["trending"]', 4.3, 89, 'active'
),
('3', 'Running Sports Shoes', 'Lightweight running shoes with cushioned sole for maximum comfort during workouts.', 2999, 4999, 'Footwear', 
  '["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500","https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500"]',
  '[{"id":"v10","size":"7","color":"Red","stock":5,"price":2999},{"id":"v11","size":"8","color":"Red","stock":10,"price":2999},{"id":"v12","size":"9","color":"Red","stock":8,"price":2999},{"id":"v13","size":"8","color":"Black","stock":15,"price":2999},{"id":"v14","size":"9","color":"Black","stock":12,"price":2999}]',
  '["bestseller","sports"]', 4.7, 256, 'active'
),
('4', 'Leather Crossbody Bag', 'Elegant genuine leather crossbody bag with adjustable strap and multiple compartments.', 1899, 2999, 'Accessories', 
  '["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500","https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500"]',
  '[{"id":"v15","size":"One Size","color":"Brown","stock":20,"price":1899},{"id":"v16","size":"One Size","color":"Black","stock":15,"price":1899},{"id":"v17","size":"One Size","color":"Tan","stock":10,"price":1899}]',
  '["premium"]', 4.6, 67, 'active'
),
('5', 'Wireless Bluetooth Earbuds', 'Premium wireless earbuds with noise cancellation and 24-hour battery life.', 3499, 5999, 'Electronics', 
  '["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500","https://images.unsplash.com/photo-1598331668826-20cecc596b86?w=500"]',
  '[{"id":"v18","size":"One Size","color":"White","stock":30,"price":3499},{"id":"v19","size":"One Size","color":"Black","stock":25,"price":3499}]',
  '["bestseller","tech"]', 4.8, 412, 'active'
),
('6', 'Classic Analog Watch', 'Timeless analog watch with stainless steel band and water-resistant design.', 4999, 7999, 'Accessories', 
  '["https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500","https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500"]',
  '[{"id":"v20","size":"One Size","color":"Silver","stock":10,"price":4999},{"id":"v21","size":"One Size","color":"Gold","stock":8,"price":5499},{"id":"v22","size":"One Size","color":"Rose Gold","stock":5,"price":5499}]',
  '["premium","luxury"]', 4.4, 98, 'active'
);
