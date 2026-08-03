#!/bin/sh
set -eu

for database in sayur_user_db sayur_product_db sayur_order_db sayur_payment_db; do
  psql --username "$POSTGRES_USER" --dbname postgres --command "CREATE DATABASE $database;"
done

psql --username "$POSTGRES_USER" --dbname sayur_product_db --file /migrations/products.sql
psql --username "$POSTGRES_USER" --dbname sayur_order_db --file /migrations/orders.sql
psql --username "$POSTGRES_USER" --dbname sayur_order_db --file /migrations/order-items.sql
