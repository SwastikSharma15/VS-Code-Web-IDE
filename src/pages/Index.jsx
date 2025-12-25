import { useState } from 'react';
import { 
  Files, Search, GitBranch, Bug, Puzzle, Settings, User,
  ChevronRight, ChevronDown, FileCode, FileJson, Folder, FolderOpen,
  X, MoreHorizontal, SplitSquareVertical, PanelBottom, Bell, 
  Check, GitCommit, RefreshCw, Cloud
} from 'lucide-react';

const Index = () => {
  const [activeFile, setActiveFile] = useState('index.js');
  const [openFiles, setOpenFiles] = useState(['index.js', 'App.jsx', 'styles.css']);
  const [expandedFolders, setExpandedFolders] = useState(['src', 'components']);
  const [activeActivity, setActiveActivity] = useState('files');
  const [showTerminal, setShowTerminal] = useState(true);

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
    return <FileCode className="w-4 h-4 text-muted-foreground" />;
  };

  const renderFileTree = (items, depth = 0) => {
    return items.map((item) => (
      <div key={item.name}>
        {item.type === 'folder' ? (
          <>
            <div
              className="flex items-center gap-1 py-0.5 px-2 hover:bg-muted/50 cursor-pointer text-sm"
              style={{ paddingLeft: `${depth * 12 + 8}px` }}
              onClick={() => toggleFolder(item.name)}
            >
              {expandedFolders.includes(item.name) ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
              {expandedFolders.includes(item.name) ? (
                <FolderOpen className="w-4 h-4 text-yellow-500" />
              ) : (
                <Folder className="w-4 h-4 text-yellow-500" />
              )}
              <span className="text-foreground/90">{item.name}</span>
            </div>
            {expandedFolders.includes(item.name) && item.children && (
              renderFileTree(item.children, depth + 1)
            )}
          </>
        ) : (
          <div
            className={`flex items-center gap-2 py-0.5 px-2 hover:bg-muted/50 cursor-pointer text-sm ${
              activeFile === item.name ? 'bg-muted/70' : ''
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
            <span className="text-foreground/80">{item.name}</span>
          </div>
        )}
      </div>
    ));
  };

  const renderCode = (code) => {
    return code.split('\n').map((line, i) => (
      <div key={i} className="flex">
        <span className="w-12 text-right pr-4 text-muted-foreground/50 select-none">
          {i + 1}
        </span>
        <span className="flex-1">
          {line.replace(/</g, '&lt;').replace(/>/g, '&gt;') || '\u00A0'}
        </span>
      </div>
    ));
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#1e1e1e] text-[#cccccc] overflow-hidden">
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
        <div className="w-12 bg-[#333333] flex flex-col items-center py-2 gap-2">
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

        {/* Sidebar */}
        <div className="w-60 bg-[#252526] flex flex-col border-r border-[#3c3c3c]">
          <div className="h-8 px-4 flex items-center justify-between text-[11px] uppercase tracking-wider text-[#bbbbbb]">
            <span>Explorer</span>
            <MoreHorizontal className="w-4 h-4" />
          </div>
          <div className="px-2 py-1 text-[11px] uppercase tracking-wider text-[#bbbbbb] flex items-center gap-1">
            <ChevronDown className="w-3 h-3" />
            my-project
          </div>
          <div className="flex-1 overflow-y-auto">
            {renderFileTree(fileTree)}
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col">
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
          <div className="flex-1 bg-[#1e1e1e] overflow-auto font-mono text-sm leading-5">
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
  );
};

export default Index;
