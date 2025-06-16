# IELTS Practice Platform

A React-based platform for practicing IELTS skills (Reading, Writing, Speaking, and Listening).

## Features

- Interactive UI with modern design
- Separate modules for each IELTS skill:
  - Reading practice
  - Writing practice with AI-powered evaluation
  - Speaking practice
  - Listening practice
- Responsive design for all devices

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository (or navigate to the project directory)

2. Install dependencies
```bash
cd ielts-react
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open your browser and navigate to the URL shown in your terminal (typically http://localhost:5173)

## Project Structure

```
ielts-react/
├── public/              # Static assets
├── src/                 # Source code
│   ├── components/      # React components
│   │   ├── Reading/     # Reading skill components
│   │   ├── Writing/     # Writing skill components
│   │   ├── Speaking/    # Speaking skill components
│   │   ├── Listening/   # Listening skill components
│   │   └── ui/          # Shared UI components
│   ├── lib/             # Utility functions
│   ├── App.jsx          # Main application component
│   ├── App.css          # Application styles
│   ├── main.jsx         # Application entry point
│   └── index.css        # Global styles
├── index.html           # HTML template
├── package.json         # Project dependencies
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── postcss.config.js    # PostCSS configuration
```

## Building for Production

To build the application for production:

```bash
npm run build
```

This will generate a `dist` directory with the production-ready files..