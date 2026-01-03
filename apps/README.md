# Games Apps Directory

This directory contains all game modules for the platform. Each game is a self-contained module that can be easily added, removed, or updated.

## Directory Structure

```
apps/
├── crash/
│   ├── index.js          # Main game component
│   ├── metadata.json     # Game metadata (rules, features, etc.)
│   └── README.md         # Game-specific documentation (optional)
├── dice-roll/
│   ├── index.js
│   ├── metadata.json
│   └── ...
└── [game-name]/
    ├── index.js
    ├── metadata.json
    └── ...
```

## Adding a New Game

To add a new game to the platform, follow these steps:

### 1. Create Game Folder

Create a new folder in `apps/` with your game's slug name (lowercase, hyphenated):

```bash
mkdir apps/my-new-game
```

### 2. Create Game Component

Create `apps/my-new-game/index.js` with your game component:

```javascript
'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '@/hooks/useTranslation'

export default function MyNewGame({ isLauncher = false }) {
  const { t } = useTranslation()
  
  // Your game logic here
  
  return (
    <div className="game-container">
      {/* Your game UI here */}
    </div>
  )
}
```

**Important Component Props:**
- `isLauncher`: Boolean indicating if the game is opened in launcher mode (without header/footer)

### 3. Create Metadata File

Create `apps/my-new-game/metadata.json`:

```json
{
  "id": "my-new-game",
  "name": "My New Game",
  "version": "1.0.0",
  "author": "Your Name",
  "description": {
    "en": "English description",
    "tr": "Turkish description"
  },
  "category": "slots",
  "tags": ["tag1", "tag2"],
  "minBet": 10,
  "maxBet": 1000,
  "rtp": 96.5,
  "features": [
    "Feature 1",
    "Feature 2"
  ],
  "rules": {
    "en": ["Rule 1", "Rule 2"],
    "tr": ["Kural 1", "Kural 2"]
  }
}
```

### 4. Register in Games Registry

Add your game to `Frontend/lib/games-registry.js`:

```javascript
{
  id: 'my-new-game',
  name: 'My New Game',
  slug: 'my-new-game',
  category: 'slots', // or 'crash-games', 'dice-games', 'live-casino', etc.
  provider: 'Your Provider Name',
  thumbnail: 'https://your-thumbnail-url.jpg',
  banner: 'https://your-banner-url.jpg',
  description: {
    en: 'English description',
    tr: 'Turkish description'
  },
  featured: false,
  popular: false,
  new: true,
  minBet: 10,
  maxBet: 1000,
  rtp: 96.5,
  tags: ['tag1', 'tag2'],
  componentPath: 'my-new-game', // Must match folder name
  requiresAuth: true,
  active: true,
  meta: {
    title: 'My New Game - SEO Title',
    description: 'SEO description',
    keywords: 'game, casino, slots'
  }
}
```

### 5. Test Your Game

Your game will automatically be available at:
- `/play/my-new-game` (full page with navigation)
- `/play/my-new-game?launcher=true` (launcher mode)

## Game Component Guidelines

### Required Imports
```javascript
import { useTranslation } from '@/hooks/useTranslation'
import { authAPI, betRoundAPI } from '@/lib/api'
import { log } from '@/utils/logger'
```

### Authentication
If your game requires authentication, use the `ProtectedRoute` wrapper in the page component.

### Styling
- Use Tailwind CSS classes
- Follow the existing design system (colors, spacing, etc.)
- Use glassmorphism effects for premium look
- Ensure responsive design (mobile-first)

### State Management
- Use React hooks for local state
- Use context for shared state if needed
- Handle loading and error states

### API Integration
- Use the provided API utilities from `@/lib/api`
- Handle errors gracefully
- Show user-friendly error messages

### Internationalization
- Use the `useTranslation` hook for all text
- Add translations to `Frontend/lib/translations/en.json` and `tr.json`

## Game Categories

Available categories:
- `crash-games` - Crash, Aviator, Zeppelin, etc.
- `dice-games` - Dice, Plinko, etc.
- `slots` - Slot machines
- `live-casino` - Live dealer games
- `table-games` - Blackjack, Roulette, etc.
- `sports` - Sports betting
- `virtual-sports` - Virtual sports

## Best Practices

1. **Keep games self-contained**: Each game should be independent
2. **Use consistent naming**: Follow the kebab-case naming convention
3. **Document your code**: Add comments for complex logic
4. **Test thoroughly**: Test on different screen sizes and browsers
5. **Optimize performance**: Lazy load heavy components, optimize images
6. **Handle errors**: Always handle API errors and edge cases
7. **Follow design system**: Use existing components and styles
8. **Add loading states**: Show loading indicators for async operations
9. **Make it accessible**: Use semantic HTML and ARIA labels
10. **Keep it responsive**: Test on mobile, tablet, and desktop

## Example Games

Check these games for reference:
- `apps/crash/` - Multiplier crash game
- `apps/dice-roll/` - Classic dice game
- `apps/sweet-bonanza/` - Slot game

## Troubleshooting

### Game not showing up
1. Check if the game is registered in `games-registry.js`
2. Verify `active: true` in the registry
3. Ensure `componentPath` matches the folder name
4. Check browser console for errors

### Styling issues
1. Verify Tailwind classes are correct
2. Check if custom CSS conflicts with global styles
3. Test on different screen sizes

### API errors
1. Check network tab in browser dev tools
2. Verify API endpoints are correct
3. Check authentication token
4. Review error logs

## Support

For questions or issues, contact the development team.
