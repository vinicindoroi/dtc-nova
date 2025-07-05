# BlueDrops VSL Project

## 🚀 Quick Start

### StackBlitz Development
[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/rachinha01/dtc8d)

### Local Development
```bash
npm install
npm run dev
```

## 📋 Project Structure

```
src/
├── components/          # React components
├── hooks/              # Custom hooks
├── pages/              # Page components
└── utils/              # Utility functions
```

## 🔧 Environment Setup

No environment variables needed! The project now works completely standalone without external dependencies.

## 🌐 StackBlitz Collaboration

This project is configured for seamless StackBlitz collaboration:

- **Auto-sync**: Changes sync with GitHub automatically
- **Environment**: Pre-configured with all dependencies
- **Local Analytics**: Events stored in browser localStorage
- **No Database Required**: Fully functional without external services

## 📊 Features

- **VSL Analytics**: Local tracking via localStorage and console
- **External Pixels**: Facebook Pixel, Utmify, Hotjar integration
- **Responsive Design**: Mobile-first approach
- **Performance Optimized**: Fast loading and smooth interactions

## 🔄 Sync Instructions

When working in StackBlitz:

1. **Pull latest changes**: Click "Sync" in StackBlitz
2. **Make your changes**: Edit files normally
3. **Commit changes**: Use StackBlitz Git panel
4. **Push to GitHub**: Changes sync automatically

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📱 Routes

- `/` - Main VSL page
- `/up1bt`, `/up3bt`, `/up6bt` - Upsell pages
- `/dws1`, `/dws2`, `/dw3` - Downsell pages

## 📈 Analytics Events

All events are now tracked locally in browser storage and sent to external pixels:

- `page_enter` - User enters the page
- `video_play` - VTurb video loads successfully
- `video_progress` - User reaches milestones (7:45 lead, 35:55 pitch)
- `pitch_reached` - User reaches pitch moment
- `offer_click` - User clicks purchase buttons
- `page_exit` - User leaves the page

## 🎨 Design System

- **Colors**: Blue gradient theme
- **Typography**: Inter font family
- **Components**: Glassmorphism effects
- **Animations**: Smooth transitions and micro-interactions

## 📊 Local Analytics

Events are stored in browser localStorage and can be viewed in browser dev tools:

```javascript
// View stored events
JSON.parse(localStorage.getItem('analytics_events'))

// View geolocation data
JSON.parse(sessionStorage.getItem('geolocation_data'))
```

## 🔗 External Integrations

- **Facebook Pixel**: Automatic event tracking
- **Utmify**: Brazilian pixel tracking
- **Hotjar**: User behavior recording
- **RedTrack**: Affiliate tracking with CID parameters

## 📞 Support

For technical support or questions about the project, contact the development team.

---

**Note**: This project is now fully standalone and doesn't require any external database or API keys to function.