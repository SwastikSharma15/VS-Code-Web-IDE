# VS Code Web IDE

A browser-based Visual Studio Code simulator built with React, Vite, and Tailwind CSS. This interactive IDE recreation features a fully functional file explorer, editor with syntax highlighting, activity bar, and an integrated terminal panel - complete with an engaging interactive animation game.

![VS Code Web IDE Preview](./public/vscode.png)

## ✨ Features

### 🎨 UI Components
- **Activity Bar** - Navigate between Files, Search, Git, Debugging, and Extensions with visual indicators
- **File Explorer** - Expandable/collapsible folder structure with file tree visualization  
- **Editor Tabs** - Multiple file tabs with close functionality and active file highlighting
- **Code Editor** - Syntax-highlighted code display with breadcrumb navigation
- **Terminal Panel** - Integrated terminal emulation with collapsible interface
- **Status Bar** - Git branch information and status indicators

### 🎮 Interactive Game
- **Animation Canvas** - Click "Play Code" to launch an interactive game featuring:
  - **Animated Runners** - Characters that run around the canvas with dynamic limb animations
  - **Bug System** - Intelligent bugs that hunt the runners
  - **Wave System** - Spawning waves that increase in difficulty
  - **Game Controls**: Back to Code, Hands Toggle, Spawn Bug

### 🎯 Smart UI Features
- **Sidebar Toggle** - Click sidebar buttons to hide/show the explorer panel
- **Terminal Toggle** - Use the Terminal menu item to show/hide the terminal section
- **Responsive Layout** - Flexible grid-based layout with proper overflow handling
- **Dark Theme** - VS Code-inspired dark color scheme throughout

## 🛠 Tech Stack

- **React 18.3** - UI library with hooks for state management
- **Vite 5.4** - Lightning-fast build tool and dev server
- **TypeScript** - Type-safe development environment
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **Radix UI** - Unstyled, accessible UI components
- **React Router DOM** - Client-side routing
- **Lucide React** - Beautiful icon library
- **Canvas API** - For smooth animation rendering

## 📦 Getting Started

### Prerequisites
- Node.js 16 or higher
- npm or bun package manager

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd VS\ Code\ Web\ IDE

# Install dependencies
npm install
# or with bun
bun install
```

### Development Server

```bash
# Start the development server with hot reload
npm run dev
# or with bun
bun dev
```

The application will be available at `http://localhost:5173/`

### Production Build

```bash
# Create optimized production build
npm run build

# Preview the production build locally
npm run preview

# Development mode build
npm run build:dev
```

### Code Quality

```bash
# Run ESLint to check code quality
npm run lint
```

## 📁 Project Structure

```
src/
├── pages/
│   ├── Index.jsx          # Main IDE component
│   └── NotFound.jsx       # 404 error page
├── components/
│   ├── NavLink.tsx        # Navigation component
│   └── ui/                # Radix UI components library
├── hooks/
│   ├── use-mobile.tsx     # Mobile detection hook
│   └── use-toast.ts       # Toast notifications hook
├── lib/
│   └── utils.ts           # Shared utility functions
├── App.jsx                # Root application component
├── index.css              # Global CSS styles
├── main.jsx               # React entry point
└── vite-env.d.ts          # Vite environment types
```

## 🎮 Usage Guide

### Navigating the IDE

1. **File Explorer** - Click the Files icon in the activity bar to view the file tree
2. **Switching Files** - Click on tabs to open different files in the editor
3. **Code Display** - View syntax-highlighted code with line numbers
4. **Terminal** - Use the Terminal menu to toggle the terminal panel
5. **Game Mode** - Click the "Play Code" button to enter interactive game mode

### Game Mechanics

- **Runners** - Characters that animate and move around the canvas
- **Bugs** - Intelligent entities that track and hunt runners
- **Waves** - Spawning patterns that increase difficulty over time
- **Spawn Rate** - Accelerates as time progresses, making the game harder

### Control Panel

- **Back to Code** - Exit game mode instantly
- **Spawn Bug 🪰** - Manually add a bug to hunt the runners
- **Hands ON/OFF** - Toggle the animated limb display for runners

## 🔧 Core Classes

### BugClass
Intelligent bug entities with:
- Target tracking system for nearest runner
- Animated wings that flutter realistically
- Collision detection with runners
- Smart pathfinding around the canvas

### Runner
Animated character with:
- Physics-based movement system
- Dynamic limb animations with realistic running cycles
- Collision boundaries
- Customizable colors and sizes

### Index Component
Main application featuring:
- Complete UI state management
- Canvas animation loop with requestAnimationFrame
- File tree rendering logic
- Event handlers for all interactions
- Game simulation engine

## 🌐 Browser Support

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Opera 76+

## ⚡ Performance Features

- **Canvas Rendering** - Efficient animation with canvas API
- **Reference Optimization** - useRef for animation management
- **Memoized Functions** - useCallback to prevent unnecessary re-renders
- **Lazy Rendering** - On-demand component rendering
- **Hardware Acceleration** - CSS transforms for smooth animations

## 🚀 Future Enhancements

- [ ] Syntax highlighting for multiple file types
- [ ] Live code editing capabilities
- [ ] Keyboard shortcuts support
- [ ] Advanced search functionality
- [ ] Git integration panel
- [ ] Customizable themes
- [ ] Dark/Light mode toggle
- [ ] Code execution engine

## 📝 Contributing

Contributions are welcome! Feel free to:
- Report bugs via Issues
- Submit Pull Requests with improvements
- Suggest new features
- Improve documentation

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Inspired by VS Code's beautiful UI design
- Radix UI for accessible components
- Tailwind CSS for rapid styling
- Lucide React for amazing icons
- React community for excellent tools and documentation

---

**Built with ❤️ using React, Vite, and modern web technologies**
