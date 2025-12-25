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
  constructor(char, x, y, delay, color) {
    this.char = char;
    this.x = x;
    this.y = y;
    this.color = color || '#e5e7eb';
    
    const speed = 0.5 + Math.random() * 1.5;
    const angle = Math.random() * Math.PI * 2;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;

    this.size = 18;
    this.phase = Math.random() * 100;
    this.legLength = 10;
    this.armLength = 8;

    this.active = false;
    this.wakeDelay = delay;
    this.startTime = Date.now();
    this.isEaten = false;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
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
    { name: 'node_modules', type: 'folder', children: [] },
    { name: 'public', type: 'folder', children: [
      { name: 'index.html', type: 'file' },
      { name: 'favicon.ico', type: 'file' }
    ]},
    { name: 'src', type: 'folder', children: [
      { name: 'components', type: 'folder', children: [
        { name: 'Button.jsx', type: 'file' },
        { name: 'Header.jsx', type: 'file' },
        { name: 'Card.jsx', type: 'file' }
      ]},
      { name: 'App.jsx', type: 'file' },
      { name: 'index.js', type: 'file' },
      { name: 'styles.css', type: 'file' }
    ]},
    { name: 'package.json', type: 'file' },
    { name: 'README.md', type: 'file' }
  ];

  const codeContent = {
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

  return (
    <div className="app">
      <Header title="My Application" />
      <main>
        <h1>Count: {count}</h1>
        <Button onClick={() => setCount(c => c + 1)}>
          Increment
        </Button>
      </main>
    </div>
  );
}

export default App;`,
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

.button {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
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

  const renderCode = (code) => {
    return code.split('\n').map((line, i) => (
      <div key={i} className="flex">
        <span className="w-12 text-right pr-4 text-[#858585] select-none">
          {i + 1}
        </span>
        <span className="flex-1 text-[#d4d4d4]">
          {line || '\u00A0'}
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
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    canvas.width = width;
    canvas.height = height;

    ctx.font = "16px 'Fira Code', monospace";
    const charWidth = ctx.measureText('M').width;
    
    const fontSize = 14;
    const lineHeight = fontSize * 1.6;
    const padding = 8;

    const code = codeContent[activeFile] || '';
    
    runnersRef.current = [];
    bugsRef.current = [];
    
    let col = 0;
    let row = 0;
    let currentSpawnInterval = INITIAL_SPAWN_RATE;
    let accumulatedDelay = 0;

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
        const x = padding + (col * charWidth) + (charWidth / 2) + 300;
        const y = padding + (row * lineHeight) + (lineHeight / 2) + 100;
        
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
      if (canvasRef.current && isRunning) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isRunning]);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#1e1e1e] text-[#cccccc] overflow-hidden relative">
      {/* Canvas for animation */}
      <canvas
        ref={canvasRef}
        className={`fixed top-0 left-0 w-full h-full z-10 pointer-events-none ${!isRunning ? 'hidden' : ''}`}
      />

      {/* Game Controls */}
      {isRunning && (
        <>
          <button
            onClick={resetGame}
            className="fixed top-4 left-4 z-30 bg-white/10 text-white border border-white/20 px-4 py-2 rounded-lg font-semibold backdrop-blur-sm hover:bg-white/20 transition-colors"
          >
            Back to Code
          </button>
          <button
            onClick={() => setShowHands(!showHands)}
            className="fixed top-4 right-36 z-30 bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
          >
            Hands: {showHands ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={spawnBug}
            className="fixed top-4 right-4 z-30 bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors shadow-lg"
          >
            Spawn Bug 🪰
          </button>
        </>
      )}

      {/* Run Button */}
      {!isRunning && (
        <button
          onClick={startRunning}
          className="fixed bottom-8 right-8 z-20 bg-indigo-500 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 hover:bg-indigo-600 transition-all hover:-translate-y-0.5 shadow-lg shadow-indigo-500/40"
        >
          <Play className="w-5 h-5" />
          RUN CODE
        </button>
      )}

      {/* UI Container */}
      <div className={`flex flex-col h-full transition-opacity duration-500 ${isRunning ? 'opacity-0 pointer-events-none' : ''}`}>
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
            <div ref={editorRef} className="flex-1 bg-[#1e1e1e] overflow-auto font-mono text-sm leading-5">
              <div className="p-2">
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
