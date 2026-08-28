#!/bin/sh

set -e

echo "Starting Sayur-day backend..."

echo "Starting user-service..."
APP_PORT=8080 /app/user-service start &
USER_PID=$!

echo "Starting product-service..."
APP_PORT=8081 /app/product-service start &
PRODUCT_PID=$!

echo "Starting order-service..."
APP_PORT=8082 /app/order-service start &
ORDER_PID=$!

echo "Starting payment-service..."
APP_PORT=8083 /app/payment-service &
PAYMENT_PID=$!

echo "Starting notification-service..."
APP_PORT=8084 /app/notification-service &
NOTIFICATION_PID=$!

sleep 8

echo "Starting Nginx API Gateway..."
nginx -g "daemon off;" &
NGINX_PID=$!

trap 'kill $USER_PID $PRODUCT_PID $ORDER_PID $PAYMENT_PID $NOTIFICATION_PID $NGINX_PID' TERM INT

wait -n \
  $USER_PID \
  $PRODUCT_PID \
  $ORDER_PID \
  $PAYMENT_PID \
  $NOTIFICATION_PID \
  $NGINX_PID