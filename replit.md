# OnePercent MVP

## Project Overview
Vue 3 + Vite application for personal life management and goal tracking through daily 1% improvements (OnePercent system).

## Tech Stack
- **Frontend**: Vue 3, Vite, Vue Router, Pinia (state management)
- **Language**: JavaScript/ES modules
- **Build System**: Vite

## Project Structure
```
src/
  ├── components/       # Vue components
  ├── views/           # Page views  
  ├── router/          # Vue Router config
  ├── stores/          # Pinia stores
  ├── assets/          # Styles and static assets
  ├── App.vue          # Root component
  └── main.js          # Entry point
```

## Setup Instructions
The project is configured to run on `0.0.0.0:5000` for Replit compatibility.

## Running the Project
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## Recent Changes
- Configured Vite server to listen on 0.0.0.0:5000 with allowedHosts enabled for Replit proxy compatibility
- Updated vite.config.js for Replit environment
