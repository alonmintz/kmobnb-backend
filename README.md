# kmobnb-backend 🏡

This is the backend service for **KmoBnb**, an Airbnb-style web application. It provides RESTful API endpoints for managing stays, users, orders, authentication, reviews, and more. The backend is built with **Node.js**, **Express**, and **MongoDB**.

---

## 🔧 Tech Stack

- **Node.js** + **Express** – REST API server
- **MongoDB** – Database for storing stays, users, orders, etc.
- **Cors** – Handles cross-origin requests
- **Cookie-parser** – Manages sessions and auth tokens
- **Dotenv** – Environment configuration
- **Render** – Hosting (for production deployment)

---

## 📁 Project Structure

kmobnb-backend/    
├── api/ # Routes, Controllers ad services for each resource (stay, user, auth, order, review)    
├── services/ # General services (eg. socket.service, util.service)    
├── middlewares/ # Custom middleware for auth, logging, etc.    
├── config.js # Configuration file    
├── server.js # Entry point    
└── README.md    

---

## ⚙️ Setup & Run Locally

### 1. Clone the repo

```bash
git clone https://github.com/alonmintz/kmobnb-backend.git
cd kmobnb-backend
```
### 2. Install dependencies
```bash
npm install
```
### 3. Create .env file
Create a .env file in the root folder with the following variables:

```env
PORT=3030
MONGO_URL=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/kmobnb_db
```
Replace <username>, <password>, and <cluster> with your actual MongoDB Atlas credentials.

### 4. Run the server (development mode)
```bash
npm run server:dev
```
The server will run at: http://localhost:3030

## 📦 Example API Endpoints  
GET /api/stay – Get all stays

GET /api/stay/:id – Get a single stay

POST /api/order – Create a new reservation

POST /api/auth/login – Log in

POST /api/auth/signup – Sign up

GET /api/user – Get all users

## 🔐 Authentication  
Authentication is handled using session cookies.

On login, the backend sets a secure HTTP-only cookie.

Protected routes check for a valid session before proceeding.

## 🚀 Deployment  
This project is ready for deployment on Render or similar Node.js-friendly platforms.

Environment variables should be defined in Render's Environment settings.

Make sure VITE_API_URL on the frontend points to /api.

## 📌 Related Projects  
Frontend Repository: [kmobnb-frontend](https://github.com/alonmintz/kmobnb-frontend)

## 🧑‍💻 Authors  
Alon Mintz: [Github](https://github.com/alonmintz) 
Eyal Kravitz: [Github](https://github.com/keyal)   
 

