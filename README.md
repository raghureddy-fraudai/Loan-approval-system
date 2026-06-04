<div align="center">
  <img width="1200" height="475" alt="Loan Approval System Banner" src="./assets/.aistudio/image_78dbe85b.png" />
</div>

# Loan Approval System

An AI-powered enterprise banking workflow application designed to automate loan evaluation, risk assessment, compliance verification, and approval decisioning using intelligent business rules and workflow automation.

## Overview

The Loan Approval System streamlines the lending process by automating critical decision-making workflows. It enables financial institutions to evaluate loan applications faster, reduce manual effort, ensure regulatory compliance, and minimize risk exposure through intelligent algorithms and customizable business rules.

### Key Benefits

- ⚡ **Faster Processing** - Reduce loan evaluation time from days to minutes
- 🎯 **Consistent Decisions** - Eliminate bias with rule-based decisioning
- 📋 **Compliance Ready** - Built-in regulatory compliance verification
- 🔒 **Risk Mitigation** - AI-powered risk scoring and assessment
- ⚙️ **Flexible Configuration** - Customize business rules without code changes

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Usage](#usage)
- [Building for Production](#building-for-production)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

## Features

- **Automated Loan Evaluation** - Intelligent assessment of loan applications using historical data and AI models
- **Risk Assessment** - AI-powered risk evaluation and scoring with customizable risk tiers
- **Compliance Verification** - Automated regulatory compliance checking (KYC, AML, etc.)
- **Approval Decisioning** - Smart workflow-based decision making with approval chains
- **Business Rules Engine** - Customizable business logic automation without code deployment
- **Real-time Dashboards** - Monitor loan pipeline and approval metrics
- **Audit Trail** - Complete logging of all decisions and approvals

## Tech Stack

- **Frontend:** TypeScript (98.4%), React
- **Styling:** CSS (1.3%)
- **Markup:** HTML (0.3%)
- **Build Tool:** Webpack/Vite
- **Package Manager:** npm or yarn

## Getting Started

### Prerequisites

- **Node.js** v16 or higher ([Download](https://nodejs.org/))
- **npm** v7+ or **yarn** v1.22+
- A modern web browser (Chrome, Firefox, Safari, or Edge)
- Git

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/raghureddy-fraudai/loan-approval-system.git
   cd loan-approval-system
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```
   Or with yarn:
   ```bash
   yarn install
   ```

### Configuration

3. **Set up environment variables:**
   - Create a `.env.local` file in the root directory:
   ```bash
   cp .env.example .env.local
   ```

   - Configure the following required variables in `.env.local`:
   ```env
   # API Configuration
   REACT_APP_API_URL=http://localhost:8000/api
   REACT_APP_AUTH_TOKEN=your_api_token_here
   
   # Feature Flags
   REACT_APP_ENABLE_RISK_ASSESSMENT=true
   REACT_APP_ENABLE_COMPLIANCE_CHECK=true
   
   # UI Configuration
   REACT_APP_ENVIRONMENT=development
   ```

### Quick Start

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   Or with yarn:
   ```bash
   yarn dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:3000` and you should see the application dashboard.

## Project Structure

```
loan-approval-system/
├── src/
│   ├── components/              # Reusable React components
│   │   ├── LoanForm/           # Loan application form component
│   │   ├── RiskAssessment/     # Risk scoring display
│   │   ├── ApprovalWorkflow/   # Approval workflow UI
│   │   └── Dashboard/          # Main dashboard component
│   ├── pages/                   # Page-level components (routing)
│   │   ├── ApplicationPage.tsx
│   │   ├── DashboardPage.tsx
│   │   └── SettingsPage.tsx
│   ├── services/                # API and business logic services
│   │   ├── loanService.ts      # Loan evaluation logic
│   │   ├── riskService.ts      # Risk assessment service
│   │   ├── complianceService.ts # Compliance verification
│   │   └── apiClient.ts        # HTTP client
│   ├── styles/                  # Global and component styles
│   │   ├── globals.css
│   │   └── variables.css
│   ├── utils/                   # Utility functions
│   ├── types/                   # TypeScript type definitions
│   ├── App.tsx                  # Root component
│   └── index.tsx                # Application entry point
├── public/                       # Static assets
│   ├── index.html
│   └── favicon.ico
├── assets/                       # Application images and media
├── .env.example                  # Environment variables template
├── package.json
├── tsconfig.json
├── webpack.config.js            # Build configuration (if applicable)
└── README.md
```

## Usage

### Basic Workflow

1. **Submit Loan Application**
   - Fill out the loan application form with applicant details
   - System auto-validates required fields

2. **Risk Assessment**
   - AI model evaluates application against historical data
   - Risk score is generated (Low, Medium, High, Critical)

3. **Compliance Check**
   - Automated verification against KYC/AML regulations
   - Sanctions list screening

4. **Approval Decision**
   - Business rules engine applies configured policies
   - Generates approval recommendation or flags for manual review

5. **Workflow Routing**
   - Automatically routes to appropriate approver based on amount and risk
   - Sends notifications for pending approvals

### Example: Programmatic Loan Submission

```typescript
import { loanService } from './services/loanService';

const applicationData = {
  applicantName: 'John Doe',
  loanAmount: 50000,
  loanTerm: 36,
  creditScore: 720,
  annualIncome: 75000,
};

// Submit and evaluate loan
const result = await loanService.evaluateLoan(applicationData);
console.log('Risk Score:', result.riskScore);
console.log('Recommendation:', result.recommendation);
```

## Building for Production

### Create an optimized production build:

```bash
npm run build
```

Or with yarn:
```bash
yarn build
```

The build artifacts will be stored in the `dist/` directory.

### Serve the production build locally:

```bash
npm run preview
```

## Troubleshooting

### Port Already in Use

If port 3000 is already in use:
```bash
# Linux/Mac - Find and kill process on port 3000
lsof -i :3000
kill -9 <PID>

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

Or specify a different port:
```bash
PORT=3001 npm run dev
```

### Node Version Conflicts

Verify you have the correct Node.js version:
```bash
node --version  # Should be v16 or higher
npm --version   # Should be v7 or higher
```

If you have multiple Node versions installed, use nvm:
```bash
nvm use 16
```

### Dependencies Installation Issues

Clear npm cache and reinstall:
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Environment Variables Not Loading

- Ensure `.env.local` is in the root directory (not in `src/`)
- Variables must be prefixed with `REACT_APP_` to be accessible
- Restart the dev server after changing `.env.local`

### Blank Page on Localhost

Check browser console for errors:
1. Open Developer Tools (F12)
2. Check the Console tab for error messages
3. Verify API endpoint is accessible
4. Clear browser cache and reload

## Contributing

We welcome contributions! Please follow these guidelines:

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and commit: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Style

- Follow TypeScript and React best practices
- Use meaningful variable and function names
- Add comments for complex logic
- Ensure all tests pass before submitting PR

### Running Tests

```bash
npm run test
```

Run tests with coverage:
```bash
npm run test:coverage
```

### Linting and Formatting

```bash
# Run ESLint
npm run lint

# Fix linting issues
npm run lint:fix

# Format code with Prettier
npm run format
```

## License

This project is licensed under the **MIT License** - see the [LICENSE](./LICENSE) file for details.

### MIT License Summary
- ✅ Commercial use
- ✅ Modification
- ✅ Distribution
- ✅ Private use
- ❌ Liability
- ❌ Warranty

## Support

Have questions or found a bug? We're here to help!

- **Issues:** [Open an issue](https://github.com/raghureddy-fraudai/loan-approval-system/issues)
- **Discussions:** [Start a discussion](https://github.com/raghureddy-fraudai/loan-approval-system/discussions)
- **Pull Requests:** [Submit a PR](https://github.com/raghureddy-fraudai/loan-approval-system/pulls)

### Reporting Security Issues

Please do not open public issues for security vulnerabilities. Instead, email security concerns directly to the maintainers.

---

**Last Updated:** June 2024  
**Maintainer:** raghureddy-fraudai  
**Repository:** [loan-approval-system](https://github.com/raghureddy-fraudai/loan-approval-system)
