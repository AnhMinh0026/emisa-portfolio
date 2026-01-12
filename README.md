# Emisa Makeup Portfolio

A modern, elegant portfolio website for Emisa makeup artist, featuring image galleries, pricing information, and contact details.

## Tech Stack

### Frontend

- React + Vite
- Tailwind CSS
- Framer Motion (animations)
- React Router

### Backend

- Node.js + Express
- Cloudinary (image hosting)

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- Cloudinary account

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/YOUR_USERNAME/emisa-portfolio.git
   cd emisa-portfolio
   ```

2. **Install dependencies**

   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Configure environment variables**

   ```bash
   cd server
   cp .env.example .env
   ```

   Edit `.env` and add your Cloudinary credentials:

   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   PORT=5000
   ```

4. **Run the application**

   Terminal 1 - Start backend:

   ```bash
   cd server
   npm start
   ```

   Terminal 2 - Start frontend:

   ```bash
   cd client
   npm run dev
   ```

5. **Access the website**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## Features

- 🎨 **Image Galleries**: Organized by categories (Beauty, Bridal, Event, Fashion, Editorial)
- ⚡ **Infinite Scroll**: Automatic pagination for better performance
- 🖼️ **Image Optimization**: Cloudinary transformations for fast loading
- 📱 **Responsive Design**: Mobile-friendly interface
- 💰 **Pricing Page**: Service pricing in Vietnamese
- 📞 **Contact Page**: Direct links to Facebook and Zalo

## Project Structure

```
emisa-portfolio/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   └── utils/         # Utility functions
│   └── package.json
├── server/                # Express backend
│   ├── index.js          # API server
│   ├── .env.example      # Environment template
│   └── package.json
└── README.md
```

## License

Private project - All rights reserved
