# 🛍️ E-Commerce Backend API

> A robust and scalable e-commerce backend system built with Node.js, Express, and MongoDB, featuring advanced authentication, product management, and inventory control.

[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-v4.18+-blue.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-v6.0+-green.svg)](https://www.mongodb.com/)
[![JWT](https://img.shields.io/badge/JWT-Authentication-orange.svg)](https://jwt.io/)

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technical Highlights](#technical-highlights)
- [Architecture](#architecture)
- [API Endpoints](#api-endpoints)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)
- [Security Features](#security-features)
- [Performance Optimization](#performance-optimization)
- [Future Enhancements](#future-enhancements)

## 🎯 Overview

This project is a production-ready e-commerce backend API designed with enterprise-level architecture patterns. It implements secure authentication, comprehensive product management, and real-time inventory tracking systems.

## ✨ Key Features

### 🔐 Authentication & Authorization

- **JWT-based Authentication** with access & refresh token mechanism
- **Dual Algorithm Support**: RS256 (asymmetric) and HS256 (symmetric) encryption
- **Public/Private Key Management** using RSA 4096-bit encryption
- **Token Refresh Flow** with used token tracking to prevent replay attacks
- **Secure Logout** with token invalidation
- **API Key Validation** for additional security layer

### 👤 User Management

- **Shop Registration & Login** with bcrypt password hashing
- **Role-based Access Control** (SHOP, WRITER, EDITOR, ADMIN)
- **User Profile Management** with selective field exposure
- **Session Management** with keystore tracking

### 📦 Product Management

- **Factory Pattern Implementation** for multiple product types (Clothing, Electronics, Furniture)
- **Product CRUD Operations** with validation
- **Draft & Publish System** for product lifecycle management
- **Product Search** with advanced filtering
- **Inventory Integration** for stock management
- **Image Upload Support** with thumbnail generation
- **Product Attributes** with dynamic schema based on type

### 📊 Inventory System

- **Real-time Stock Tracking**
- **Reservation System** for cart items
- **Stock Location Management**
- **Low Stock Alerts**

### 🔍 Advanced Features

- **Full-text Search** across products
- **Pagination** for large datasets
- **Soft Delete** mechanism
- **Audit Logging** for critical operations
- **Error Handling** with custom error classes
- **Request Validation** with middleware

## 🏗️ Technical Highlights

### Design Patterns Implemented

1. **Factory Pattern**

   - Dynamic product type creation (Clothing, Electronics, Furniture)
   - Extensible for new product categories

2. **Repository Pattern**

   - Abstraction layer for data access
   - Centralized database operations

3. **Singleton Pattern**

   - Database connection management
   - Controller instances

4. **Middleware Pattern**
   - Authentication & Authorization
   - Error handling
   - Request validation
   - API key verification

### Advanced MongoDB Operations

- **Lean Queries** for performance optimization
- **Aggregation Pipelines** for complex data transformations
- **Indexing Strategy** for faster queries
- **Reference Relationships** between collections
- **Schema Validation** at database level

### Security Implementation

```javascript
// RSA Key Generation for JWT
crypto.generateKeyPairSync('rsa', {
    modulusLength: 4096,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

// Bcrypt Password Hashing
await bcrypt.hash(password, 10);

// JWT Token Creation
JWT.sign(payload, secret, {
    algorithm: 'HS256',
    expiresIn: '2 days'
});

🛠️ Architecture
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  API Route  │ ◄─── Express Router
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Middleware  │ ◄─── Auth, Validation, Error Handling
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Controller  │ ◄─── Request Handler
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Service    │ ◄─── Business Logic (Factory Pattern)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Repository  │ ◄─── Data Access Layer
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  MongoDB    │ ◄─── Database
└─────────────┘


📡 API Endpoints
POST   /v1/api/shop/signup          # Register new shop
POST   /v1/api/shop/login           # Login and get tokens
POST   /v1/api/shop/logout          # Logout and invalidate token
POST   /v1/api/shop/refresh-token   # Refresh access token

Products
# Public Endpoints
GET    /v1/api/product/search/:keySearch    # Search products
GET    /v1/api/product                      # Get all products
GET    /v1/api/product/:id                  # Get product by ID

# Protected Endpoints (Requires Authentication)
POST   /v1/api/product                      # Create new product
PATCH  /v1/api/product/:id                  # Update product
GET    /v1/api/product/drafts/all           # Get draft products
GET    /v1/api/product/publish/all          # Get published products
POST   /v1/api/product/publish/:id          # Publish product
POST   /v1/api/product/unPublish/:id        # Unpublish product

Request Headers
x-api-key: YOUR_API_KEY              # Required for all requests
x-client-id: USER_ID                 # Required for protected routes
authorization: ACCESS_TOKEN           # Required for protected routes
x-rf-token: REFRESH_TOKEN            # Required for token refresh


🚀 Installation
Prerequisites
Node.js v18 or higher
MongoDB v6.0 or higher
npm or yarn
Setup Steps
1. Clone the repository
git clone https://github.com/yourusername/ecommerce-backend.git
cd ecommerce-backend

2.Install dependencies
npm install

3. Create environment file
cp .env.example .env

4. Configure environment variables (see section below)

5. Start MongoDB
# If using local MongoDB
mongod

# Or use MongoDB Atlas connection string in .env

6. Run the application
# Development mode
npm run dev

# Production mode
npm start

```
