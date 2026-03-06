-- Additional Realistic Dummy Products
INSERT OR IGNORE INTO products (id, name, description, price, original_price, category, images, variants, tags, rating, reviews, status) VALUES 
('7', 'Noise Cancelling Headphones', 'Industry leading noise cancellation for a truly immersive listening experience. Up to 30 hours of battery life.', 19999, 24999, 'Electronics', 
  '["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800"]',
  '[{"id":"v23","size":"One Size","color":"Black","stock":15,"price":19999},{"id":"v24","size":"One Size","color":"Silver","stock":10,"price":19999}]',
  '["premium","electronics"]', 4.9, 156, 'active'
),
('8', 'Minimalist Desk Lamp', 'Sleek and modern desk lamp with adjustable brightness and color temperature. Perfect for late-night work.', 2499, 3499, 'Home', 
  '["https://images.unsplash.com/photo-1534073828943-f801091bb18c?w=800"]',
  '[{"id":"v25","size":"One Size","color":"White","stock":25,"price":2499},{"id":"v26","size":"One Size","color":"Black","stock":20,"price":2499}]',
  '["new","home"]', 4.6, 42, 'active'
),
('9', 'Canvas Backpack', 'Heavy-duty canvas backpack with padded laptop sleeve and multiple pockets for organized travel.', 2899, 4499, 'Accessories', 
  '["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800"]',
  '[{"id":"v27","size":"Standard","color":"Olive Green","stock":30,"price":2899},{"id":"v28","size":"Standard","color":"Beige","stock":15,"price":2899}]',
  '["travel","accessories"]', 4.8, 89, 'active'
),
('10', 'Smart Fitness Watch', 'Track your workouts, heart rate, and sleep with this advanced fitness tracker. Water resistant and long battery.', 5999, 8999, 'Electronics', 
  '["https://images.unsplash.com/photo-1508685096489-77a5ad304918?w=800"]',
  '[{"id":"v29","size":"M","color":"Midnight Black","stock":40,"price":5999},{"id":"v30","size":"L","color":"Midnight Black","stock":30,"price":5999}]',
  '["fitness","tech"]', 4.7, 321, 'active'
),
('11', 'Ceramic Coffee Mug Set', 'Set of 4 hand-glazed ceramic mugs. Dishwasher and microwave safe. elegant and durable.', 1599, 2199, 'Home', 
  '["https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800"]',
  '[{"id":"v31","size":"Set of 4","color":"Mixed Blue","stock":50,"price":1599}]',
  '["kitchen","home"]', 4.5, 76, 'active'
),
('12', 'Polarized Wayfarer Sunglasses', 'Classic wayfarer style with polarized lenses for superior glare reduction and UV protection.', 1299, 1999, 'Accessories', 
  '["https://images.unsplash.com/photo-1511499767350-a1590fdb2863?w=800"]',
  '[{"id":"v32","size":"One Size","color":"Black","stock":100,"price":1299},{"id":"v33","size":"One Size","color":"Tortoise","stock":45,"price":1299}]',
  '["summer","essentials"]', 4.4, 212, 'active'
),
('13', 'Graphic Cotton Hoodie', 'Soft cotton blend hoodie with high-quality graphic print. Ribbed cuffs and hem for a snug fit.', 1899, 2999, 'Clothing', 
  '["https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800"]',
  '[{"id":"v34","size":"S","color":"Charcoal","stock":20,"price":1899},{"id":"v35","size":"M","color":"Charcoal","stock":35,"price":1899},{"id":"v36","size":"L","color":"Charcoal","stock":25,"price":1899}]',
  '["winter","fashion"]', 4.6, 143, 'active'
),
('14', 'Mechanical Gaming Keyboard', 'Tactile mechanical switches with customizable RGB lighting and ergonomic design for gamers.', 4499, 6999, 'Electronics', 
  '["https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=800"]',
  '[{"id":"v37","size":"Full Size","color":"RGB","stock":12,"price":4499}]',
  '["gaming","electronics"]', 4.8, 67, 'active'
),
('15', 'Electric Kettle', 'Fast boiling electric kettle with auto-shutoff and boil-dry protection. Stainless steel finish.', 2199, 2999, 'Electronics', 
  '["https://images.unsplash.com/photo-1594212699903-ec8a3eea50f5?w=800"]',
  '[{"id":"v38","size":"1.5L","color":"Silver","stock":40,"price":2199}]',
  '["kitchen","home"]', 4.3, 54, 'active'
),
('16', 'Yoga Mat with Strap', 'Non-slip high-density yoga mat for comfort and stability. Includes carry strap for portability.', 999, 1499, 'Fitness', 
  '["https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800"]',
  '[{"id":"v39","size":"Standard","color":"Purple","stock":60,"price":999},{"id":"v40","size":"Standard","color":"Blue","stock":45,"price":999}]',
  '["health","lifestyle"]', 4.7, 189, 'active'
);
