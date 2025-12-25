import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Files, Search, GitBranch, Bug, Puzzle, Settings, User,
  ChevronRight, ChevronDown, FileCode, FileJson, Folder, FolderOpen,
  X, MoreHorizontal, SplitSquareVertical, Bell, 
  Check, GitCommit, RefreshCw, Cloud, Play
} from 'lucide-react';

// Constants for animation
const LIMB_SPEED = 0.005;
const MAX_RUNNER_SPEED = 2.5;
const BUG_WING_SPEED = 0.2;
const BUG_MOVE_SPEED = 3.0;
const INITIAL_SPAWN_RATE = 100;
const MAX_SPAWN_RATE = 2;
const SPAWN_ACCELERATION = 0.96;

class BugClass {
  constructor(width, height) {
    this.x = Math.random() < 0.5 ? -20 : width + 20;
    this.y = Math.random() * height;
    this.width = width;
    this.height = height;
    this.size = 10;
    this.speed = BUG_MOVE_SPEED + Math.random() * (BUG_MOVE_SPEED * 0.5);
    this.angle = 0;
    this.wingAngle = 0;
    this.target = null;
  }

  findTarget(runners) {
    let minDist = Infinity;
    let closest = null;
    
    runners.forEach(runner => {
      if (!runner.active) return;
      const dx = runner.x - this.x;
      const dy = runner.y - this.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < minDist) {
        minDist = dist;
        closest = runner;
      }
    });
    return closest;
  }

  update(runners) {
    if (!this.target || !runners.includes(this.target)) {
      this.target = this.findTarget(runners);
    }

    if (this.target) {
      const dx = this.target.x - this.x;
      const dy = this.target.y - this.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      this.angle = Math.atan2(dy, dx);
      
      this.x += Math.cos(this.angle) * this.speed;
      this.y += Math.sin(this.angle) * this.speed;

      if (dist < 20) {
        this.target.isEaten = true;
        this.target = null;
      }
    } else {
      this.x += Math.cos(this.angle) * this.speed;
      this.y += Math.sin(this.angle) * this.speed;
      
      if (Math.random() < 0.05) {
        this.angle += (Math.random() - 0.5) * 2;
      }

      if (this.x < -50) this.x = this.width + 50;
      if (this.x > this.width + 50) this.x = -50;
      if (this.y < -50) this.y = this.height + 50;
      if (this.y > this.height + 50) this.y = -50;
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle + Math.PI/2);

    ctx.shadowBlur = 15;
    ctx.shadowColor = '#f59e0b';

    this.wingAngle += BUG_WING_SPEED;
    const wingOffset = Math.sin(this.wingAngle) * 5;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    
    ctx.beginPath();
    ctx.ellipse(-8 - wingOffset/2, 2, 12, 6, Math.PI/4, 0, Math.PI*2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.ellipse(8 + wingOffset/2, 2, 12, 6, -Math.PI/4, 0, Math.PI*2);
    ctx.fill();

    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI*2);
    ctx.fill();

    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(-3, -5, 2.5, 0, Math.PI*2);
    ctx.arc(3, -5, 2.5, 0, Math.PI*2);
    ctx.fill();

    ctx.restore();
  }
}

class Runner {
  constructor(char, x, y, delay, color, width, height) {
    this.char = char;
    this.x = x;
    this.y = y;
    this.color = color || '#e5e7eb';
    
    const speed = 0.5 + Math.random() * 1.5;
    const angle = Math.random() * Math.PI * 2;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;

    this.size = 14;
    this.phase = Math.random() * 100;
    this.legLength = 8;
    this.armLength = 6;

    this.active = false;
    this.wakeDelay = delay;
    this.startTime = Date.now();
    this.isEaten = false;
    this.width = width || 800;
    this.height = height || 600;
  }

  update() {
    if (!this.active) {
      if (Date.now() - this.startTime > this.wakeDelay) {
        this.active = true;
      } else {
        return;
      }
    }

    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 10 || this.x > this.width - 10) {
      this.vx *= -1;
      this.x = Math.max(10, Math.min(this.width - 10, this.x));
    }
    
    if (this.y < 10 || this.y > this.height - 10) {
      this.vy *= -1;
      this.y = Math.max(10, Math.min(this.height - 10, this.y));
    }

    if (Math.random() < 0.02) {
      this.vx += (Math.random() - 0.5) * 0.5;
      this.vy += (Math.random() - 0.5) * 0.5;
      
      const maxSpeed = MAX_RUNNER_SPEED;
      const speed = Math.sqrt(this.vx**2 + this.vy**2);
      if (speed > maxSpeed) {
        this.vx = (this.vx / speed) * maxSpeed;
        this.vy = (this.vy / speed) * maxSpeed;
      }
    }
  }

  draw(ctx, time, showHands) {
    ctx.save();
    ctx.translate(this.x, this.y);

    ctx.font = `bold ${this.size}px 'Fira Code', monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = this.color;
    ctx.fillText(this.char, 0, 0);

    let currentLimbSpeed = LIMB_SPEED;

    if (!this.active) {
      currentLimbSpeed = 0;
    }

    if (this.active && showHands) {
      const runCycle = (time + this.phase) * currentLimbSpeed;
      
      ctx.lineWidth = 2;
      ctx.strokeStyle = this.color;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const hipY = this.size / 2 - 2;
      const hipX = 0;

      const lLegAngle = Math.sin(runCycle) * 0.8;
      this.drawLimb(ctx, hipX - 2, hipY, lLegAngle, this.legLength);

      const rLegAngle = Math.sin(runCycle + Math.PI) * 0.8;
      this.drawLimb(ctx, hipX + 2, hipY, rLegAngle, this.legLength);

      const shoulderY = -2;
      const shoulderX = 0;

      const lArmAngle = Math.sin(runCycle + Math.PI) * 0.8;
      this.drawLimb(ctx, shoulderX - 6, shoulderY, lArmAngle + 0.5, this.armLength);

      const rArmAngle = Math.sin(runCycle) * 0.8;
      this.drawLimb(ctx, shoulderX + 6, shoulderY, rArmAngle - 0.5, this.armLength);
    }

    ctx.restore();
  }

  drawLimb(ctx, originX, originY, angle, length) {
    const kneeX = originX + Math.sin(angle) * (length * 0.6);
    const kneeY = originY + Math.cos(angle) * (length * 0.6);

    const footX = kneeX + Math.sin(angle * 1.2) * (length * 0.6);
    const footY = kneeY + Math.cos(angle * 1.2) * (length * 0.6);

    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(kneeX, kneeY);
    ctx.lineTo(footX, footY);
    ctx.stroke();
  }
}

const Index = () => {
  const [activeFile, setActiveFile] = useState('index.js');
  const [openFiles, setOpenFiles] = useState(['index.js', 'App.jsx', 'styles.css']);
  const [expandedFolders, setExpandedFolders] = useState(['src', 'components']);
  const [activeActivity, setActiveActivity] = useState('files');
  const [showTerminal, setShowTerminal] = useState(true);
  
  // Game state
  const [isRunning, setIsRunning] = useState(false);
  const [showHands, setShowHands] = useState(true);
  const canvasRef = useRef(null);
  const runnersRef = useRef([]);
  const bugsRef = useRef([]);
  const animationIdRef = useRef(null);
  const editorRef = useRef(null);

  const toggleFolder = (folder) => {
    setExpandedFolders(prev => 
      prev.includes(folder) 
        ? prev.filter(f => f !== folder)
        : [...prev, folder]
    );
  };

  const closeFile = (file, e) => {
    e.stopPropagation();
    const newFiles = openFiles.filter(f => f !== file);
    setOpenFiles(newFiles);
    if (activeFile === file && newFiles.length > 0) {
      setActiveFile(newFiles[0]);
    }
  };

  const fileTree = [
    { name: 'index.html', type: 'file' },
    { name: 'package.json', type: 'file' },
    { name: 'README.md', type: 'file' },
    { name: 'public', type: 'folder', children: [
      { name: 'favicon.ico', type: 'file' }
    ]},
    { name: 'src', type: 'folder', children: [
      { name: 'components', type: 'folder', children: [
        { name: 'Button.jsx', type: 'file' },
        { name: 'Header.jsx', type: 'file' }
      ]},
      { name: 'App.jsx', type: 'file' },
      { name: 'index.js', type: 'file' },
      { name: 'styles.css', type: 'file' }
    ]}
  ];

  const codeContent = {
    'index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My React App</title>
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/index.js"></script>
  </body>
</html>`,
    'package.json': `{
  "name": "my-react-app",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^5.0.0"
  }
}`,
    'README.md': `# My React App

A simple React application built with Vite.

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

## Features

- Fast development with Vite
- React 18 with hooks
- Component-based architecture`,
    'index.js': `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

const root = ReactDOM.createRoot(
  document.getElementById('root')
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
    'App.jsx': `import React, { useState } from 'react';
import Header from './components/Header';
import Button from './components/Button';

function App() {
  const [count, setCount] = useState(0);

  const handleIncrement = () => {
    setCount(prev => prev + 1);
  };

  return (
    <div className="app">
      <Header title="My React App" />
      <main className="container">
        <h2>Counter: {count}</h2>
        <Button onClick={handleIncrement}>
          Click me
        </Button>
      </main>
    </div>
  );
}

export default App;`,
    'Header.jsx': `import React from 'react';

function Header({ title }) {
  return (
    <header className="header">
      <nav className="nav">
        <h1 className="logo">{title}</h1>
        <ul className="nav-links">
          <li><a href="/">Home</a></li>
          <li><a href="/about">About</a></li>
          <li><a href="/contact">Contact</a></li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;`,
    'Button.jsx': `import React from 'react';

function Button({ children, onClick, variant = 'primary' }) {
  const baseStyles = 'btn';
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-outline'
  };

  return (
    <button
      className={\`\${baseStyles} \${variants[variant]}\`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default Button;`,
    'styles.css': `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont,
    'Segoe UI', Roboto, sans-serif;
  background: #1e1e1e;
  color: #d4d4d4;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: #252526;
  padding: 1rem 2rem;
}

.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
  list-style: none;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: 500;
}

.btn-primary {
  background: #007acc;
  color: white;
}`
  };

  const getFileIcon = (filename) => {
    if (filename.endsWith('.jsx') || filename.endsWith('.js')) {
      return <FileCode className="w-4 h-4 text-yellow-400" />;
    }
    if (filename.endsWith('.json')) {
      return <FileJson className="w-4 h-4 text-yellow-600" />;
    }
    if (filename.endsWith('.css')) {
      return <FileCode className="w-4 h-4 text-blue-400" />;
    }
    return <FileCode className="w-4 h-4 text-white/60" />;
  };

  const renderFileTree = (items, depth = 0) => {
    return items.map((item) => (
      <div key={item.name}>
        {item.type === 'folder' ? (
          <>
            <div
              className="flex items-center gap-1 py-0.5 px-2 hover:bg-white/10 cursor-pointer text-sm"
              style={{ paddingLeft: `${depth * 12 + 8}px` }}
              onClick={() => toggleFolder(item.name)}
            >
              {expandedFolders.includes(item.name) ? (
                <ChevronDown className="w-4 h-4 text-white/70" />
              ) : (
                <ChevronRight className="w-4 h-4 text-white/70" />
              )}
              {expandedFolders.includes(item.name) ? (
                <FolderOpen className="w-4 h-4 text-yellow-500" />
              ) : (
                <Folder className="w-4 h-4 text-yellow-500" />
              )}
              <span className="text-white">{item.name}</span>
            </div>
            {expandedFolders.includes(item.name) && item.children && (
              renderFileTree(item.children, depth + 1)
            )}
          </>
        ) : (
          <div
            className={`flex items-center gap-2 py-0.5 px-2 hover:bg-white/10 cursor-pointer text-sm ${
              activeFile === item.name ? 'bg-white/20' : ''
            }`}
            style={{ paddingLeft: `${depth * 12 + 28}px` }}
            onClick={() => {
              setActiveFile(item.name);
              if (!openFiles.includes(item.name)) {
                setOpenFiles([...openFiles, item.name]);
              }
            }}
          >
            {getFileIcon(item.name)}
            <span className="text-white">{item.name}</span>
          </div>
        )}
      </div>
    ));
  };

  // Syntax highlighting helper
  const highlightCode = (line) => {
    // Keywords
    const keywords = ['import', 'from', 'export', 'default', 'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'extends', 'new', 'this', 'try', 'catch', 'throw', 'async', 'await'];
    const jsxTags = /<\/?[A-Za-z][A-Za-z0-9.]*/g;
    const strings = /(["'`])(?:(?!\1)[^\\]|\\.)*?\1/g;
    const comments = /\/\/.*/g;
    const numbers = /\b\d+\b/g;
    
    let result = [];
    let lastIndex = 0;
    let tempLine = line;
    
    // Simple tokenizer - process strings first
    const parts = [];
    let match;
    
    // Find all strings
    const stringMatches = [];
    while ((match = strings.exec(line)) !== null) {
      stringMatches.push({ start: match.index, end: match.index + match[0].length, text: match[0], type: 'string' });
    }
    
    // Find all comments
    const commentMatches = [];
    strings.lastIndex = 0;
    while ((match = comments.exec(line)) !== null) {
      commentMatches.push({ start: match.index, end: match.index + match[0].length, text: match[0], type: 'comment' });
    }
    
    // Build result
    let pos = 0;
    const allMatches = [...stringMatches, ...commentMatches].sort((a, b) => a.start - b.start);
    
    const processText = (text) => {
      // Highlight keywords
      let processed = text;
      keywords.forEach(kw => {
        const regex = new RegExp(`\\b${kw}\\b`, 'g');
        processed = processed.replace(regex, `<kw>${kw}</kw>`);
      });
      // Highlight JSX tags
      processed = processed.replace(jsxTags, (m) => `<jsx>${m}</jsx>`);
      // Highlight numbers
      processed = processed.replace(numbers, (m) => `<num>${m}</num>`);
      return processed;
    };
    
    if (allMatches.length === 0) {
      return <span dangerouslySetInnerHTML={{ __html: processText(line).replace(/<kw>/g, '<span style="color:#c586c0">').replace(/<\/kw>/g, '</span>').replace(/<jsx>/g, '<span style="color:#4ec9b0">').replace(/<\/jsx>/g, '</span>').replace(/<num>/g, '<span style="color:#b5cea8">').replace(/<\/num>/g, '</span>') }} />;
    }
    
    allMatches.forEach((m, i) => {
      if (m.start > pos) {
        const before = line.slice(pos, m.start);
        parts.push(<span key={`t${i}`} dangerouslySetInnerHTML={{ __html: processText(before).replace(/<kw>/g, '<span style="color:#c586c0">').replace(/<\/kw>/g, '</span>').replace(/<jsx>/g, '<span style="color:#4ec9b0">').replace(/<\/jsx>/g, '</span>').replace(/<num>/g, '<span style="color:#b5cea8">').replace(/<\/num>/g, '</span>') }} />);
      }
      if (m.type === 'string') {
        parts.push(<span key={`s${i}`} style={{ color: '#ce9178' }}>{m.text}</span>);
      } else if (m.type === 'comment') {
        parts.push(<span key={`c${i}`} style={{ color: '#6a9955' }}>{m.text}</span>);
      }
      pos = m.end;
    });
    
    if (pos < line.length) {
      const after = line.slice(pos);
      parts.push(<span key="last" dangerouslySetInnerHTML={{ __html: processText(after).replace(/<kw>/g, '<span style="color:#c586c0">').replace(/<\/kw>/g, '</span>').replace(/<jsx>/g, '<span style="color:#4ec9b0">').replace(/<\/jsx>/g, '</span>').replace(/<num>/g, '<span style="color:#b5cea8">').replace(/<\/num>/g, '</span>') }} />);
    }
    
    return <>{parts}</>;
  };

  const renderCode = (code) => {
    return code.split('\n').map((line, i) => (
      <div key={i} className="flex">
        <span className="w-12 text-right pr-4 text-[#858585] select-none">
          {i + 1}
        </span>
        <span className="flex-1">
          {highlightCode(line) || '\u00A0'}
        </span>
      </div>
    ));
  };

  // Animation logic
  const animate = useCallback(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    const width = canvasRef.current.width;
    const height = canvasRef.current.height;

    ctx.clearRect(0, 0, width, height);
    const time = Date.now();

    runnersRef.current = runnersRef.current.filter(r => !r.isEaten);

    runnersRef.current.forEach(runner => {
      runner.width = width;
      runner.height = height;
      runner.update();
      runner.draw(ctx, time, showHands);
    });

    bugsRef.current.forEach(bug => {
      bug.width = width;
      bug.height = height;
      bug.update(runnersRef.current);
      bug.draw(ctx);
    });

    animationIdRef.current = requestAnimationFrame(animate);
  }, [showHands]);

  const startRunning = () => {
    const canvas = canvasRef.current;
    const editorArea = editorRef.current;
    if (!canvas || !editorArea) return;

    const rect = editorArea.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    const width = rect.width;
    const height = rect.height;
    
    canvas.width = width;
    canvas.height = height;

    ctx.font = "14px 'Fira Code', monospace";
    const charWidth = ctx.measureText('M').width;
    
    const fontSize = 14;
    const lineHeight = fontSize * 1.6;
    const padding = 8;
    const lineNumberWidth = 48;

    const code = codeContent[activeFile] || '';
    
    runnersRef.current = [];
    bugsRef.current = [];
    
    let col = 0;
    let row = 0;
    let currentSpawnInterval = INITIAL_SPAWN_RATE;
    let accumulatedDelay = 0;

    // Use syntax highlighting colors
    const colors = ['#d4d4d4', '#569cd6', '#4ec9b0', '#ce9178', '#6a9955', '#dcdcaa', '#c586c0'];

    for (let i = 0; i < code.length; i++) {
      const char = code[i];

      if (char === '\n') {
        col = 0;
        row++;
        continue;
      }
      if (char === '\t') {
        col += 2;
        continue;
      }

      if (!char.match(/\s/)) {
        const x = lineNumberWidth + padding + (col * charWidth) + (charWidth / 2);
        const y = padding + (row * lineHeight) + (lineHeight / 2);
        
        const color = colors[Math.floor(Math.random() * colors.length)];
        runnersRef.current.push(new Runner(char, x, y, accumulatedDelay, color));
        
        accumulatedDelay += currentSpawnInterval;
        currentSpawnInterval = Math.max(MAX_SPAWN_RATE, currentSpawnInterval * SPAWN_ACCELERATION);
      }
      col++;
    }

    setIsRunning(true);
  };

  const resetGame = () => {
    setIsRunning(false);
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
    }
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    runnersRef.current = [];
    bugsRef.current = [];
  };

  const spawnBug = () => {
    const width = canvasRef.current?.width || window.innerWidth;
    const height = canvasRef.current?.height || window.innerHeight;
    bugsRef.current.push(new BugClass(width, height));
  };

  useEffect(() => {
    if (isRunning) {
      animate();
    }
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [isRunning, animate]);

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && editorRef.current && isRunning) {
        const rect = editorRef.current.getBoundingClientRect();
        canvasRef.current.width = rect.width;
        canvasRef.current.height = rect.height;
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isRunning]);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#1e1e1e] text-[#cccccc] overflow-hidden relative">

      {/* UI Container */}
      <div className="flex flex-col h-full">
        {/* Title Bar */}
        <div className="h-8 bg-[#323233] flex items-center px-4 text-xs">
          <div className="flex items-center gap-4">
            <span className="text-[#cccccc]/80">File</span>
            <span className="text-[#cccccc]/80">Edit</span>
            <span className="text-[#cccccc]/80">Selection</span>
            <span className="text-[#cccccc]/80">View</span>
            <span className="text-[#cccccc]/80">Go</span>
            <span className="text-[#cccccc]/80">Run</span>
            <span className="text-[#cccccc]/80">Terminal</span>
            <span className="text-[#cccccc]/80">Help</span>
          </div>
          <div className="flex-1 text-center text-[#cccccc]/60">
            {activeFile} — my-project — Visual Studio Code
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
            <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]"></div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Activity Bar */}
          <div className="w-12 bg-[#333333] flex flex-col items-center py-2 gap-2 flex-shrink-0">
            <button 
              className={`p-2 rounded ${activeActivity === 'files' ? 'bg-[#ffffff10] border-l-2 border-white' : 'hover:bg-[#ffffff10]'}`}
              onClick={() => setActiveActivity('files')}
            >
              <Files className="w-6 h-6" />
            </button>
            <button 
              className={`p-2 rounded ${activeActivity === 'search' ? 'bg-[#ffffff10]' : 'hover:bg-[#ffffff10]'}`}
              onClick={() => setActiveActivity('search')}
            >
              <Search className="w-6 h-6" />
            </button>
            <button className="p-2 hover:bg-[#ffffff10] rounded">
              <GitBranch className="w-6 h-6" />
            </button>
            <button className="p-2 hover:bg-[#ffffff10] rounded">
              <Bug className="w-6 h-6" />
            </button>
            <button className="p-2 hover:bg-[#ffffff10] rounded">
              <Puzzle className="w-6 h-6" />
            </button>
            <div className="flex-1" />
            <button className="p-2 hover:bg-[#ffffff10] rounded">
              <User className="w-6 h-6" />
            </button>
            <button className="p-2 hover:bg-[#ffffff10] rounded">
              <Settings className="w-6 h-6" />
            </button>
          </div>

          {/* Sidebar - Fixed width */}
          <div className="w-60 min-w-60 max-w-60 bg-[#252526] flex flex-col border-r border-[#3c3c3c] flex-shrink-0">
            <div className="h-8 px-4 flex items-center justify-between text-[11px] uppercase tracking-wider text-white">
              <span>Explorer</span>
              <MoreHorizontal className="w-4 h-4" />
            </div>
            <div className="px-2 py-1 text-[11px] uppercase tracking-wider text-white flex items-center gap-1">
              <ChevronDown className="w-3 h-3" />
              my-project
            </div>
            <div className="flex-1 overflow-y-auto">
              {renderFileTree(fileTree)}
            </div>
          </div>

          {/* Main Editor Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Tabs */}
            <div className="h-9 bg-[#252526] flex items-center border-b border-[#3c3c3c]">
              {openFiles.map(file => (
                <div
                  key={file}
                  className={`h-full px-3 flex items-center gap-2 cursor-pointer border-r border-[#3c3c3c] text-sm ${
                    activeFile === file 
                      ? 'bg-[#1e1e1e] text-white' 
                      : 'bg-[#2d2d2d] text-[#969696] hover:bg-[#2a2a2a]'
                  }`}
                  onClick={() => setActiveFile(file)}
                >
                  {getFileIcon(file)}
                  <span>{file}</span>
                  <button 
                    className="ml-1 hover:bg-[#ffffff20] rounded p-0.5"
                    onClick={(e) => closeFile(file, e)}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <div className="flex-1" />
              <div className="flex items-center gap-1 px-2">
                <button className="p-1 hover:bg-[#ffffff10] rounded">
                  <SplitSquareVertical className="w-4 h-4" />
                </button>
                <button className="p-1 hover:bg-[#ffffff10] rounded">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Breadcrumb */}
            <div className="h-6 bg-[#1e1e1e] px-4 flex items-center gap-1 text-xs text-[#969696] border-b border-[#3c3c3c]">
              <span>src</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-[#cccccc]">{activeFile}</span>
            </div>

            {/* Code Editor */}
            <div ref={editorRef} className="flex-1 bg-[#1e1e1e] overflow-auto font-mono text-sm leading-5 relative">
              {/* Canvas overlay for animation - inside editor */}
              <canvas
                ref={canvasRef}
                className={`absolute top-0 left-0 w-full h-full z-10 ${!isRunning ? 'hidden' : ''}`}
                style={{ pointerEvents: isRunning ? 'auto' : 'none' }}
              />
              
              {/* Game Controls - inside editor */}
              {isRunning && (
                <div className="absolute top-2 left-2 right-2 z-20 flex justify-between">
                  <button
                    onClick={resetGame}
                    className="bg-white/10 text-white border border-white/20 px-3 py-1.5 rounded text-xs font-semibold backdrop-blur-sm hover:bg-white/20 transition-colors"
                  >
                    Back to Code
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowHands(!showHands)}
                      className="bg-gray-600 text-white px-3 py-1.5 rounded text-xs font-semibold hover:bg-gray-700 transition-colors"
                    >
                      Hands: {showHands ? 'ON' : 'OFF'}
                    </button>
                    <button
                      onClick={spawnBug}
                      className="bg-red-500 text-white px-3 py-1.5 rounded text-xs font-semibold hover:bg-red-600 transition-colors"
                    >
                      Spawn Bug 🪰
                    </button>
                  </div>
                </div>
              )}

              {/* Run Button - inside editor */}
              {!isRunning && (
                <button
                  onClick={startRunning}
                  className="absolute bottom-4 right-4 z-20 bg-indigo-500 text-white px-4 py-2 rounded text-sm font-semibold flex items-center gap-2 hover:bg-indigo-600 transition-all hover:-translate-y-0.5 shadow-lg shadow-indigo-500/40"
                >
                  <Play className="w-4 h-4" />
                  RUN CODE
                </button>
              )}

              <div className={`p-2 ${isRunning ? 'opacity-0' : ''}`}>
                {codeContent[activeFile] && renderCode(codeContent[activeFile])}
              </div>
            </div>

            {/* Terminal Panel */}
            {showTerminal && (
              <div className="h-48 bg-[#1e1e1e] border-t border-[#3c3c3c] flex flex-col">
                <div className="h-8 bg-[#252526] flex items-center px-2 gap-4 text-xs">
                  <div className="flex items-center gap-4">
                    <span className="text-white border-b border-white pb-1">TERMINAL</span>
                    <span className="text-[#969696]">PROBLEMS</span>
                    <span className="text-[#969696]">OUTPUT</span>
                    <span className="text-[#969696]">DEBUG CONSOLE</span>
                  </div>
                  <div className="flex-1" />
                  <button 
                    className="hover:bg-[#ffffff10] p-1 rounded"
                    onClick={() => setShowTerminal(false)}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1 p-2 font-mono text-sm overflow-auto">
                  <div className="text-[#569cd6]">~/my-project</div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#6a9955]">$</span>
                    <span>npm run dev</span>
                  </div>
                  <div className="text-[#4ec9b0] mt-2">
                    VITE v5.0.12  ready in 234 ms
                  </div>
                  <div className="mt-1">
                    <span className="text-[#569cd6]">➜</span>  Local:   
                    <span className="text-[#4ec9b0]"> http://localhost:5173/</span>
                  </div>
                  <div>
                    <span className="text-[#569cd6]">➜</span>  Network: 
                    <span className="text-[#969696]"> use --host to expose</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[#6a9955]">$</span>
                    <span className="animate-pulse">▋</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Status Bar */}
        <div className="h-6 bg-[#007acc] flex items-center px-2 text-xs text-white">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <GitBranch className="w-3.5 h-3.5" />
              <span>main</span>
            </div>
            <div className="flex items-center gap-1">
              <RefreshCw className="w-3 h-3" />
              <span>0</span>
            </div>
            <div className="flex items-center gap-1">
              <X className="w-3 h-3" />
              <span>0</span>
            </div>
            <div className="flex items-center gap-1">
              <Check className="w-3 h-3" />
              <span>0</span>
            </div>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <span>Ln 1, Col 1</span>
            <span>Spaces: 2</span>
            <span>UTF-8</span>
            <span>CRLF</span>
            <span>{activeFile.endsWith('.jsx') ? 'JavaScript React' : activeFile.endsWith('.css') ? 'CSS' : 'JavaScript'}</span>
            <div className="flex items-center gap-1">
              <Cloud className="w-3.5 h-3.5" />
            </div>
            <div className="flex items-center gap-1">
              <Bell className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
