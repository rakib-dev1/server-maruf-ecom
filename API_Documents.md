# Maruf_Ecom User API Documentation

This document describes all user-related API routes for the Maruf_Ecom backend. Each route includes the HTTP method, endpoint, required parameters, and a description of its functionality.

---

## Base URL

```
http://localhost:5000/
```

---

## Table of Contents

- [Authentication](#authentication)
- [User Profile](#user-profile)
- [Products](#products)
- [Cart](#cart)
- [Search](#search)
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

## User Profile

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
    "role": "user"
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

## Search

### Search Products

- **GET** `/search?query=keyword&category=all`
- **Description:** Searches products by keyword and optional category.

---

## Error Handling

- All endpoints return appropriate HTTP status codes and error messages for invalid requests, unauthorized access, or server errors.

---

## Notes

- Always include the JWT token in the `Authorization` header for protected routes.
- All responses are in JSON format.

---
