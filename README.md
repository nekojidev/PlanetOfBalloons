# Planet of Balloons 🎈

<div align="center">
    <img src="https://cdn.pixabay.com/photo/2023/02/11/17/56/balloon-planet-logo-512.png" alt="Planet of Balloons Logo" width="200" />
</div>

Planet of Balloons is a full-stack e-commerce platform for a balloon store, offering a wide range of balloons and accessories for various occasions. The application provides both customer-facing features and admin management tools.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Admin Dashboard](#admin-dashboard)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### Customer Features
- Browse products by categories
- View product details and images
- Add products to cart
- Checkout process with multiple delivery options
- Customer accounts & order history
- View active promotions and announcements
- Contact form for inquiries

### Admin Features
- Comprehensive dashboard with sales statistics
- Product management (add, edit, delete)
- Category management
- Order management with status updates
- User management
- Promotion and discount management
- Announcement management
- Contact message management

## 🛠️ Tech Stack

### Frontend
- React.js with TypeScript
- React Router for navigation
- Tailwind CSS with shadcn/ui components
- Axios for API requests
- React Hook Form with Zod for form validation
- Zustand for state management
- Recharts for data visualization

### Backend
- Node.js with Express
- MongoDB with Mongoose ODM
- JWT authentication
- Cloudinary for image storage
- Various security packages (helmet, xss-clean, etc.)

## 📁 Project Structure

```
PlanetOfBalloons/
├── frontend/               # React frontend
│   ├── public/             # Static files
│   └── src/
│       ├── components/     # UI components
│       ├── hooks/          # Custom React hooks
│       ├── lib/            # Utility functions
│       ├── pages/          # Page components
│       └── ...
├── backend/                # Express.js backend
│   ├── config/             # Configuration files
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Express middlewares
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   └── utils/              # Utility functions
└── ...
```

## 🚀 Installation

1. Clone the repository
```bash
git clone https://github.com/Kurlyk818/PlanetOfBalloons.git
cd PlanetOfBalloons
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Install frontend dependencies
```bash
cd ../frontend
npm install
```

## 🔧 Environment Variables

### Backend (.env)
- `PORT` - Server port (default: 3000)
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT token generation
- `JWT_LIFETIME` - JWT token expiration time (e.g., `30d`)
- `LIQPAY_PUBLIC_KEY` - Public key for LiqPay payment gateway
- `LIQPAY_PRIVATE_KEY` - Private key for LiqPay payment gateway
- `CLIENT_URL` - Frontend URL (default: `http://localhost:5173`)
- `SERVER_URL` - Backend URL (default: `http://localhost:3000`)
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name for image storage
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret

### Frontend (.env)
- `VITE_API_URL` - Backend API URL

## 🖥️ Usage

1. Start the backend server
```bash
cd backend
npm run dev
```

2. Start the frontend development server
```bash
cd frontend
npm run dev
```

3. Access the application
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000/api/v1`

## 📡 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/logout` - Logout

### Products
- `GET /api/v1/products` - Get all products
- `GET /api/v1/products/:id` - Get product details
- `POST /api/v1/products` - Add a new product (admin only)
- `PUT /api/v1/products/:id` - Update product (admin only)
- `DELETE /api/v1/products/:id` - Delete product (admin only)

### Categories
- `GET /api/v1/categories` - Get all categories
- `POST /api/v1/categories` - Create a category (admin only)
- `PUT /api/v1/categories/:id` - Update category (admin only)
- `DELETE /api/v1/categories/:id` - Delete category (admin only)

### Orders
- `POST /api/v1/orders` - Create a new order
- `GET /api/v1/orders` - Get user orders
- `GET /api/v1/orders/:id` - Get order details
- `PUT /api/v1/orders/:id` - Update order status (admin only)

### Announcements
- `GET /api/v1/announcements` - Get all announcements
- `POST /api/v1/announcements` - Create announcement (admin only)
- `PUT /api/v1/announcements/:id` - Update announcement (admin only)
- `DELETE /api/v1/announcements/:id` - Delete announcement (admin only)

### Contact
- `POST /api/v1/contact` - Submit a contact form
- `GET /api/v1/contact` - Get contact messages (admin only)

## 👨‍💼 Admin Dashboard

Access the admin dashboard by logging in with admin credentials at:
```
http://localhost:5173/admin
```

Default admin account:
- Email: admin@example.com
- Password: password123

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Created with ❤️ by Sasha Baranovskyi(https://github.com/Kurlyk818)
