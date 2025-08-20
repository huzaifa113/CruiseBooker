# Phoenix Vacation Group - Cruise Booking Platform

## Overview

This is a modern cruise booking platform built as a full-stack web application. The system enables users to search for cruises, view detailed itineraries, book cabins with various extras, and manage reservations. The platform features a responsive React frontend with a Node.js/Express backend, integrated with Stripe for payment processing and PostgreSQL for data storage.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side navigation
- **State Management**: TanStack Query for server state management
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Forms**: React Hook Form with Zod validation

The frontend follows a component-based architecture with separate pages for home, search results, booking flow, checkout, confirmation, and reservation management. Key design patterns include:
- Shared UI components in `/components/ui/`
- Page-specific components organized by feature
- Custom hooks for common functionality
- Type-safe API interactions with shared schemas

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database ORM**: Drizzle ORM for type-safe database operations
- **API Design**: RESTful API with structured error handling
- **File Structure**: Separation of concerns with dedicated files for routes, storage layer, and database configuration

The backend implements a layered architecture:
- Route handlers in `/server/routes.ts` for HTTP request processing
- Storage layer abstraction in `/server/storage.ts` for database operations
- Database connection and schema management in `/server/db.ts`

### Data Storage Solutions
- **Primary Database**: PostgreSQL hosted on Neon
- **ORM**: Drizzle ORM with migrations in `/migrations/`
- **Schema**: Shared TypeScript schemas in `/shared/schema.ts`

Database schema includes:
- `cruises` table for cruise information with JSON itinerary data
- `cabin_types` table for different accommodation options
- `bookings` table for reservation management
- `extras` table for additional services and packages

### Authentication and Authorization
The current implementation uses session-based storage without complex authentication. Session management is handled through:
- Express session middleware
- PostgreSQL session store via `connect-pg-simple`
- Basic booking confirmation lookup system

### External Service Integrations

#### Payment Processing
- **Stripe Integration**: Full payment flow with Stripe Elements
- **Payment Intent Creation**: Server-side payment intent management
- **Webhook Support**: Ready for payment status updates
- **Multi-currency Support**: Built-in currency selection

#### Development Tools
- **Replit Integration**: Special development mode detection and tooling
- **Vite Runtime Error Overlay**: Enhanced development experience
- **Hot Module Replacement**: Fast development iteration

#### Email and Calendar (Planned)
The codebase includes placeholders for:
- Email confirmation systems
- Calendar integration for cruise dates
- PDF invoice generation

### Design Patterns and Architectural Decisions

**Monorepo Structure**: Single repository with client, server, and shared code for easier development and deployment.

**Type Safety**: End-to-end TypeScript with shared schemas between frontend and backend to prevent runtime errors.

**Component Composition**: Radix UI primitives allow for accessible, customizable components while maintaining design consistency.

**Query Management**: TanStack Query provides caching, background updates, and error handling for API calls.

**Progressive Enhancement**: The booking flow is designed as a multi-step process with state management to handle complex user interactions.

**Responsive Design**: Mobile-first approach with Tailwind CSS breakpoints for optimal user experience across devices.