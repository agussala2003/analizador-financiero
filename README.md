# 📈 Financial Instruments Analyzer

A comprehensive and modern financial analysis dashboard built with React, Vite, Tailwind CSS, and Supabase. Allows users to search, compare, and analyze financial instruments through multiple interactive views, export customized reports, and more.

## 📋 Table of Contents
- [About](#about-the-project)
- [Key Features](#key-features)
- [Screenshots](#screenshots)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## 🔍 About the Project

This application offers professional-grade tools for investors and market enthusiasts to make informed decisions. Users can register, search for stock tickers, and access a dashboard with price analysis, fundamentals, correlations, and visual comparisons. The architecture is based on a role system that manages access to different features and API usage limits.

## ✨ Key Features

### 🔐 Secure Authentication
Complete registration, login, password recovery, and email verification system managed with Supabase Auth.

### 📊 Interactive Dashboard
Central panel where users can add and remove tickers for dynamic, real-time analysis.

### 📈 Multiple Analysis Views

- **Prices and Volatility**: Table with current prices, daily/monthly/annual variations, and risk metrics like Beta and Sharpe Ratio.
- **Fundamental Indicators**: Detailed, collapsible tables with valuation metrics, profitability, and financial health, with color "traffic lights" for easy interpretation.
- **Correlation Matrix**: Visualization of correlation between daily returns of selected assets.
- **Visual Comparison (Radar)**: Individual radar charts to compare strengths and weaknesses of each asset across 6 key metrics.
- **Smart Summary**: Automated analysis highlighting the best asset in each category and summarizing individual strengths of each selected company.

### 📄 Report Exports
Export all analysis tables to CSV, XLSX, and PDF. PDFs are generated with a dark theme and colors consistent with the UI.

### 📱 Dedicated Pages
- **Dividend Calendar**: A view to check upcoming dividends, with filters and an integrated calculator.
- **Financial News**: Aggregator of the latest market news.
- **Suggestion Box**: A system for users to submit feedback and view the status of their suggestions.

### 👥 Role System
User management with roles (Basic, Plus, Premium, Administrator) that limits the number of daily API queries, managed through the Supabase database.

### 🛡️ Admin Panel
Protected section for administrators to manage users, review suggestions, and view usage statistics.

## 📸 Screenshots
*Coming soon*

## 🛠️ Tech Stack

### Frontend
- **Framework**: React
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **Charts**: Recharts

### Backend & Infrastructure
- **Backend-as-a-Service**: Supabase
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Edge Functions**: Used as a secure proxy for the financial data API

### Document Export
- **PDF**: jsPDF & jspdf-autotable
- **Excel**: SheetJS (xlsx)
- **Logging**: Custom logging system that records events in a Supabase table

## 🚀 Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/financial-instruments-analyzer.git

# Navigate to the project directory
cd financial-instruments-analyzer

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Start the development server
npm run dev
```

## 💻 Usage
1. Register an account or log in
2. Search for stock tickers in the search bar
3. Add selected tickers to your dashboard
4. Explore different analysis views
5. Export reports as needed

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License
This project is licensed under the MIT License - see the LICENSE file for details.