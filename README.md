# Circlify 🎯

A fun and challenging circle-drawing game where players compete to draw the most perfect circle possible within a time limit. 
Test your precision and compete with others on the global leaderboard!

## Description

Circlify is an interactive web-based game that challenges players to draw a perfect circle using their mouse or touch input. The game uses advanced mathematical algorithms to calculate how close your drawing is to a perfect circle, providing instant feedback and scoring. Players can compete globally through the leaderboard system and track their personal best scores.

## Features

### 🎮 Core Gameplay
- **Real-time Circle Drawing**: Draw circles using mouse or touch input
- **Perfection Scoring**: Advanced algorithm calculates how close your drawing is to a perfect circle
- **Time Challenge**: 5-second time limit adds excitement and pressure
- **Visual Feedback**: Real-time visual indicators and scoring display

### 🏆 Competition & Social
- **Global Leaderboard**: Compete with players worldwide using Supabase backend
- **Personal Best Tracking**: Save and track your highest scores locally
- **Social Sharing**: Share your achievements on Twitter with custom generated tweets
- **Username System**: Customize your leaderboard entries

### 🎨 User Experience
- **Beautiful UI**: Modern gradient design with smooth animations
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Audio Feedback**: Celebration sounds for high scores and timeout alerts
- **Offline Support**: Fallback to localStorage when offline
- **Device ID System**: Prevents duplicate entries while maintaining privacy

### 🔧 Technical Features
- **Real-time Analytics**: Vercel Analytics integration for performance monitoring
- **Progressive Web App**: Fast loading and smooth performance
- **TypeScript**: Full type safety and better development experience
- **Modern Build System**: Vite for lightning-fast development and builds

## Tech Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe JavaScript development
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework for styling
- **Lucide React** - Beautiful and customizable icons

### Backend & Database
- **Supabase** - Backend-as-a-Service with PostgreSQL database
- **Real-time Database** - Live leaderboard updates
- **Row Level Security** - Secure data access

### Development Tools
- **ESLint** - Code linting and quality assurance
- **PostCSS** - CSS processing and optimization
- **Autoprefixer** - Automatic CSS vendor prefixing

### Analytics & Monitoring
- **Vercel Analytics** - Performance and user analytics
- **Error Handling** - Comprehensive error handling with fallbacks

### Audio
- **Web Audio API** - Custom sound effects for game feedback

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Circlify
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory, ready for deployment.

## How to Play

1. **Wait for the countdown** - The game starts with a 5-second timer
2. **Draw your circle** - Use your mouse or finger to draw a circle
3. **Complete the circle** - Try to close the circle by connecting the start and end points
4. **Get your score** - The game calculates your perfection percentage
5. **Save your score** - Enter a username to save to the leaderboard
6. **Try again** - Challenge yourself to beat your personal best!

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.


---

**Challenge yourself, compete globally, and draw the perfect circle!** 🎯✨ 