# Design Guidelines: Pet Care Gamification App for Children

## Design Approach
**Reference-Based Approach**: Drawing inspiration from successful child-focused gamification apps like Duolingo (progression systems), Pokemon GO (pet care mechanics), and educational gaming platforms. The design prioritizes playful engagement while maintaining clarity for both children and parents.

## Core Design Principles
1. **Joyful Interaction**: Every interaction should feel rewarding and encouraging
2. **Visual Clarity**: Large, obvious interactive elements with immediate feedback
3. **Safe Exploration**: Children can freely interact without fear of "breaking" things
4. **Parental Trust**: Parent controls are accessible but visually distinct from child interface

## Typography
- **Primary Font**: Nunito (Google Fonts) - rounded, friendly, highly legible for children
- **Display Font**: Fredoka (Google Fonts) - playful headers and numbers
- **Hierarchy**:
  - Hero/Page Titles: text-3xl to text-4xl, font-bold (Fredoka)
  - Section Headers: text-xl to text-2xl, font-bold (Fredoka)
  - Body Text: text-base to text-lg, font-semibold (Nunito)
  - Stats/Numbers: text-2xl to text-6xl, font-bold (Fredoka)
  - Small Labels: text-sm, font-medium (Nunito)

## Layout System
**Spacing**: Use Tailwind units of 4, 6, and 8 for consistent rhythm (p-4, gap-6, mb-8, etc.)
- Large breathing room between sections: py-8 to py-12
- Component internal padding: p-6
- Element gaps: gap-4 for tight groupings, gap-6 for section spacing
- Generous touch targets: min-h-12 to min-h-16 for all buttons

## Color Strategy (Implemented Later)
Focus on:
- Vibrant gradients for backgrounds (playful energy)
- Distinct color coding for stat types (hunger, happiness, health)
- High contrast for readability
- Warm, encouraging tones for rewards/positive actions
- Clear visual separation between child and parent modes

## Component Library

### Pet Display Zone
- Large centered pet emoji (text-8xl to text-9xl)
- Animated bounce effect on pet
- Rounded container (rounded-2xl to rounded-3xl) with gradient background
- Stats displayed as horizontal progress bars with emoji icons
- Mood indicator as large emoji above stats

### Action Buttons (Child View)
- Extra large size: px-8 py-4, min-h-16
- Rounded-full for primary actions
- Icons paired with text labels
- Prominent shadows (shadow-lg to shadow-xl)
- Clear visual states for disabled items (reduced opacity)

### Mission Cards
- Card-based layout with rounded-xl corners
- Left-aligned with clear visual hierarchy
- Checkbox/completion indicator prominently displayed
- Point value badge on right side
- Subtle border for pending, stronger for completed

### Mini-Game Screens
- Full-screen takeover (fixed positioning)
- Consistent header with timer/score and exit button
- Game area with defined boundaries
- Large, tappable game elements (min 60px touch targets)

### Parent View Controls
- Toggle switch styled interface for child/parent mode
- Approval buttons: distinct green (approve) and red (deny)
- Table/list layout for pending missions
- Subdued styling compared to child view (professional but not corporate)

### Inventory & Shop
- Grid layout for items (grid-cols-2 to grid-cols-3)
- Item cards with large emoji icons (text-5xl)
- Quantity badges in top-right corner
- Cost displayed prominently with star icon
- Buy button integrated into card

### Points Display
- Always visible in header/top bar
- Large star icon paired with number
- Contained in rounded-full badge
- Celebratory styling (yellow/gold tones)

## Icons
**Library**: Lucide React (already imported in code)
- Use 20-24px for inline icons
- Use 32-40px for feature icons
- Emoji preferred for pet, items, and rewards (larger, more playful)

## Animations
**Minimal but Impactful**:
- Pet bounce animation (animate-bounce on pet emoji)
- Smooth stat bar fills (transition-all duration-300)
- Card flip animations for memory game (transform rotate)
- Falling items in catch game (CSS keyframe animation)
- Scale on hover for interactive elements (hover:scale-105)
- Celebration confetti/burst effect on mission completion

## Accessibility Considerations
- Large touch targets throughout (minimum 44x44px, prefer 60x60px)
- High contrast text on all backgrounds
- Clear focus states for keyboard navigation
- Visual feedback for all interactions (immediate response)
- Simple language in all UI text
- Screen reader friendly labels on all interactive elements

## Images
**No hero images required** - This app is emoji and UI-driven. Pet and items represented by large emoji characters. Background gradients provide visual interest without distracting images.

## View-Specific Patterns

### Child View
- Playful gradient backgrounds
- Large, colorful buttons
- Emoji-heavy interface
- Encouraging language ("Great job!", "Keep it up!")
- Immediate visual rewards

### Parent View  
- Cleaner, more structured layout
- Table-based mission review
- Action buttons with clear approve/deny states
- Summary statistics and child progress overview
- Professional but warm aesthetic (not cold or corporate)

## Responsive Considerations
- Mobile-first: Single column layouts, full-width cards
- Touch-optimized on all screen sizes
- Maintain large text and buttons even on desktop
- Center-aligned layouts for focused experience
- max-w-4xl container for content on larger screens