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
  const [activeFile, setActiveFile] = useState('index.jsx');
  const [openFiles, setOpenFiles] = useState(['index.jsx', 'App.jsx', 'styles.css']);
  const [expandedFolders, setExpandedFolders] = useState(['src', 'components']);
  const [activeActivity, setActiveActivity] = useState('files');
  const [showTerminal, setShowTerminal] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);

  // Game state
  const [isRunning, setIsRunning] = useState(false);
  const [showHands, setShowHands] = useState(true);
  const canvasRef = useRef(null);
  const runnersRef = useRef([]);
  const bugsRef = useRef([]);
  const animationIdRef = useRef(null);
  const editorRef = useRef(null);
  const editorTextareaRef = useRef(null);
  const lineGutterRef = useRef(null);
  const highlightRef = useRef(null);
  const lineGutterInnerRef = useRef(null);

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
    { name: 'public', type: 'folder', children: [
        { name: 'SpeedX_Logo_favicon.ico', type: 'file' }
      ]},
    { name: 'src', type: 'folder', children: [
        { name: 'components', type: 'folder', children: [
            { name: 'Button.jsx', type: 'file' },
            { name: 'Header.jsx', type: 'file' }
          ]},
        { name: 'App.jsx', type: 'file' },
        { name: 'index.jsx', type: 'file' },
        { name: 'styles.css', type: 'file' }
      ]},
    { name: 'index.html', type: 'file' },
    { name: 'package.json', type: 'file' },
    { name: 'README.md', type: 'file' }
  ];

  // Code content with proper indentation preserved (includes explicit blank lines as empty strings '')
  const CODE_FILES = {
    'index.html': [
      '<!DOCTYPE html>',
      '<html lang="en">',
      '  <head>',
      '    <meta charset="UTF-8" />',
      '    <meta name="viewport" content="width=device-width, initial-scale=1.0" />',
      '    <title>My React App</title>',
      '    <link rel="icon" type="image/x-icon" href="/SpeedX_Logo_favicon.ico" />',
      '  </head>',
      '  <body>',
      '    <div id="root"></div>',
      '    <script type="module" src="/src/index.jsx"></script>',
      '  </body>',
      '</html>'
    ],
    'package.json': [
      '{',
      '  "name": "my-react-app",',
      '  "version": "1.0.0",',
      '  "type": "module",',
      '  "scripts": {',
      '    "dev": "vite",',
      '    "build": "vite build",',
      '    "preview": "vite preview"',
      '  },',
      '  "dependencies": {',
      '    "react": "^18.2.0",',
      '    "react-dom": "^18.2.0"',
      '  },',
      '  "devDependencies": {',
      '    "@vitejs/plugin-react": "^4.0.0",',
      '    "vite": "^5.0.0"',
      '  }',
      '}'
    ],
    'README.md': [
      '# My React App',
      '',
      'A simple React application built with Vite.',
      '',
      '## Getting Started',
      '',
      '```bash',
      'npm install',
      'npm run dev',
      '```',
      '',
      '## Features',
      '',
      '- Fast development with Vite',
      '- React 18 with hooks',
      '- Component-based architecture'
    ],
    'index.jsx': [
      "import React from 'react';",
      "import ReactDOM from 'react-dom/client';",
      "import App from './App';",
      "import './styles.css';",
      '',
      'const root = ReactDOM.createRoot(',
      "  document.getElementById('root')",
      ');',
      '',
      'root.render(',
      '  <React.StrictMode>',
      '    <App />',
      '  </React.StrictMode>',
      ');'
    ],
    'App.jsx': [
      "import React, { useState } from 'react';",
      "import Header from './components/Header';",
      "import Button from './components/Button';",
      '',
      'function App() {',
      '  const [count, setCount] = useState(0);',
      '',
      '  const handleIncrement = () => {',
      '    setCount(prev => prev + 1);',
      '  };',
      '',
      '  return (',
      '    <div className="app">',
      '      <Header title="My React App" />',
      '      <main className="container">',
      '        <h2>Counter: {count}</h2>',
      '        <Button onClick={handleIncrement}>',
      '          Click me',
      '        </Button>',
      '      </main>',
      '    </div>',
      '  );',
      '}',
      '',
      'export default App;'
    ],
    'Header.jsx': [
      "import React from 'react';",
      '',
      'function Header({ title }) {',
      '  return (',
      '    <header className="header">',
      '      <nav className="nav">',
      '        <h1 className="logo">{title}</h1>',
      '        <ul className="nav-links">',
      '          <li><a href="/">Home</a></li>',
      '          <li><a href="/about">About</a></li>',
      '          <li><a href="/contact">Contact</a></li>',
      '        </ul>',
      '      </nav>',
      '    </header>',
      '  );',
      '}',
      '',
      'export default Header;'
    ],
    'Button.jsx': [
      "import React from 'react';",
      '',
      "function Button({ children, onClick, variant = 'primary' }) {",
      "  const baseStyles = 'btn';",
      '  const variants = {',
      "    primary: 'btn-primary',",
      "    secondary: 'btn-secondary',",
      "    outline: 'btn-outline'",
      '  };',
      '',
      '  return (',
      '    <button',
      '      className={`${baseStyles} ${variants[variant]}`}',
      '      onClick={onClick}',
      '    >',
      '      {children}',
      '    </button>',
      '  );',
      '}',
      '',
      'export default Button;'
    ],
    'styles.css': [
      '* {',
      '  margin: 0;',
      '  padding: 0;',
      '  box-sizing: border-box;',
      '}',
      '',
      'body {',
      '  font-family: -apple-system, BlinkMacSystemFont,',
      "    'Segoe UI', Roboto, sans-serif;",
      '  background: #1e1e1e;',
      '  color: #d4d4d4;',
      '}',
      '',
      '.app {',
      '  min-height: 100vh;',
      '  display: flex;',
      '  flex-direction: column;',
      '}',
      '',
      '.header {',
      '  background: #252526;',
      '  padding: 1rem 2rem;',
      '}',
      '',
      '.nav {',
      '  display: flex;',
      '  justify-content: space-between;',
      '  align-items: center;',
      '}',
      '',
      '.nav-links {',
      '  display: flex;',
      '  gap: 1.5rem;',
      '  list-style: none;',
      '}',
      '',
      '.btn {',
      '  padding: 0.5rem 1rem;',
      '  border-radius: 4px;',
      '  border: none;',
      '  cursor: pointer;',
      '  font-weight: 500;',
      '}',
      '',
      '.btn-primary {',
      '  background: #007acc;',
      '  color: white;',
      '}'
    ]
  };

  // Editable files content state (initialized from CODE_FILES)
  const [filesContent, setFilesContent] = useState(() => {
    const initial = {};
    Object.keys(CODE_FILES).forEach((k) => {
      initial[k] = (CODE_FILES[k] || []).join('\n');
    });
    return initial;
  });

  // Ensure content exists when a new tab/file becomes active
  useEffect(() => {
    if (!(activeFile in filesContent)) {
      setFilesContent((prev) => ({
        ...prev,
        [activeFile]: (CODE_FILES[activeFile] || []).join('\n'),
      }));
    }
  }, [activeFile]);

  // Keep gutter scroll in sync with textarea scroll
  const handleEditorScroll = useCallback(() => {
    const ta = editorTextareaRef.current;
    const gutter = lineGutterRef.current;
    const highlight = highlightRef.current;
    // Single-scroll: textarea owns the only scrollbar.
    // Move gutter numbers by translating an inner wrapper.
    if (ta && lineGutterInnerRef.current) {
      lineGutterInnerRef.current.style.transform = `translateY(-${ta.scrollTop}px)`;
    }
    if (ta && highlight) {
      highlight.scrollTop = ta.scrollTop;
      highlight.scrollLeft = ta.scrollLeft;
    }
  }, []);

  // Ensure initial sync on mount/file change/content change
  useEffect(() => {
    handleEditorScroll();
  }, [activeFile, filesContent[activeFile], handleEditorScroll]);

  const handleEditorChange = useCallback((e) => {
    const value = e.target.value;
    setFilesContent((prev) => ({ ...prev, [activeFile]: value }));
  }, [activeFile]);

  const handleEditorKeyDown = useCallback((e) => {
    const ta = editorTextareaRef.current;
    if (!ta) return;

    // Tab inserts two spaces
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const value = ta.value;
      const insert = '  ';
      const newValue = value.substring(0, start) + insert + value.substring(end);
      setFilesContent((prev) => ({ ...prev, [activeFile]: newValue }));
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + insert.length;
      });
      return;
    }

    // Enter: keep current line indentation
    if (e.key === 'Enter') {
      const value = ta.value;
      const start = ta.selectionStart;
      const lineStart = value.lastIndexOf('\n', start - 1) + 1;
      const currentLine = value.substring(lineStart, start);
      const indentMatch = currentLine.match(/^[\t ]+/);
      if (indentMatch) {
        e.preventDefault();
        const indent = indentMatch[0];
        const insert = `\n${indent}`;
        const end = ta.selectionEnd;
        const newValue = value.substring(0, start) + insert + value.substring(end);
        setFilesContent((prev) => ({ ...prev, [activeFile]: newValue }));
        requestAnimationFrame(() => {
          const pos = start + insert.length;
          ta.selectionStart = ta.selectionEnd = pos;
        });
      }
    }
  }, [activeFile]);

  const getFileIcon = (filename) => {
    if (filename.endsWith('.js')) {
      return <FileCode className="w-4 h-4" style={{ color: '#F7DF1E' }} />;
    }
    if (filename.endsWith('.jsx')) {
      return <FileCode className="w-4 h-4" style={{ color: '#FFD54F' }} />;
    }
    if (filename.endsWith('.json')) {
      return <FileJson className="w-4 h-4" style={{ color: '#d4a72c' }} />;
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
    const keywords = ['import', 'from', 'export', 'default', 'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'extends', 'new', 'this', 'try', 'catch', 'throw', 'async', 'await'];
    const strings = /(["'`])(?:(?!\1)[^\\]|\\.)*?\1/g;
    const comments = /\/\/.*/g;
    const numbers = /\b\d+\b/g;
    const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const jsxTags = /&lt;\/?[A-Za-z][A-Za-z0-9.]*/g;

    let result = [];
    let lastIndex = 0;
    let tempLine = line;

    const parts = [];
    let match;

    const stringMatches = [];
    while ((match = strings.exec(line)) !== null) {
      stringMatches.push({ start: match.index, end: match.index + match[0].length, text: match[0], type: 'string' });
    }

    const commentMatches = [];
    strings.lastIndex = 0;
    while ((match = comments.exec(line)) !== null) {
      commentMatches.push({ start: match.index, end: match.index + match[0].length, text: match[0], type: 'comment' });
    }

    let pos = 0;
    const allMatches = [...stringMatches, ...commentMatches].sort((a, b) => a.start - b.start);

    const processText = (text) => {
      let processed = escapeHtml(text);
      keywords.forEach(kw => {
        const regex = new RegExp(`\\b${kw}\\b`, 'g');
        processed = processed.replace(regex, `<kw>${kw}</kw>`);
      });
      processed = processed.replace(jsxTags, (m) => `<jsx>${m}</jsx>`);
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

  const renderCode = (lines) => {
    return lines.map((line, i) => (
      <div key={i} className="flex">
        <span className="w-10 text-center pr-2 text-[#858585] select-none flex-shrink-0">
          {i + 1}
        </span>
        <span className="flex-1" style={{ whiteSpace: 'pre' }}>
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

    // Use the exact editor content and preserve all blank lines
    const code = (filesContent[activeFile] !== undefined
      ? filesContent[activeFile]
      : (CODE_FILES[activeFile] || []).join('\n'));
    const lines = code.split(/\r\n|\r|\n/);

    runnersRef.current = [];
    bugsRef.current = [];

    let row = 0;
    let currentSpawnInterval = INITIAL_SPAWN_RATE;
    let accumulatedDelay = 0;

    const colors = ['#d4d4d4', '#569cd6', '#4ec9b0', '#ce9178', '#6a9955', '#dcdcaa', '#c586c0'];

    for (let r = 0; r < lines.length; r++) {
      const line = lines[r];
      let col = 0;
      for (let c = 0; c < line.length; c++) {
        const ch = line[c];
        if (ch === '\t') {
          col += 2; // render tabs as two spaces worth
          continue;
        }
        if (!/\s/.test(ch)) {
          const x = lineNumberWidth + padding + (col * charWidth) + (charWidth / 2);
          const y = padding + (r * lineHeight) + (lineHeight / 2);
          const color = colors[Math.floor(Math.random() * colors.length)];
          runnersRef.current.push(new Runner(ch, x, y, accumulatedDelay, color));
          accumulatedDelay += currentSpawnInterval;
          currentSpawnInterval = Math.max(MAX_SPAWN_RATE, currentSpawnInterval * SPAWN_ACCELERATION);
        }
        col++;
      }
      // Even if the line is blank/whitespace-only, advancing r via the loop
      // ensures the Y placement of following lines respects blank lines.
      row = r + 1;
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
    <div className="h-screen w-screen flex flex-col bg-[#1e1e1e] text-[#cccccc] overflow-hidden">
      <div className="flex flex-col flex-1 min-h-0">
        {/* Title Bar */}
        <div className="h-8 bg-[#323233] flex items-center px-4 text-xs flex-shrink-0">
          <div className="flex items-center gap-4">
            <span className="text-[#cccccc]/80">File</span>
            <span className="text-[#cccccc]/80">Edit</span>
            <span className="text-[#cccccc]/80">Selection</span>
            <span className="text-[#cccccc]/80">View</span>
            <span className="text-[#cccccc]/80">Go</span>
            <span className="text-[#cccccc]/80">Run</span>
            <button
              onClick={() => setShowTerminal(!showTerminal)}
              className="text-[#cccccc]/80 hover:text-white cursor-pointer"
            >
              Terminal
            </button>
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

        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Activity Bar */}
          <div className="w-12 bg-[#333333] flex flex-col items-center py-2 gap-2 flex-shrink-0">
            <button
              className={`p-2 rounded ${activeActivity === 'files' ? 'bg-[#ffffff10] border-l-2 border-white' : 'hover:bg-[#ffffff10]'}`}
              onClick={() => {
                if (activeActivity === 'files') {
                  setShowSidebar(!showSidebar);
                } else {
                  setActiveActivity('files');
                  setShowSidebar(true);
                }
              }}
            >
              <Files className="w-6 h-6" />
            </button>
            <button
              className={`p-2 rounded ${activeActivity === 'search' ? 'bg-[#ffffff10] border-l-2 border-white' : 'hover:bg-[#ffffff10]'}`}
              onClick={() => {
                if (activeActivity === 'search') {
                  setShowSidebar(!showSidebar);
                } else {
                  setActiveActivity('search');
                  setShowSidebar(true);
                }
              }}
            >
              <Search className="w-6 h-6" />
            </button>
            <button
              className={`p-2 rounded ${activeActivity === 'source' ? 'bg-[#ffffff10] border-l-2 border-white' : 'hover:bg-[#ffffff10]'}`}
              onClick={() => {
                if (activeActivity === 'source') {
                  setShowSidebar(!showSidebar);
                } else {
                  setActiveActivity('source');
                  setShowSidebar(true);
                }
              }}
            >
              <GitBranch className="w-6 h-6" />
            </button>
            <button
              className={`p-2 rounded ${activeActivity === 'debug' ? 'bg-[#ffffff10] border-l-2 border-white' : 'hover:bg-[#ffffff10]'}`}
              onClick={() => {
                if (activeActivity === 'debug') {
                  setShowSidebar(!showSidebar);
                } else {
                  setActiveActivity('debug');
                  setShowSidebar(true);
                }
              }}
            >
              <Bug className="w-6 h-6" />
            </button>
            <button
              className={`p-2 rounded ${activeActivity === 'extensions' ? 'bg-[#ffffff10] border-l-2 border-white' : 'hover:bg-[#ffffff10]'}`}
              onClick={() => {
                if (activeActivity === 'extensions') {
                  setShowSidebar(!showSidebar);
                } else {
                  setActiveActivity('extensions');
                  setShowSidebar(true);
                }
              }}
            >
              <Puzzle className="w-6 h-6" />
            </button>
            <div className="flex-1" />
            <button
              className={`p-2 rounded ${activeActivity === 'credits' ? 'bg-[#ffffff10] border-l-2 border-white' : 'hover:bg-[#ffffff10]'}`}
              onClick={() => {
                if (activeActivity === 'credits') {
                  setShowSidebar(!showSidebar);
                } else {
                  setActiveActivity('credits');
                  setShowSidebar(true);
                }
              }}
            >
              <User className="w-6 h-6" />
            </button>
            <button
              className="p-2 hover:bg-[#ffffff10] rounded"
              onClick={() => setShowSidebar(false)}
            >
              <Settings className="w-6 h-6" />
            </button>
          </div>

          {/* Sidebar */}
          {showSidebar && (
          <div className="w-60 min-w-60 max-w-60 bg-[#252526] flex flex-col border-r border-[#3c3c3c] flex-shrink-0">
            <div className="h-8 px-4 flex items-center justify-between text-[11px] uppercase tracking-wider text-white flex-shrink-0">
              <span>
                {activeActivity === 'files' && 'Explorer'}
                {activeActivity === 'search' && 'Search'}
                {activeActivity === 'source' && 'Source Control'}
                {activeActivity === 'debug' && 'Run & Debug'}
                {activeActivity === 'extensions' && 'Extensions'}
                {activeActivity === 'credits' && 'Credits'}
              </span>
              <MoreHorizontal className="w-4 h-4" />
            </div>
            
            {/* Files Explorer */}
            {activeActivity === 'files' && (
              <>
                <div className="px-2 py-1 text-[11px] uppercase tracking-wider text-white flex items-center gap-1 flex-shrink-0">
                  <ChevronDown className="w-3 h-3" />
                  my-project
                </div>
                <div className="flex-1 overflow-y-auto min-h-0">
                  {renderFileTree(fileTree)}
                </div>
              </>
            )}

            {/* Search */}
            {activeActivity === 'search' && (
              <div className="flex-1 overflow-y-auto min-h-0 p-4 flex flex-col">
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search files..."
                    className="w-full px-3 py-2 rounded bg-[#1e1e1e] border border-[#3c3c3c] text-[#cccccc] text-sm focus:outline-none focus:border-[#569cd6] placeholder-[#666]"
                  />
                </div>
                <div className="space-y-2">
                  <div className="text-[#cccccc]/60 text-xs">No results</div>
                  <p className="text-[#cccccc]/50 text-xs leading-relaxed">
                    Enter a search query to find files, functions, or text in your project.
                  </p>
                </div>
              </div>
            )}

            {/* Source Control */}
            {activeActivity === 'source' && (
              <div className="flex-1 overflow-y-auto min-h-0 p-4 flex flex-col">
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <GitBranch className="w-4 h-4 text-[#4ec9b0]" />
                    <span className="text-sm text-white font-semibold">main</span>
                  </div>
                  <button className="w-full px-3 py-2 rounded bg-[#007acc] hover:bg-[#005a9e] text-white text-xs font-semibold transition-colors">
                    Publish Branch
                  </button>
                </div>
                <div className="border-t border-[#3c3c3c] pt-4">
                  <p className="text-[#cccccc]/70 text-xs uppercase tracking-wider mb-2">Changes</p>
                  <div className="text-[#cccccc]/60 text-xs">No changes</div>
                </div>
              </div>
            )}

            {/* Run & Debug */}
            {activeActivity === 'debug' && (
              <div className="flex-1 overflow-y-auto min-h-0 p-4 flex flex-col">
                <div className="mb-4">
                  <button className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded bg-[#007acc] hover:bg-[#005a9e] text-white text-sm font-semibold transition-colors">
                    <Play className="w-4 h-4" />
                    Start Debugging
                  </button>
                </div>
                <div className="border-t border-[#3c3c3c] pt-4">
                  <p className="text-[#cccccc]/70 text-xs uppercase tracking-wider mb-3">Breakpoints</p>
                  <div className="text-[#cccccc]/60 text-xs">No breakpoints</div>
                </div>
                <div className="border-t border-[#3c3c3c] pt-4 mt-4">
                  <p className="text-[#cccccc]/70 text-xs uppercase tracking-wider mb-3">Watch</p>
                  <div className="text-[#cccccc]/60 text-xs">No watch expressions</div>
                </div>
              </div>
            )}

            {/* Extensions */}
            {activeActivity === 'extensions' && (
              <div className="flex-1 overflow-y-auto min-h-0 p-4 flex flex-col">
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search extensions..."
                    className="w-full px-3 py-2 rounded bg-[#1e1e1e] border border-[#3c3c3c] text-[#cccccc] text-sm focus:outline-none focus:border-[#569cd6] placeholder-[#666]"
                  />
                </div>
                <div className="space-y-3">
                  <div className="p-3 rounded bg-[#1e1e1e] border border-[#3c3c3c]">
                    <p className="text-[#cccccc] text-xs font-semibold mb-1">Tailwind CSS IntelliSense</p>
                    <p className="text-[#cccccc]/60 text-xs">Intelligent Tailwind CSS tooling</p>
                  </div>
                  <div className="p-3 rounded bg-[#1e1e1e] border border-[#3c3c3c]">
                    <p className="text-[#cccccc] text-xs font-semibold mb-1">ES7+ React/Redux</p>
                    <p className="text-[#cccccc]/60 text-xs">React snippets and autocomplete</p>
                  </div>
                </div>
              </div>
            )}

            {/* Credits */}
            {activeActivity === 'credits' && (
              <div className="flex-1 overflow-y-auto min-h-0 p-4 flex flex-col">
                <div className="flex flex-col items-center text-center mb-6">
                  <img 
                    src="/swastik.jpeg" 
                    alt="Swastik Sharma" 
                    className="w-20 h-20 rounded-full mb-3 border border-[#3c3c3c] object-cover object-top"
                  />
                  <h2 className="text-white font-semibold text-sm">Swastik Sharma</h2>
                  <p className="text-[#cccccc]/60 text-xs mt-1">Developer & Designer</p>
                </div>

                <p className="text-[#cccccc]/70 text-xs leading-relaxed mb-4">
                  VS Code Web IDE - An interactive code editor with animated characters and fun gameplay elements.
                </p>

                <div className="border-t border-[#3c3c3c] pt-4 mt-auto">
                  <p className="text-[#cccccc]/70 text-xs uppercase tracking-wider mb-3">Connect</p>
                  <div className="flex flex-col gap-2">
                    <a
                      href="https://github.com/SwastikSharma15"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 rounded bg-[#1e1e1e] hover:bg-[#2d2d2d] border border-[#3c3c3c] hover:border-[#4ec9b0] transition-all text-[#cccccc] text-xs"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                      GitHub
                    </a>
                    <a
                      href="https://www.linkedin.com/in/swastik15sharma/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 rounded bg-[#1e1e1e] hover:bg-[#2d2d2d] border border-[#3c3c3c] hover:border-[#569cd6] transition-all text-[#cccccc] text-xs"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/>
                      </svg>
                      LinkedIn
                    </a>
                    <a
                      href="https://www.swastikmacolio.in/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 rounded bg-[#1e1e1e] hover:bg-[#2d2d2d] border border-[#3c3c3c] hover:border-[#dcdcaa] transition-all text-[#cccccc] text-xs"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.658 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      Portfolio
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
          )}

          {/* Main Editor Area */}
          <div className="flex-1 flex flex-col min-w-0 min-h-0">
            {/* Tabs */}
            <div className="h-9 bg-[#252526] flex items-center border-b border-[#3c3c3c] flex-shrink-0">
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
            <div className="h-6 bg-[#1e1e1e] px-4 flex items-center gap-1 text-xs text-[#969696] border-b border-[#3c3c3c] flex-shrink-0">
              <span>src</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-[#cccccc]">{activeFile}</span>
            </div>

            {/* Code Editor */}
            <div ref={editorRef} className="flex-1 bg-[#1e1e1e] overflow-hidden font-mono text-sm leading-5 relative min-h-0">
              <canvas
                ref={canvasRef}
                className={`absolute top-0 left-0 w-full h-full z-10 ${!isRunning ? 'hidden' : ''}`}
                style={{ pointerEvents: isRunning ? 'auto' : 'none' }}
              />

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

              {!isRunning && (
                <button
                  onClick={startRunning}
                  className="absolute bottom-4 right-4 z-20 bg-indigo-500 text-white px-4 py-2 rounded text-sm font-semibold flex items-center gap-2 hover:bg-indigo-600 transition-all hover:-translate-y-0.5 shadow-lg shadow-indigo-500/40"
                >
                  <Play className="w-4 h-4" />
                  RUN CODE
                </button>
              )}

              <div className={`h-full ${isRunning ? 'opacity-0' : ''}`}>
                <div className="h-full flex">
                  {/* Line numbers gutter */}
                  <div
                    ref={lineGutterRef}
                    className="w-12 select-none text-sm text-[#858585] text-right pr-2 py-2 overflow-hidden border-r border-[#3c3c3c] bg-[#1e1e1e]"
                    style={{ lineHeight: '22px', fontSize: '14px' }}
                  >
                    <div ref={lineGutterInnerRef}>
                      {(() => {
                        // Number every line, including blank ones, so a new number appears immediately on Enter
                        const content = filesContent[activeFile] ?? (CODE_FILES[activeFile] || []).join('\n');
                        const lines = content.split(/\r\n|\r|\n/);
                        return lines.map((_, i) => (
                          <div key={i}>{i + 1}</div>
                        ));
                      })()}
                    </div>
                  </div>

                  {/* Editable textarea */}
                  <div className="flex-1 overflow-hidden relative">
                    {/* Highlight backdrop (underneath) */}
                    <div
                      ref={highlightRef}
                      className="absolute inset-0 overflow-auto hide-scrollbar p-2 font-mono text-sm whitespace-pre pointer-events-none"
                      style={{ lineHeight: '22px', fontSize: '14px', tabSize: 2, fontVariantLigatures: 'none' }}
                    >
                      {(filesContent[activeFile] ?? (CODE_FILES[activeFile] || []).join('\n'))
                        .split(/\r\n|\r|\n/)
                        .map((line, i) => (
                          <div key={i}>
                            {line.length > 0
                              ? highlightCode(line)
                              : <span style={{ opacity: 0 }}>&nbsp;</span>}
                          </div>
                        ))}
                    </div>

                    {/* Transparent text input (on top) */}
                    <textarea
                      ref={editorTextareaRef}
                      value={filesContent[activeFile] ?? (CODE_FILES[activeFile] || []).join('\n')}
                      onChange={handleEditorChange}
                      onKeyDown={handleEditorKeyDown}
                      onScroll={handleEditorScroll}
                      spellCheck={false}
                      wrap="off"
                      className="relative w-full h-full bg-transparent text-transparent font-mono text-sm outline-none p-2 caret-white overflow-auto"
                      style={{ lineHeight: '22px', fontSize: '14px', tabSize: 2, whiteSpace: 'pre', fontVariantLigatures: 'none' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Terminal Panel */}
            {showTerminal && (
              <div className="h-48 bg-[#1e1e1e] border-t border-[#3c3c3c] flex flex-col flex-shrink-0">
                <div className="h-8 bg-[#252526] flex items-center px-2 gap-4 text-xs flex-shrink-0">
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
                <div className="flex-1 p-2 font-mono text-sm overflow-hidden">
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
        <div className="h-6 bg-[#007acc] flex items-center px-2 text-xs text-white flex-shrink-0">
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
            <span>{activeFile.endsWith('.jsx') ? 'JavaScript JSX' : activeFile.endsWith('.css') ? 'CSS' : 'JavaScript'}</span>
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