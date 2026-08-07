'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/store/app-context';
import { useRouter } from 'next/navigation';
import { 
  ShieldAlert, ShieldCheck, Activity, CheckSquare, Zap, 
  TrendingUp, HardDrive, FileBarChart2, Settings, Search,
  Bell, ChevronLeft, ChevronRight, Send, Terminal, Sparkles,
  Command, LogOut, RefreshCw, X, ChevronDown, User, Server,
  MessageSquareCode
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
        animate={{ width: isSidebarCollapsed ? 64 : 280 }}
        className="flex flex-col border-r border-border bg-[#111111] h-screen sticky top-0 relative z-30 flex-shrink-0 animate-fade-in"
      >
        {/* Brand Header */}
        <div className="flex h-[72px] items-center px-4 border-b border-border justify-between overflow-hidden">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-button bg-primary/10 text-primary border border-primary/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            {!isSidebarCollapsed && (
              <span className="font-bold text-subsection tracking-wider text-text">
                Sentinel<span className="text-primary">AI</span>
              </span>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1.5 p-3 py-6">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = selectedPage === item.name;
            return (
              <button
                key={item.name}
                onClick={() => navigateTo(item.name, item.route)}
                className={`flex w-full items-center gap-3.5 rounded-button px-4 py-2.5 text-small-text font-bold transition-all group relative cursor-pointer border ${
                  isActive 
                    ? 'bg-[#090909] text-primary border-border shadow-sm' 
                    : 'text-[#A1A1AA] hover:bg-primary/5 hover:text-text border-transparent'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-primary" />
                )}
                <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-primary' : 'text-[#71717A] group-hover:text-primary transition-colors'}`} />
                {!isSidebarCollapsed && (
                  <span className="flex-1 text-left">{item.label}</span>
                )}
                {!isSidebarCollapsed && item.badge > 0 && (
                  <span className={`rounded-badge px-2 py-0.5 text-caption font-bold ${
                    item.name === 'approvals' || item.name === 'incidents'
                      ? 'bg-critical/10 text-critical border border-critical/20'
                      : 'bg-primary/10 text-primary border border-primary/20'
                  }`}>
                    {item.badge}
                  </span>
                )}
                {isSidebarCollapsed && item.badge > 0 && (
                  <div className="absolute right-1.5 top-1.5 h-2 w-2 rounded-badge bg-critical animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer toggle */}
        <div className="p-3 border-t border-border flex items-center justify-between overflow-hidden">
          {!isSidebarCollapsed && (
            <div className="flex items-center gap-2.5 min-w-0 pr-1">
              <div className="h-9 w-9 rounded-badge bg-[#1A1A1A] border border-border flex-shrink-0 flex items-center justify-center text-primary font-bold text-caption shadow-sm">
                SL
              </div>
              <div className="text-left min-w-0 flex-1">
                <div className="text-caption font-bold text-text truncate">SecOps Lead</div>
                <div className="text-[10px] text-[#71717A] truncate">operator@sentinel.ai</div>
              </div>
            </div>
          )}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-2 rounded-input border border-border bg-[#090909] hover:bg-[#1A1A1A] text-[#71717A] hover:text-text transition-colors flex-shrink-0 cursor-pointer"
          >
            {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
      </motion.aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        
        {/* 2. HEADER */}
        <header className="h-[72px] border-b border-border bg-[#090909]/95 backdrop-blur-md flex items-center justify-between px-page-x-desktop z-20 gap-8 flex-shrink-0">
          
          {/* Status Indicator & Global Search Button */}
          <div className="flex items-center gap-5 flex-wrap">
            <div className="flex items-center gap-2 text-caption font-bold px-3 py-1.5 rounded-badge border border-success/30 bg-success/10 text-success flex-shrink-0 select-none">
              <span className="h-2 w-2 rounded-badge bg-success animate-cyber-pulse" />
              <span>Monitoring 12 Servers</span>
            </div>
            
            {/* Server Selector Dropdown */}
            <div className="relative flex items-center gap-2 border border-border bg-[#111111] rounded-input px-3 py-1.5 shadow-sm">
              <Server className="h-4 w-4 text-primary flex-shrink-0" />
              <select 
                value={selectedServerId}
                onChange={(e) => setSelectedServerId(e.target.value)}
                className="bg-transparent text-caption font-bold border-none focus:outline-none text-text cursor-pointer hover:text-primary transition-colors pr-2"
              >
                <option value="all" className="bg-[#111111] text-text">All Infrastructure Servers</option>
                {servers.map(s => (
                  <option key={s.id} value={s.id} className="bg-[#111111] text-text">{s.hostname} ({s.ipAddress})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Search, Notifications, Profile controls */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Search command bar */}
            <button 
              onClick={() => setShowSearch(true)}
              className="hidden md:flex items-center gap-3 rounded-input border border-border bg-[#111111] hover:bg-[#1A1A1A] px-4 py-2 text-caption text-[#71717A] hover:text-text transition-all w-56 lg:w-72 justify-between cursor-pointer shadow-sm"
            >
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-[#71717A]" />
                <span className="font-medium">Search SOC commands...</span>
              </div>
              <kbd className="bg-[#1A1A1A] text-[10px] px-2 py-0.5 rounded-input flex items-center gap-0.5 font-mono text-[#71717A] font-bold border border-border">
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
                className="p-2.5 rounded-input border border-border bg-[#111111] hover:bg-[#1A1A1A] text-[#71717A] hover:text-text transition-colors relative cursor-pointer"
              >
                <Bell className="h-4 w-4" />
                {unreadNotifCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-badge bg-critical animate-ping" />
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
                      className="absolute right-0 mt-3 w-96 rounded-card border border-border bg-[#151515] p-5 shadow-xl z-50 space-y-4"
                    >
                      <div className="flex items-center justify-between border-b border-border pb-3">
                        <span className="font-bold text-caption text-text uppercase tracking-wider">Notifications</span>
                        <span className="text-caption text-primary font-bold">Auto-healing active</span>
                      </div>
                      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                        {notifications.map(n => (
                          <div key={n.id} className="p-3.5 rounded-card bg-[#090909] border border-border hover:border-primary/20 transition-all text-left space-y-2">
                            <div className="flex items-center gap-2">
                              <span className={`h-2 w-2 rounded-badge ${n.type === 'critical' ? 'bg-critical shadow-sm shadow-critical' : 'bg-primary'}`} />
                              <span className="font-bold text-caption text-text">{n.title}</span>
                            </div>
                            <p className="text-caption text-[#A1A1AA] leading-relaxed">{n.desc}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Live status check */}
            <div className="flex h-10 w-10 items-center justify-center rounded-input border border-border bg-[#111111] text-success hover:text-success/80 transition-colors shadow-sm">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
        </header>

        {/* 3. MAIN CONTENT WORKSPACE */}
        <main className="flex-1 overflow-y-auto cyber-grid-bg relative px-page-x-desktop py-page-y-desktop xl:px-page-x-large">
          {children}
        </main>
      </div>

      {/* 4. RIGHT SIDEBAR (AI COPILOT PANEL) */}
      <motion.aside 
        animate={{ width: isCopilotCollapsed ? 48 : 360 }}
        className="flex flex-col border-l border-border bg-[#111111] h-screen sticky top-0 relative z-30 flex-shrink-0 shadow-lg"
      >
        <button 
          onClick={() => setIsCopilotCollapsed(!isCopilotCollapsed)}
          className="absolute -left-4 top-[72px] p-2 rounded-badge border border-border bg-[#090909] hover:bg-[#1A1A1A] text-[#71717A] hover:text-text z-40 transition-colors cursor-pointer"
        >
          {isCopilotCollapsed ? <ChevronLeft className="h-4.5 w-4.5" /> : <ChevronRight className="h-4.5 w-4.5" />}
        </button>

        {isCopilotCollapsed ? (
          <div className="flex flex-col items-center pt-24 pb-6 gap-6 h-full select-none animate-fade-in">
            <button 
              onClick={() => setIsCopilotCollapsed(false)}
              className="flex flex-col items-center gap-4 text-[#71717A] hover:text-primary transition-colors cursor-pointer group"
            >
              <MessageSquareCode className="h-4.5 w-4.5 text-primary group-hover:scale-110 transition-transform" />
              <div className="h-[1px] w-5 bg-border" />
              <span className="font-bold text-[10px] tracking-[0.2em] uppercase vertical-text py-2">
                COPILOT
              </span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col h-full overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between select-none bg-[#111111]">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded bg-primary/10 text-primary border border-primary/20">
                  <MessageSquareCode className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="font-bold text-caption text-text">SentinelAI Copilot</h3>
                  <p className="text-[10px] text-success font-bold">Autonomous SOC Analyst</p>
                </div>
              </div>
              <button 
                onClick={clearChat} 
                className="text-[10px] text-[#A1A1AA] hover:text-text flex items-center gap-1 border border-border px-2.5 py-1 rounded bg-[#090909] hover:bg-[#1A1A1A] transition-colors cursor-pointer"
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
                  <span className="text-[9px] text-[#71717A] mb-1 px-1">{msg.role === 'user' ? 'You' : 'SentinelAI'} • {msg.timestamp}</span>
                  <div className={`p-3 rounded-card text-caption leading-relaxed border ${
                    msg.role === 'user'
                      ? 'bg-primary/10 border-primary/20 text-text'
                      : 'bg-[#151515] border-border text-[#A1A1AA] font-medium'
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
                            __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\`(.*?)\`/g, '<code class="bg-[#1A1A1A] border border-border px-1 py-0.2 rounded text-text font-mono text-[10px]">$1</code>')
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
            <div className="p-3 border-t border-border bg-[#111111]/30">
              <span className="text-[10px] text-[#71717A] block mb-1.5 font-bold uppercase tracking-wider select-none">Suggested Inquiries:</span>
              <div className="flex flex-col gap-1.5">
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(s)}
                    className="text-caption text-left p-2.5 rounded-input border border-border bg-[#151515] hover:bg-primary/5 hover:border-primary/20 transition-all text-[#A1A1AA] hover:text-text font-medium truncate cursor-pointer"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Input form */}
            <div className="p-3 border-t border-border bg-[#111111]/50">
              <div className="flex items-center gap-2 rounded-input border border-border bg-[#151515] p-1.5">
                <input 
                  type="text" 
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask SentinelAI (e.g. Recommend fix)..."
                  className="flex-1 bg-transparent border-none text-caption text-text placeholder:text-[#71717A] focus:outline-none pl-2 py-1.5"
                />
                <button 
                  onClick={handleSend}
                  className="h-8 w-8 rounded-input bg-primary text-text flex items-center justify-center hover:bg-[#FB923C] transition-colors cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
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
              className="w-full max-w-xl rounded-card border border-border bg-[#151515] p-5 shadow-2xl z-50"
            >
              <div className="flex items-center gap-2 border-b border-border pb-3.5 mb-3.5">
                <Search className="h-4 w-4 text-[#71717A]" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type a command or search entities (e.g. Incidents, Server-01)..."
                  className="flex-1 bg-transparent border-none text-small-text text-text focus:outline-none placeholder:text-[#71717A]"
                  autoFocus
                />
                <kbd className="bg-[#1A1A1A] border border-border text-[9px] px-1.5 py-0.5 rounded-input text-[#71717A]">ESC</kbd>
              </div>
              
              <div className="space-y-4">
                {/* Pages Section */}
                <div>
                  <span className="text-[10px] text-[#71717A] font-bold tracking-wider block mb-2">PAGES</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {sidebarItems.map(item => (
                      <button
                        key={item.name}
                        onClick={() => {
                          setShowSearch(false);
                          navigateTo(item.name, item.route);
                        }}
                        className="flex items-center gap-2.5 p-2 rounded-input hover:bg-primary/10 border border-transparent hover:border-primary/20 text-caption text-left text-[#A1A1AA] hover:text-text transition-colors cursor-pointer"
                      >
                        <item.icon className="h-3.5 w-3.5 text-primary" />
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hot Actions */}
                <div>
                  <span className="text-[10px] text-[#71717A] font-bold tracking-wider block mb-2">QUICK REMEDIATION</span>
                  <div className="space-y-1.5">
                    {approvals.map(app => (
                      <button
                        key={app.id}
                        onClick={() => {
                          setShowSearch(false);
                          navigateTo('approvals', '/approvals');
                        }}
                        className="flex items-center justify-between w-full p-2.5 rounded-input bg-[#090909] hover:bg-[#1A1A1A] border border-border hover:border-primary/20 text-caption text-left transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <CheckSquare className="h-3.5 w-3.5 text-critical" />
                          <span className="font-bold text-text truncate max-w-[300px]">{app.title}</span>
                          <span className="text-[9px] text-[#71717A]">{app.server}</span>
                        </div>
                        <span className="text-[9px] bg-critical/10 text-critical border border-critical/20 px-1.5 py-0.5 rounded-badge font-bold">{app.risk.toUpperCase()}</span>
                      </button>
                    ))}
                    {approvals.length === 0 && (
                      <div className="text-center text-[10px] text-[#71717A] py-2">No pending approvals queue. System fully secure.</div>
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
