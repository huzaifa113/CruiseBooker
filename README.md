# 🚢 CruiseBooker - Luxury Cruise Booking Platform

A modern, full-stack cruise booking application built with React, TypeScript, Node.js, and PostgreSQL. Features a comprehensive booking system with multi-language support (EN/TH), advanced discount validation, and secure payment processing.

## ✨ Features

### 🎯 Core Functionality
- **Cruise Search & Booking**: Browse and book luxury cruises with advanced filtering
- **Multi-language Support**: Full EN/TH localization with React Context
- **User Authentication**: Secure JWT-based auth with bcrypt password hashing
- **Payment Processing**: Integrated Stripe payment system with multiple currencies
- **Discount System**: Sophisticated deal validation and coupon management
- **Favorites System**: Save and manage favorite cruises
- **Responsive Design**: Mobile-first design with Tailwind CSS

### 💼 Admin Features
- **Cruise Management**: Add, edit, and manage cruise listings
- **Promotion Management**: Create and manage deals with complex conditions
- **User Management**: View and manage user accounts and bookings

### 🔧 Technical Features
- **Real-time Updates**: React Query for efficient data fetching
- **Form Validation**: Robust client and server-side validation
- **Email Integration**: Automated booking confirmations via SendGrid
- **PDF Generation**: Dynamic booking confirmations and invoices
- **Database Seeding**: Comprehensive seed data for development

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** + **shadcn/ui** components
- **React Query** for state management
- **Wouter** for routing
- **React Hook Form** for form handling
- **Stripe Elements** for payments

### Backend
- **Node.js** with Express
- **TypeScript** throughout
- **PostgreSQL** with Drizzle ORM
- **JWT** authentication
- **Stripe** payment processing
- **SendGrid** for email
- **bcrypt** for password hashing

### Infrastructure
- **Neon Database** (PostgreSQL)
- **Express Session** management
- **CORS** enabled
- **Environment-based configuration**

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Stripe account
- SendGrid account (optional, for emails)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/cruise-booker.git
   cd cruise-booker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/cruise_booker"
   
   # JWT Secret
   JWT_SECRET="your-super-secret-jwt-key"
   
   # Session Secret
   SESSION_SECRET="your-session-secret"
   
   # Stripe
   STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
   VITE_STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key"
   
   # SendGrid (Optional)
   SENDGRID_API_KEY="your-sendgrid-api-key"
   FROM_EMAIL="noreply@yourdomain.com"
   
   # App Configuration
   NODE_ENV="development"
   PORT=5000
   ```

4. **Database Setup**
   ```bash
   # Push database schema
   npm run db:push
   
   # Seed with sample data
   npm run dev
   # The app will automatically seed on first run
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5000`

## 📂 Project Structure

```
cruise-booker/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Utilities and contexts
│   │   └── hooks/         # Custom React hooks
├── server/                # Node.js backend
│   ├── routes.ts          # API routes
│   ├── auth.ts            # Authentication logic
│   ├── db.ts              # Database connection
│   └── enhanced-seed.ts   # Database seeding
├── shared/                # Shared TypeScript schemas
└── db/                   # Database migrations
```

## 🎨 Key Components

### Discount System
The application features a sophisticated discount validation system:
- **Complex Conditions**: Date ranges, guest count, minimum spend, coupon codes
- **Multiple Discount Types**: Percentage and fixed amount discounts
- **Real-time Validation**: Immediate feedback on deal eligibility

### Multi-language Support
- **React Context**: Global language state management
- **Comprehensive Translations**: 500+ translation keys for EN/TH
- **Dynamic Switching**: Instant language switching without page reload

### Payment Integration
- **Stripe Elements**: Secure, PCI-compliant payment forms
- **Multi-currency**: USD, EUR, SGD, THB support
- **Payment Intents**: Modern Stripe payment flow

## 🔐 Authentication & Security

- **JWT Tokens**: Secure, stateless authentication
- **Password Hashing**: bcrypt with salt rounds
- **Session Management**: Express sessions with PostgreSQL store
- **Input Validation**: Zod schemas for type-safe validation
- **CORS Configuration**: Proper cross-origin request handling

## 📱 API Endpoints

### Public Routes
- `GET /api/cruises` - List all cruises
- `GET /api/cruises/:id` - Get cruise details
- `GET /api/promotions` - List active promotions

### Authenticated Routes
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/bookings` - Create booking
- `GET /api/favorites` - Get user favorites
- `POST /api/create-payment-intent` - Create Stripe payment

### Admin Routes
- `POST /api/admin/cruises` - Create cruise
- `PUT /api/admin/promotions/:id` - Update promotion
- `GET /api/admin/users` - List users

## 🧪 Testing the Discount System

The project includes comprehensive discount testing:
1. Check `DISCOUNT_SYSTEM_TEST.md` for test scenarios
2. Use the admin panel to create test deals
3. Test validation on the checkout pages

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Environment Variables
Ensure all production environment variables are set:
- Database connection string
- Stripe production keys
- JWT secrets
- SendGrid API key

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run check        # TypeScript type checking
npm run db:push      # Push database schema changes
```

## 🐛 Known Issues

- PDF generation requires puppeteer (optional dependency)
- Email service requires SendGrid configuration
- Some translations may need refinement

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **shadcn/ui** for beautiful UI components
- **Tailwind CSS** for styling system
- **Stripe** for payment processing
- **Neon** for PostgreSQL hosting
- **Vercel** for inspiration on modern web apps

## 📧 Support

For support, email support@yourdomain.com or open an issue on GitHub.

---

Built with ❤️ using React, TypeScript, and Node.js
