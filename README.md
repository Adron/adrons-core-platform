# Adron's Core Platform

A multi-tenant web application platform designed to manage multiple web applications and their respective users. This platform provides a centralized solution for managing user access, roles, and permissions across various applications within different tenant contexts.

## Documentation

### Core Documentation
- [Site Purpose and Functionality](docs/site-purpose.md) - Overview of the platform's purpose, features, and benefits
- [Application Architecture](docs/architecture.md) - Technical architecture and implementation details
- [Database Configuration](docs/database-config.md) - Database setup and management guide
- [Database Schema](docs/database-schema.md) - Entity relationships and data model

## Quick Start

### Prerequisites
- Node.js 18 or higher
- PostgreSQL 14 or higher
- npm or yarn package manager

### Installation
1. Clone the repository:
```bash
git clone https://github.com/yourusername/adrons-core-platform.git
cd adrons-core-platform
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Initialize the database:
```bash
npx prisma migrate dev
```

5. Start the development server:
```bash
npm run dev
# or
yarn dev
```

## Key Features

- **Multi-tenant Architecture**: Manage multiple applications and organizations
- **Role-Based Access Control**: Fine-grained permission management
- **User Management**: Centralized user authentication and authorization
- **Application Management**: Register and manage multiple applications
- **Security**: Built-in security features and best practices
- **Scalability**: Designed for growth and performance

## Technology Stack

- **Frontend**: Next.js 14, Material-UI, Tailwind CSS
- **Backend**: Node.js, Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with JWT
- **Testing**: Jest and Cypress

## Contributing

Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue in the GitHub repository or contact the maintainers directly.
