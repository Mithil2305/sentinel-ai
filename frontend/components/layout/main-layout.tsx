'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/store/app-context';
import { useRouter } from 'next/navigation';
import { 
  ShieldAlert, ShieldCheck, Activity, CheckSquare, Zap, 
  TrendingUp, HardDrive, FileBarChart2, Settings, Search,
  Bell, ChevronLeft, ChevronRight, Send, Terminal, Sparkles,
  Command, LogOut, RefreshCw, X, ChevronDown, User, Server
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    servers,
    incidents,
    approvals,
    chatMessages,
    sendChatMessage,
    clearChat,
    selectedServerId,
    setSelectedServerId,
    selectedPage,
    setSelectedPage,
    notifications,
    markNotificationsAsRead,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    isCopilotCollapsed,
    setIsCopilotCollapsed
  } = useApp();

  const router = useRouter();
  
  // Navigation actions
  const navigateTo = (pageName: string, route: string) => {
    setSelectedPage(pageName);
    router.push(route);
  };

  // Chat message container auto scroll
  const chatEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Notifications dropdown state
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const unreadNotifCount = notifications.filter(n => !n.read).length;

  // Search/Command palette modal state
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Sidebar items definition
  const sidebarItems = [
    { name: 'dashboard', label: 'Dashboard', icon: ShieldCheck, route: '/dashboard', badge: 0 },
    { name: 'incidents', label: 'Incidents', icon: ShieldAlert, route: '/incidents', badge: incidents.filter(i => i.status !== 'resolved').length },
    { name: 'monitoring', label: 'Live Monitoring', icon: Activity, route: '/monitoring', badge: 0 },
    { name: 'approvals', label: 'Approval Center', icon: CheckSquare, route: '/approvals', badge: approvals.length },
    { name: 'intelligence', label: 'Threat Intel', icon: Zap, route: '/intelligence', badge: 0 },
    { name: 'servers', label: 'Servers', icon: HardDrive, route: '/servers', badge: 0 },
    { name: 'reports', label: 'Reports', icon: FileBarChart2, route: '/reports', badge: 0 },
    { name: 'settings', label: 'Settings', icon: Settings, route: '/settings', badge: 0 },
  ];

  // Quick suggestions for copilot
  const suggestions = [
    'Summarize today\'s threats',
    'Explain ransomware on corp-dc-01',
    'List active servers'
  ];

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        setShowSearch(prev => !prev);
      }
      if (e.key === 'Escape') {
        setShowSearch(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [inputVal, setInputVal] = useState('');
  const handleSend = () => {
    if (!inputVal.trim()) return;
    sendChatMessage(inputVal);
    setInputVal('');
  };

  const handleSuggestionClick = (text: string) => {
    sendChatMessage(text);
  };

  return (
    <div className="flex min-h-screen bg-background text-text overflow-hidden">
      
      {/* 1. SIDEBAR */}
      <motion.aside 
        animate={{ width: isSidebarCollapsed ? 64 : 240 }}
        className="flex flex-col border-r border-border bg-card/40 backdrop-blur-md relative z-30 flex-shrink-0"
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center px-4 border-b border-border justify-between overflow-hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary border border-primary/45 glow-primary animate-pulse">
              <ShieldCheck className="h-5 w-5" />
            </div>
            {!isSidebarCollapsed && (
              <span className="font-bold text-lg tracking-wider bg-gradient-to-r from-text via-text to-primary bg-clip-text text-transparent">
                SentinelAI
              </span>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-3.5 p-4 py-6">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = selectedPage === item.name;
            return (
              <button
                key={item.name}
                onClick={() => navigateTo(item.name, item.route)}
                className={`flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-semibold transition-all group relative ${
                  isActive 
                    ? 'bg-primary/15 text-primary border border-primary/30 shadow-sm' 
                    : 'text-muted hover:bg-border/40 hover:text-text'
                }`}
              >
                <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-primary' : 'group-hover:text-primary transition-colors'}`} />
                {!isSidebarCollapsed && (
                  <span className="flex-1 text-left">{item.label}</span>
                )}
                {!isSidebarCollapsed && item.badge > 0 && (
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                    item.name === 'approvals' || item.name === 'incidents'
                      ? 'bg-critical/20 text-critical border border-critical/35'
                      : 'bg-primary/20 text-primary'
                  }`}>
                    {item.badge}
                  </span>
                )}
                {isSidebarCollapsed && item.badge > 0 && (
                  <div className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-critical animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer toggle */}
        <div className="p-3 border-t border-border flex items-center justify-between overflow-hidden">
          {!isSidebarCollapsed && (
            <div className="flex items-center gap-2.5 min-w-0 pr-1">
              <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/30 flex-shrink-0 flex items-center justify-center text-primary font-bold text-xs">
                SL
              </div>
              <div className="text-left min-w-0 flex-1">
                <div className="text-xs font-semibold text-text truncate">SecOps Lead</div>
                <div className="text-[10px] text-muted truncate">operator@sentinel.ai</div>
              </div>
            </div>
          )}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-1.5 rounded-lg border border-border bg-background hover:bg-border text-muted hover:text-text transition-colors flex-shrink-0"
          >
            {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
      </motion.aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        
        {/* 2. HEADER */}
        <header className="h-20 border-b border-border bg-card/40 backdrop-blur-xl flex items-center justify-between px-10 z-20 gap-8 flex-shrink-0">
          
          {/* Status Indicator & Global Search Button */}
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-3 text-xs font-bold px-4 py-2 rounded-full border border-success/35 bg-success/10 text-success flex-shrink-0">
              <span className="h-2.5 w-2.5 rounded-full bg-success animate-cyber-pulse shadow-md shadow-success" />
              <span>Monitoring 12 Servers</span>
            </div>
            
            {/* Server Selector Dropdown */}
            <div className="relative flex items-center gap-2 border border-border bg-background/60 rounded-xl px-3 py-1.5 shadow-sm">
              <Server className="h-4 w-4 text-primary flex-shrink-0" />
              <select 
                value={selectedServerId}
                onChange={(e) => setSelectedServerId(e.target.value)}
                className="bg-transparent text-xs font-bold border-none focus:outline-none text-text cursor-pointer hover:text-primary transition-colors pr-2"
              >
                <option value="all" className="bg-card text-text">All Infrastructure Servers</option>
                {servers.map(s => (
                  <option key={s.id} value={s.id} className="bg-card text-text">{s.hostname} ({s.ipAddress})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Search, Notifications, Profile controls */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Search command bar */}
            <button 
              onClick={() => setShowSearch(true)}
              className="hidden md:flex items-center gap-3 rounded-xl border border-border bg-background/60 hover:bg-border/40 px-4 py-2 text-xs text-muted transition-all w-56 lg:w-72 justify-between cursor-pointer shadow-sm hover:border-primary/40"
            >
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted" />
                <span className="font-medium">Search SOC commands...</span>
              </div>
              <kbd className="bg-border/80 text-[10px] px-2 py-0.5 rounded-md flex items-center gap-0.5 font-mono text-muted font-bold border border-border">
                <Command className="h-2.5 w-2.5" />K
              </kbd>
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowNotifDropdown(!showNotifDropdown);
                  markNotificationsAsRead();
                }}
                className="p-2.5 rounded-xl border border-border hover:bg-border/40 text-muted hover:text-text transition-colors relative cursor-pointer"
              >
                <Bell className="h-4 w-4" />
                {unreadNotifCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-critical animate-ping" />
                )}
              </button>

              {/* Notification Dropdown Panel */}
              <AnimatePresence>
                {showNotifDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifDropdown(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-3 w-96 rounded-xl border border-border bg-card/95 backdrop-blur-2xl p-6 shadow-2xl z-50 space-y-4"
                    >
                      <div className="flex items-center justify-between border-b border-border pb-3">
                        <span className="font-bold text-xs text-text uppercase tracking-wider">Notifications</span>
                        <span className="text-xs text-muted font-semibold">Auto-healing active</span>
                      </div>
                      <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
                        {notifications.map(n => (
                          <div key={n.id} className="p-4 rounded-lg bg-background/60 border border-border hover:border-primary/30 transition-all text-left space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className={`h-2 w-2 rounded-full ${n.type === 'critical' ? 'bg-critical shadow-sm shadow-critical' : 'bg-primary'}`} />
                              <span className="font-bold text-xs text-text">{n.title}</span>
                            </div>
                            <p className="text-xs text-muted leading-relaxed">{n.desc}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Live status check */}
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background/60 text-success hover:text-success/80 transition-colors shadow-sm">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
        </header>

        {/* 3. MAIN CONTENT WORKSPACE */}
        <main className="flex-1 overflow-y-auto cyber-grid-bg relative p-10 lg:p-12">
          {children}
        </main>
      </div>

      {/* 4. RIGHT SIDEBAR (AI COPILOT PANEL) */}
      <motion.aside 
        animate={{ width: isCopilotCollapsed ? 48 : 360 }}
        className="flex flex-col border-l border-border bg-card/45 backdrop-blur-md relative z-30 flex-shrink-0"
      >
        {/* Toggle Collapse bar on very edge */}
        <button 
          onClick={() => setIsCopilotCollapsed(!isCopilotCollapsed)}
          className="absolute -left-3 top-20 p-1 rounded-full border border-border bg-background hover:bg-border text-muted hover:text-text z-40 transition-colors"
        >
          {isCopilotCollapsed ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        </button>

        {isCopilotCollapsed ? (
          <div className="flex flex-col items-center py-6 gap-6 h-full">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            <div className="h-[1px] w-6 bg-border" />
            <button 
              onClick={() => setIsCopilotCollapsed(false)}
              className="p-2 rounded-lg border border-border hover:bg-border text-muted hover:text-text transition-colors transform -rotate-90 origin-center whitespace-nowrap mt-16 font-semibold text-xs tracking-wider"
            >
              COPILOT
            </button>
          </div>
        ) : (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/20 text-primary border border-primary/30">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-text">SentinelAI Copilot</h3>
                  <p className="text-[10px] text-success font-semibold">Autonomous SOC Analyst</p>
                </div>
              </div>
              <button 
                onClick={clearChat} 
                className="text-[10px] text-muted hover:text-text flex items-center gap-1 border border-border px-2 py-1 rounded bg-background/50 hover:bg-border/30 transition-colors"
              >
                <RefreshCw className="h-2.5 w-2.5" /> Clear
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map(msg => (
                <div 
                  key={msg.id} 
                  className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                >
                  <span className="text-[9px] text-muted mb-1 px-1">{msg.role === 'user' ? 'You' : 'SentinelAI'} • {msg.timestamp}</span>
                  <div className={`p-3 rounded-lg text-xs leading-relaxed border ${
                    msg.role === 'user'
                      ? 'bg-primary/10 border-primary/25 text-text'
                      : 'bg-background/85 border-border text-muted font-medium'
                  }`}>
                    {/* Simple Markdown handling inside bubbles */}
                    {msg.content.split('\n').map((line, i) => {
                      if (line.startsWith('### ')) {
                        return <h4 key={i} className="font-bold text-text mt-1.5 mb-1">{line.replace('### ', '')}</h4>;
                      }
                      if (line.startsWith('* ')) {
                        return (
                          <div key={i} className="flex items-start gap-1 pl-1 py-0.5">
                            <span className="text-primary mt-0.5">•</span>
                            <span>{line.replace('* ', '')}</span>
                          </div>
                        );
                      }
                      // Handle bold markdown replacements **text** -> bold
                      const regex = /\*\*(.*?)\*\*/g;
                      let replaced = line;
                      const matches = line.match(regex);
                      if (matches) {
                        return (
                          <p key={i} className="mb-1" dangerouslySetInnerHTML={{
                            __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\`(.*?)\`/g, '<code class="bg-border px-1 py-0.2 rounded text-text font-mono text-[10px]">$1</code>')
                          }} />
                        );
                      }
                      return <p key={i} className="mb-1">{line}</p>;
                    })}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Suggestions */}
            <div className="p-3 border-t border-border bg-background/25">
              <span className="text-[10px] text-muted block mb-1.5 font-semibold">Suggested Inquiries:</span>
              <div className="flex flex-col gap-1.5">
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(s)}
                    className="text-[10px] text-left p-1.5 rounded border border-border bg-card/60 hover:bg-primary/5 hover:border-primary/20 transition-all text-muted hover:text-text font-medium truncate"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Input form */}
            <div className="p-3 border-t border-border bg-background/50">
              <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-1">
                <input 
                  type="text" 
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask SentinelAI (e.g. Recommend fix)..."
                  className="flex-1 bg-transparent border-none text-xs text-text placeholder:text-muted focus:outline-none pl-2 py-1"
                />
                <button 
                  onClick={handleSend}
                  className="h-7 w-7 rounded bg-primary text-text flex items-center justify-center hover:bg-primary/80 transition-colors"
                >
                  <Send className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.aside>

      {/* 5. SEARCH & COMMAND PALETTE MODAL */}
      <AnimatePresence>
        {showSearch && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-24">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSearch(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-xl rounded-xl border border-border bg-card p-4 shadow-2xl z-50 glass-panel"
            >
              <div className="flex items-center gap-2 border-b border-border pb-3 mb-3">
                <Search className="h-4 w-4 text-muted" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type a command or search entities (e.g. Incidents, Server-01)..."
                  className="flex-1 bg-transparent border-none text-sm text-text focus:outline-none placeholder:text-muted"
                  autoFocus
                />
                <kbd className="bg-border text-[9px] px-1.5 py-0.5 rounded text-muted">ESC</kbd>
              </div>
              
              <div className="space-y-4">
                {/* Pages Section */}
                <div>
                  <span className="text-[10px] text-muted font-bold tracking-wider block mb-2">PAGES</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {sidebarItems.map(item => (
                      <button
                        key={item.name}
                        onClick={() => {
                          setShowSearch(false);
                          navigateTo(item.name, item.route);
                        }}
                        className="flex items-center gap-2 p-2 rounded hover:bg-primary/10 border border-transparent hover:border-primary/20 text-xs text-left text-muted hover:text-text transition-colors"
                      >
                        <item.icon className="h-3.5 w-3.5 text-primary" />
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hot Actions */}
                <div>
                  <span className="text-[10px] text-muted font-bold tracking-wider block mb-2">QUICK REMEDIATION</span>
                  <div className="space-y-1.5">
                    {approvals.map(app => (
                      <button
                        key={app.id}
                        onClick={() => {
                          setShowSearch(false);
                          navigateTo('approvals', '/approvals');
                        }}
                        className="flex items-center justify-between w-full p-2 rounded bg-background/50 hover:bg-border/30 border border-border hover:border-primary/20 text-xs text-left transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <CheckSquare className="h-3.5 w-3.5 text-critical" />
                          <span className="font-semibold text-text truncate max-w-[300px]">{app.title}</span>
                          <span className="text-[9px] text-muted">{app.server}</span>
                        </div>
                        <span className="text-[9px] bg-critical/20 text-critical border border-critical/30 px-1.5 py-0.5 rounded font-bold">{app.risk.toUpperCase()}</span>
                      </button>
                    ))}
                    {approvals.length === 0 && (
                      <div className="text-center text-[10px] text-muted py-2">No pending approvals queue. System fully secure.</div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
