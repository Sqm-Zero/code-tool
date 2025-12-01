# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Vue 3 + TypeScript frontend toolset application built with Vite, providing various developer utilities including code comparison, JSON formatting, code formatting, Base64 encoding/decoding, hash generation, regex testing, timestamp conversion, naming convention conversion, and todo management.

## Development Commands

```bash
# Install dependencies (supports npm, pnpm, or yarn)
npm install

# Start development server (auto-opens browser on 0.0.0.0)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## Architecture

### Core Stack
- **Build Tool**: Vite 4 with ES modules
- **Framework**: Vue 3 (Composition API with `<script setup>`)
- **Language**: TypeScript
- **Routing**: Vue Router 4 (Hash mode, NOT History mode)
- **State Management**: Pinia
- **UI Library**: Element Plus (configured with zh-CN locale)
- **Styling**: SCSS + Tailwind CSS + PostCSS

### Project Structure

```
src/
├── apis/           # API request modules (user, email)
├── assets/         # Static assets and SVG icons
├── components/     # Global components (registered in components/index.ts)
├── router/         # Router configuration
│   ├── index.ts    # Router instance (hash mode, scroll behavior)
│   └── routes.ts   # Route definitions (constantRoute array)
├── store/          # Pinia stores
│   ├── index.ts    # Pinia instance
│   └── modules/    # Individual store modules (e.g., user.ts)
├── styles/         # Global styles
│   ├── index.scss  # Main entry (imported in main.ts)
│   ├── reset.scss  # CSS reset
│   ├── tailwind.css # Tailwind directives
│   └── variable.scss # SCSS variables (auto-imported globally)
├── utils/          # Utility functions (request, token, date, time)
├── views/          # Page components
│   ├── home/       # Homepage
│   ├── tools/      # Tool pages (diff, json, format, etc.)
│   ├── login/      # Login page
│   └── 404/        # 404 page
├── App.vue         # Root component with LoadingScreen
└── main.ts         # Application entry point
```

### Key Configuration Details

**Vite Configuration** (vite.config.ts):
- Base path: `'./'` (relative, suitable for deployment to subdirectories)
- Path alias: `@` → `src`
- SCSS global variables auto-imported via `additionalData`
- SVG icons plugin configured to scan `src/assets/icons`
- Custom music scanner plugin that auto-generates `public/music/music-list.json`
- Proxy configuration reads from `.env.development` (VITE_APP_BASE_API → VITE_SERVE)

**Router**:
- Uses `createWebHashHistory()` (NOT browser history mode)
- All routes defined in `src/router/routes.ts` as `constantRoute`
- Auto-scrolls to top on navigation
- Catch-all route redirects to `/404`

**Global Component Registration**:
- Components are registered globally via `src/components/index.ts` plugin
- Currently registered: `SvgIcon`
- Add new global components to the `components` object in this file

**API Requests**:
- Axios wrapper in `src/utils/request.ts`
- Request interceptor adds `Authorization: Bearer ${token}` from localStorage `authorize` key
- Response interceptor handles HTTP errors and shows Element Plus messages
- Base URL from `VITE_APP_BASE_API` environment variable

**Application Initialization** (main.ts):
- Sets document title from `VITE_APP_TITLE` environment variable
- Implements visibility change listener (changes title when tab is hidden)
- Element Plus configured with Chinese locale
- Global styles loaded: index.scss, tailwind.css
- SVG icons require `virtual:svg-icons-register` import

**Loading Screen**:
- App.vue shows full-screen loading animation on initial load
- Minimum display time: 1.5 seconds
- Waits for `window.load` event OR timeout

**Environment Variables**:
- Development config in `.env.development`
- Variables must be prefixed with `VITE_` to be exposed
- Key variables: `VITE_APP_TITLE`, `VITE_APP_BASE_API`, `VITE_SERVE`

## Custom Vite Plugin

**Music Scanner Plugin** (vite-plugin-music-scanner.ts):
- Auto-scans `public/music/` folder for audio files (.mp3, .wav, .ogg, .m4a, .aac, .flac)
- Generates `public/music/music-list.json` with music metadata
- Preserves custom `displayName` fields when regenerating
- Watches music folder for changes in dev mode (debounced 300ms)
- Sends WebSocket event `music-list-updated` when files change

## Adding New Tool Pages

1. Create Vue component in `src/views/tools/[tool-name].vue`
2. Add route to `src/router/routes.ts` in `constantRoute` array:
   ```typescript
   {
     path: '/tools/[tool-name]',
     component: () => import('@/views/tools/[tool-name].vue'),
     name: 'tools-[tool-name]',
     meta: { title: 'Tool Display Name' }
   }
   ```
3. Add card to homepage (`src/views/home/index.vue`) if needed

## Styling Guidelines

- SCSS variables available globally (defined in `src/styles/variable.scss`)
- Tailwind utility classes available throughout
- Element Plus theme can be customized
- Use `@/styles/` alias for style imports
- PostCSS with Autoprefixer automatically adds vendor prefixes

## Important Notes

- **Router mode is HASH**, not browser history (affects deployment and URLs)
- **All environment variables** must start with `VITE_` prefix
- **Global components** must be registered in `src/components/index.ts`
- **SCSS variables** are auto-imported, no need for manual `@use` statements
- **Token management** uses localStorage key `authorize`
- **Axios base URL** is configured via environment variables, not hardcoded
- **SVG icons** require registration via vite-plugin-svg-icons (iconDirs in vite.config.ts)
