# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OpenImagine is a web-based operating system interface built with Next.js 15 and React 19. It mimics Claude AI's Imagine functionality, providing a conversational interface for desktop management and application launching. The application features a complete windowing system with draggable windows, taskbar, and AI-powered conversation dock.

## Development Commands

```bash
# Install dependencies
pnpm i

# Run development server with Turbopack
pnpm dev

# Build for production with Turbopack
pnpm build

# Start production server
pnpm start

# Run ESLint
pnpm lint
```

## Architecture

### Core Components

- **WebOS.tsx** (`src/components/WebOS.tsx`): Main application component containing the entire desktop environment
- **page.tsx** (`src/app/page.tsx`): Root page that renders the WebOS component
- **layout.tsx** (`src/app/layout.tsx`): Root layout with metadata configuration

### Key Systems

1. **Window Management System**
   - Window state interface with position, size, z-index, and state tracking
   - Drag and drop functionality using mouse events and refs
   - Window operations: open, close, minimize, maximize, focus
   - Z-index management for proper window stacking

2. **Application Framework**
   - Template-based app system in `appTemplates` object
   - Built-in apps: Calculator, File Explorer, Browser
   - Each app is a React component with self-contained state

3. **Conversational Interface**
   - Message history with user/AI distinction
   - Simple rule-based AI response system
   - Natural language triggers for opening applications
   - Conversation dock with message history and input

4. **Desktop Environment**
   - Desktop icons with double-click app launching
   - Taskbar with running apps and clock
   - Start button (visual only)
   - Blue gradient background

### UI Framework

- **shadcn/ui**: Component library with Button and Input components
- **Tailwind CSS**: Styling with custom blue gradient theme
- **Lucide React**: Icon library for UI elements
- **Radix UI**: Foundation for component primitives

### State Management

- Local React state with useState hooks
- No external state management library
- Window state managed as array of WindowState objects
- Conversation messages managed as array of ConversationMessage objects

## File Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx           # Home page (renders WebOS)
│   └── globals.css        # Global styles
├── components/
│   ├── WebOS.tsx          # Main desktop environment
│   └── ui/
│       ├── button.tsx     # shadcn button component
│       └── input.tsx      # shadcn input component
└── lib/
    └── utils.ts           # Utility functions (cn helper)
```

## Development Notes

- Uses Next.js App Router with TypeScript
- Turbopack enabled for faster development builds
- All functionality is client-side (marked with "use client")
- Calculator app uses eval() for simple calculations
- Window positions are randomized when opened
- The app simulates an AI assistant but uses rule-based responses

### Dynamic App Creation System (CloudCode-Inspired)

The WebOS features a sophisticated component-based application generation system inspired by CloudCode principles:

**Architecture Overview:**
- **Component-based**: Modular UI components that can be combined in various layouts
- **Template-driven**: Predefined application templates for common use cases
- **Schema-defined**: JSON-based application configuration for type safety
- **LLM-integrated**: Natural language understanding for template selection

**How it works:**
1. User requests an app through natural conversation (e.g., "我需要一个BMI计算器")
2. GLM-4.6 LLM analyzes the request and selects appropriate template
3. System generates application schema based on template and user context
4. Dynamic component renders the application with full functionality
5. New app appears on desktop with special visual indicators

**Predefined Application Templates:**
- **BMI Calculator**: Body Mass Index calculation with health categories
- **Mortgage Calculator**: Loan payment and interest calculations
- **Investment Calculator**: ROI and compound interest calculations
- **Tax Calculator**: Chinese personal income tax calculations
- **Basic Calculator**: Four-function arithmetic calculator

**Component System:**
- **UI Components**: Input fields, selectors, text areas, buttons
- **Validation**: Built-in form validation with custom rules
- **Layouts**: Single-column, two-column, and grid layouts
- **Calculation Engines**: Formula, conditional, and lookup-based calculations

**Technical Implementation:**
- `src/components/dynamic/AppGenerator.tsx`: Core dynamic application component
- `src/lib/app-templates.ts`: Template definitions and schema generation
- `src/components/ui/card.tsx`: Reusable UI card component
- Enhanced type safety with TypeScript interfaces

**Key Features:**
- **Form Validation**: Real-time validation with error messages
- **Responsive Design**: Adapts to different screen sizes
- **Error Handling**: Graceful error recovery and user feedback
- **Accessibility**: Proper form labels and semantic HTML
- **Performance**: Efficient re-rendering with React hooks

**LLM Integration Enhancements:**
- Template-aware conversation responses
- Fallback to basic calculator when no template matches
- Available templates listing functionality
- Improved error handling and user guidance

**Configuration:**
1. Copy `.env.local.example` to `.env.local`
2. Set `NEXT_PUBLIC_GLM_API_KEY` with your GLM API key
3. Optionally customize `NEXT_PUBLIC_GLM_BASE_URL` and model settings

**Visual indicators:**
- Dynamic apps have purple-pink gradient backgrounds (vs white/20 for static apps)
- Green pulsing dot indicates dynamically created apps
- Larger default window size (450x550 vs 400x300)
- Loading spinner during LLM processing
- Purple-themed thinking messages with brain icon
- Animated thinking steps with sparkle icons

**LLM Thinking Process Display:**
- Shows AI's step-by-step reasoning when creating applications
- Console logging with emoji indicators for debugging
- UI animation for thinking steps (slide-in effect)
- Purple-themed thinking messages to distinguish from regular responses
- 2-second delay between thinking and final response for better UX

**Adding New Templates:**
1. Define template schema in `src/lib/app-templates.ts`
2. Add calculation logic in the template
3. Update LLM system prompt to include new template
4. Test with natural language queries

**Interactive Chat Interface:**
- **Collapsible Design**: Chat interface can be minimized to free up screen space
- **Drag-to-Resize**: Adjustable chat window height with drag handle
- **Smart Z-Index Management**: Windows always appear above chat interface
- **New Message Indicators**: Visual notifications when chat is minimized
- **Message Counter**: Shows unread AI message count in title bar
- **Clear Conversation**: Option to clear chat history

**Chat Interface Features:**
- **Position Switching**: Toggle between bottom and right-side positioning
- **Dual Layout Support**: Bottom layout with height drag, right layout with width drag
- **Minimize/Maximize Toggle**: Click arrow button to collapse or expand
- **Adaptive Resizing**:
  - Bottom: Drag height (200-600px)
  - Right: Drag width (250-500px)
- **Window Layer Management**: All windows have z-index > 1000, chat stays at 999
- **Smart Window Sizing**: Windows automatically adjust to avoid chat overlap
- **Responsive Input**: Different input layouts for bottom vs right positioning
- **Smooth Animations**: CSS transitions for all position changes
- **New Message Pulse**: Button pulses when new messages arrive while minimized
- **Professional Design**: Dark theme with proper contrast and readability

**Position-Specific Features:**
- **Bottom Layout**: Traditional chat dock style with horizontal input
- **Right Layout**: Sidebar chat style with vertical input and compact controls
- **Dynamic Sizing**: Chat interface adapts to content and user preferences
- **Icon Indicators**: Different arrow icons for expand/collapse based on position

**Chat Interface Implementation:**
- State management for position, size, and minimize/maximize functionality
- Drag handlers for both height and width adjustment
- Z-index management for proper window layering
- New message detection and visual indicators
- Responsive design with smooth transitions
- Window boundary detection and automatic positioning

**LLM Service Files:**
- `src/lib/llm-config.ts`: API configuration and system prompts
- `src/lib/llm-service.ts`: OpenAI client wrapper and response processing
- Enhanced system prompt with template awareness
- Console logging with structured debugging information

**Chat Interface Implementation:**
- State management for minimize/maximize functionality
- Drag handlers for height adjustment
- Z-index management for proper window layering
- New message detection and visual indicators
- Responsive design with smooth transitions

**App Style System:**
- **Unified Style Framework**: Comprehensive style system for all applications
- **Button Standards**: Consistent button styling with multiple variants (primary, secondary, danger, success, warning)
- **Calculator Theme**: Professional calculator layout with proper color hierarchy
- **Form Styling**: Standardized input field and form element styling
- **Card Components**: Consistent card styling for different content types
- **Theme Management**: Organized theme system for different app types

**Style Files:**
- `src/lib/app-styles.ts`: Centralized style definitions and themes
- `APP_STYLES`: Reusable style classes for buttons, inputs, cards, text, and layouts
- `APP_THEMES`: Pre-defined themes for calculator, form, browser, and file explorer
- `DYNAMIC_APP_DEFAULTS`: Default styling for dynamically generated applications

**Color Problem Resolution:**
- **Issue Fixed**: Calculator and other apps no longer inherit dialog box colors
- **Explicit Styling**: All buttons now use explicit Tailwind classes instead of CSS variables
- **Consistent Colors**: Professional color schemes for each application type
- **No Inheritance**: Apps maintain their own visual identity separate from UI elements

**Visual Improvements:**
- **Calculator**: Modern design with dark display, proper button colors, and clear hierarchy
- **Browser**: Clean address bar with proper input styling
- **Dynamic Apps**: Professional forms with consistent button styling and result display
- **File Explorer**: Improved hover states and visual feedback

**Style Guidelines:**
- **Primary Actions**: Blue buttons for main actions (Calculate, Go, etc.)
- **Secondary Actions**: Gray buttons for secondary functions (Reset, Clear)
- **Danger Actions**: Red buttons for destructive operations
- **Input Fields**: Consistent borders, focus states, and error handling
- **Cards**: Subtle shadows and borders for content grouping