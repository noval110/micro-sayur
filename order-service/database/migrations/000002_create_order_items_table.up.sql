CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INT NOT NULL,
    product_name VARCHAR(255),
    price NUMERIC(10, 2) NOT NULL,
    quantity INT NOT NULL
);
