# Maruf_Ecom Server API Documentation

This document describes all available API routes for the Maruf_Ecom backend, including authentication, user, product, cart, and admin endpoints. Each route includes the HTTP method, endpoint, required parameters, and a description of its functionality.

---

## Base URL

```
http://localhost:5000/
```

---

## Table of Contents

- [Authentication](#authentication)
- [User](#user)
- [Products](#products)
- [Cart](#cart)
- [Admin](#admin)
- [Search](#search)
- [Middleware](#middleware)
- [Error Handling](#error-handling)

---

## Authentication

### Signup

- **POST** `/auth/signup`
- **Body:**  
  ```json
  {
    "email": "user@example.com",
    "password": "yourpassword"
  }
  ```
- **Description:** Registers a new user.

---

### Login

- **POST** `/auth/login`
- **Body:**  
  ```json
  {
    "email": "user@example.com",
    "password": "yourpassword"
  }
  ```
- **Description:** Authenticates a user and returns a JWT token.

---

## User

### Get Session User

- **GET** `/auth/session`
- **Headers:**  
  `Authorization: Bearer <token>`
- **Description:** Returns the currently authenticated user's data.

---

### Update or Add User

- **PUT** `/user`
- **Headers:**  
  `Authorization: Bearer <token>`
- **Body:**  
  ```json
  {
    "email": "user@example.com",
    "name": "User Name",
    "role": "user" // or "admin"
  }
  ```
- **Description:** Updates user data if the user exists, or adds a new user if not.

---

## Products

### Get Products (with Filters)

- **GET** `/products`
- **Query Parameters:**  
  - `category` (optional)
  - `subcategory` (optional)
  - `tags` (optional, comma-separated)
  - `maxPrice` (optional)
  - `rating` (optional)
  - `color` (optional)
- **Description:** Returns a list of products filtered by the provided parameters.

---

### Get Product by Title

- **GET** `/products/:title`
- **Description:** Returns a product matching the given title.

---

## Cart

### Get Cart by User

- **GET** `/cart?email=user@example.com`
- **Headers:**  
  `Authorization: Bearer <token>`
- **Description:** Returns the cart for the specified user.

---

### Add to Cart

- **POST** `/cart`
- **Headers:**  
  `Authorization: Bearer <token>`
- **Body:**  
  ```json
  {
    "email": "user@example.com",
    "productId": "product_id",
    "quantity": 1
  }
  ```
- **Description:** Adds a product to the user's cart.

---

## Admin

> **All admin routes require both `authMiddleware` and `verifyAdmin` middlewares.**

### Admin Dashboard

- **GET** `/admin/dashboard`
- **Headers:**  
  `Authorization: Bearer <admin_token>`
- **Description:** Returns admin dashboard data.

---

## Search

### Search Products

- **GET** `/search?query=keyword&category=all`
- **Description:** Searches products by keyword and optional category.

---

## Middleware

- **authMiddleware:**  
  Protects routes by requiring a valid JWT token.
- **verifyAdmin:**  
  Allows access only to users with the `admin` role.

---

## Error Handling

- All endpoints return appropriate HTTP status codes and error messages for invalid requests, unauthorized access, or server errors.

---

## Example Usage

### Fetch Products by Category

```http
GET /products?category=womens-shopping
```

### Add Product to Cart

```http
POST /cart
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "user@example.com",
  "productId": "123456",
  "quantity": 2
}
```

---

## Notes

- Always include the JWT token in the `Authorization` header for protected routes.
- Admin routes require the user to have the `admin` role.
- All responses are in JSON format.

---

For any questions or issues, please contact the project maintainer.