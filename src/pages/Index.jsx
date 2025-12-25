import { Download, ChevronRight, Terminal, Code, GitBranch, Puzzle, Zap, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const features = [
    {
      icon: <Terminal className="w-8 h-8" />,
      title: "Integrated Terminal",
      description: "Built-in terminal for seamless command-line access"
    },
    {
      icon: <Code className="w-8 h-8" />,
      title: "IntelliSense",
      description: "Smart completions based on variable types and definitions"
    },
    {
      icon: <GitBranch className="w-8 h-8" />,
      title: "Git Integration",
      description: "Review diffs, stage files, and make commits from the editor"
    },
    {
      icon: <Puzzle className="w-8 h-8" />,
      title: "Extensions",
      description: "Thousands of extensions for languages, themes, and tools"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Lightning Fast",
      description: "Optimized for speed with instant file switching"
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Cross Platform",
      description: "Available on Windows, macOS, and Linux"
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Code className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl tracking-tight">VS Code</span>
          </div>
          <div className="flex items-center gap-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">Features</a>
            <a href="#extensions" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">Extensions</a>
            <a href="#docs" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">Docs</a>
            <a href="#updates" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">Updates</a>
            <Button variant="default" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Download
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                <span className="text-primary text-sm font-medium">Version 1.95 Released</span>
                <ChevronRight className="w-4 h-4 text-primary" />
              </div>
              <h1 className="text-6xl font-bold leading-tight tracking-tight">
                Code editing.
                <span className="block text-primary">Redefined.</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                Free. Built on open source. Runs everywhere. Visual Studio Code is a lightweight but powerful source code editor.
              </p>
              <div className="flex items-center gap-4">
                <Button size="lg" className="gap-2 px-8 py-6 text-lg">
                  <Download className="w-5 h-5" />
                  Download for Windows
                </Button>
                <Button variant="outline" size="lg" className="px-8 py-6 text-lg">
                  Web Version
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Also available for <a href="#" className="text-primary hover:underline">macOS</a> and <a href="#" className="text-primary hover:underline">Linux</a>
              </p>
            </div>
            
            {/* Code Editor Preview */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-2xl blur-3xl opacity-50"></div>
              <div className="relative bg-card rounded-xl border border-border shadow-2xl overflow-hidden">
                {/* Title Bar */}
                <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b border-border">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <span className="text-xs text-muted-foreground ml-4">index.js — My Project</span>
                </div>
                {/* Editor Content */}
                <div className="flex">
                  {/* Sidebar */}
                  <div className="w-12 bg-muted/30 border-r border-border py-4 flex flex-col items-center gap-4">
                    <div className="w-6 h-6 bg-primary/20 rounded flex items-center justify-center">
                      <Code className="w-4 h-4 text-primary" />
                    </div>
                    <GitBranch className="w-5 h-5 text-muted-foreground" />
                    <Puzzle className="w-5 h-5 text-muted-foreground" />
                    <Terminal className="w-5 h-5 text-muted-foreground" />
                  </div>
                  {/* Code Area */}
                  <div className="flex-1 p-4 font-mono text-sm">
                    <div className="space-y-1">
                      <div><span className="text-muted-foreground">1</span>  <span className="text-purple-400">import</span> <span className="text-yellow-400">React</span> <span className="text-purple-400">from</span> <span className="text-green-400">'react'</span>;</div>
                      <div><span className="text-muted-foreground">2</span>  <span className="text-purple-400">import</span> <span className="text-yellow-400">{'{ useState }'}</span> <span className="text-purple-400">from</span> <span className="text-green-400">'react'</span>;</div>
                      <div><span className="text-muted-foreground">3</span></div>
                      <div><span className="text-muted-foreground">4</span>  <span className="text-purple-400">const</span> <span className="text-blue-400">App</span> = () <span className="text-purple-400">=&gt;</span> {'{'}</div>
                      <div><span className="text-muted-foreground">5</span>    <span className="text-purple-400">const</span> [<span className="text-foreground">count</span>, <span className="text-foreground">setCount</span>] = <span className="text-blue-400">useState</span>(<span className="text-orange-400">0</span>);</div>
                      <div><span className="text-muted-foreground">6</span></div>
                      <div><span className="text-muted-foreground">7</span>    <span className="text-purple-400">return</span> (</div>
                      <div><span className="text-muted-foreground">8</span>      <span className="text-gray-500">&lt;</span><span className="text-blue-400">div</span><span className="text-gray-500">&gt;</span></div>
                      <div><span className="text-muted-foreground">9</span>        <span className="text-gray-500">&lt;</span><span className="text-blue-400">h1</span><span className="text-gray-500">&gt;</span><span className="text-foreground">Count: {'{count}'}</span><span className="text-gray-500">&lt;/</span><span className="text-blue-400">h1</span><span className="text-gray-500">&gt;</span></div>
                      <div><span className="text-muted-foreground">10</span>       <span className="text-gray-500">&lt;</span><span className="text-green-400">Button</span> <span className="text-yellow-400">onClick</span>=<span className="text-green-400">{'{() => setCount(c => c + 1)}'}</span><span className="text-gray-500">&gt;</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need for modern development, right out of the box
            </p>
          </div>
          <div className="grid grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-5xl font-bold text-primary">14M+</div>
              <div className="text-muted-foreground">Monthly Active Users</div>
            </div>
            <div className="space-y-2">
              <div className="text-5xl font-bold text-primary">40K+</div>
              <div className="text-muted-foreground">Extensions</div>
            </div>
            <div className="space-y-2">
              <div className="text-5xl font-bold text-primary">100+</div>
              <div className="text-muted-foreground">Languages Supported</div>
            </div>
            <div className="space-y-2">
              <div className="text-5xl font-bold text-primary">#1</div>
              <div className="text-muted-foreground">Developer Tool</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary/80 p-16 text-center">
            <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,white)]"></div>
            <div className="relative z-10">
              <h2 className="text-4xl font-bold text-primary-foreground mb-4">
                Ready to start coding?
              </h2>
              <p className="text-xl text-primary-foreground/80 mb-8 max-w-xl mx-auto">
                Join millions of developers who use Visual Studio Code every day
              </p>
              <Button size="lg" variant="secondary" className="px-8 py-6 text-lg gap-2">
                <Download className="w-5 h-5" />
                Download Free
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
              <Code className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">Visual Studio Code</span>
          </div>
          <div className="flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">License</a>
            <span>© 2024 Microsoft</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
