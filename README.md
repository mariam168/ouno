# Smart Shop - Full-Stack E-commerce Platform

![Project Banner](https://via.placeholder.com/1200x600.png?text=Smart+Shop+E-commerce)

**Smart Shop** is a complete, feature-rich e-commerce platform built with the MERN stack (MongoDB, Express.js, React, Node.js). It provides a seamless shopping experience for users and a powerful dashboard for administrators to manage the store. The platform is fully bilingual (English/Arabic) and designed with a modern, responsive interface.

---

## ✨ Key Features

### For Customers:
- **Bilingual Support:** Full English and Arabic language support, including Right-to-Left (RTL) layout for Arabic.
- **User Authentication:** Secure user registration with email activation, login, and password reset functionality.
- **Product Catalog:** Browse products with advanced filtering by category, sub-category, and price.
- **Product Variations:** Support for products with multiple options (e.g., size, color) and unique SKUs.
- **Shopping Cart:** A fully functional cart to add, update, and remove items.
- **Wishlist:** Save favorite products for later.
- **Discount Codes:** Apply coupon codes at checkout for discounts.
- **Secure Checkout:** A smooth checkout process with shipping information and order summary.
- **Order Tracking:** Users can view their order history and details in their profile.
- **Responsive Design:** A beautiful and functional interface on all devices, from desktops to mobile phones.

### For Administrators (Admin Dashboard):
- **Dashboard Analytics:** Get a quick overview of total revenue, orders, products, and users. View sales charts and top-selling products.
- **Product Management:** Create, Read, Update, and Delete (CRUD) products, including complex variations and image uploads.
- **Category Management:** Manage main categories and nested sub-categories with images and descriptions.
- **Order Management:** View all customer orders, and update payment and delivery statuses.
- **Advertisement Management:** Create and manage promotional ads and offers linked to specific products.
- **Discount Management:** Create and manage discount codes with various rules (percentage, fixed amount, validity dates).
- **Protected Routes:** All admin functionalities are secured and accessible only to users with an 'admin' role.

---

## 🛠️ Technologies Used

### Backend
- **Node.js:** JavaScript runtime environment.
- **Express.js:** Web framework for Node.js.
- **MongoDB:** NoSQL database for storing data.
- **Mongoose:** Object Data Modeling (ODM) library for MongoDB.
- **JSON Web Tokens (JWT):** For secure user authentication.
- **Bcrypt.js:** For hashing passwords.
- **Multer:** For handling file uploads.
- **Nodemailer:** For sending emails (activation, password reset).
- **Dotenv:** For managing environment variables.

### Frontend
- **React.js:** JavaScript library for building user interfaces.
- **React Router:** For client-side routing.
- **Axios:** For making HTTP requests to the backend API.
- **Tailwind CSS:** A utility-first CSS framework for rapid UI development.
- **Lucide React:** For beautiful and consistent icons.
- **React Context API:** For global state management (Authentication, Cart, Wishlist, Language).

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites
- [Node.js](https://nodejs.org/en/) (v16 or later recommended)
- [MongoDB](https://www.mongodb.com/try/download/community) installed and running locally.
- A code editor like [VS Code](https://code.visualstudio.com/).
- A package manager like `npm` or `yarn`.

### Installation & Setup

**1. Clone the Repository:**
```bash
git clone https://github.com/your-username/smart-shop.git
cd smart-shop
```

**2. Setup the Backend:**
- Navigate to the `backend` directory (or your backend root).
- Install dependencies:
  ```bash
  npm install
  ```
- Create a `.env` file in the backend root and add the following variables:
  ```env
  MONGO_URI=mongodb://127.0.0.1:27017/smart-shop-db
  PORT=5000
  JWT_SECRET=your_super_secret_jwt_key
  NODE_ENV=development
  CLIENT_URL=http://localhost:3000

  # Email Configuration (e.g., for Gmail with App Password)
  EMAIL_HOST=smtp.gmail.com
  EMAIL_PORT=587
  EMAIL_USER=your-email@gmail.com
  EMAIL_PASS=your_gmail_app_password
  FROM_EMAIL=noreply@smartshop.com
  FROM_NAME="Smart Shop"
  ```
- Start the backend server:
  ```bash
  npm run dev
  ```
  The server should now be running on `http://localhost:5000`.

**3. Setup the Frontend:**
- Navigate to the `frontend` directory (or your frontend root).
- Install dependencies:
  ```bash
  npm install
  ```
- Create a `.env` file in the frontend root and add the API URL:
  ```env
  REACT_APP_API_BASE_URL=http://localhost:5000
  ```
- Start the React development server:
  ```bash
  npm start
  ```
  The application should now be running on `http://localhost:3000`.

---

## 🔗 API Endpoints Overview

The backend provides a RESTful API. Here are some of the main resources:

- `GET /api/products`: Get all products.
- `GET /api/products/:id`: Get a single product.
- `POST /api/products`: Create a new product (Admin only).
- `GET /api/categories`: Get all categories.
- `POST /api/auth/register`: Register a new user.
- `POST /api/auth/login`: Log in a user.
- `GET /api/cart`: Get the user's shopping cart (Protected).
- `POST /api/cart`: Add an item to the cart (Protected).
- `GET /api/orders`: Get all orders (Admin only).
- `GET /api/orders/myorders`: Get the logged-in user's orders (Protected).

For more details, please refer to the route files in the `backend/routes` directory.

---

## 👤 Author

**Mariam Sameh**
- GitHub: [@mariam168](https://github.com/mariam168)
- LinkedIn: [Your LinkedIn Profile](https://www.linkedin.com/in/your-profile/)

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.