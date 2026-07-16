'use client';

import React, { useState } from 'react';
import { 
  Settings, Bell, Sparkles, Shield, Share2, Users, 
  Save, RefreshCw, Command, MessageSquare, Mail, Webhook, Cpu 
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'ai' | 'policies' | 'integrations'>('ai');
  const [saving, setSaving] = useState(false);

  // Form State Values
  const [autonomyLevel, setAutonomyLevel] = useState(70); // 0 = fully manual, 100 = fully autonomous
  const [confidenceThreshold, setConfidenceThreshold] = useState(85);
  const [aiModel, setAiModel] = useState('gemini-3.5-flash');

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert('Settings saved successfully!');
    }, 1000);
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'ai', label: 'AI Configuration', icon: Sparkles },
    { id: 'policies', label: 'Security Policies', icon: Shield },
    { id: 'integrations', label: 'Integrations', icon: Share2 },
  ];

  return (
    <div className="max-w-7xl mx-auto pb-16 space-y-8">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border pb-5 mb-8">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            <span>Platform Configuration</span>
          </h1>
          <p className="text-sm text-muted mt-1.5">
            Configure autonomous thresholds, notification tunnels, integrations, and compliance policy templates.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary hover:bg-primary/95 text-text text-sm font-bold transition-all cursor-pointer shadow-lg shadow-primary/10 disabled:opacity-50"
        >
          {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      {/* TABS CONTAINER AND CONFIG VIEW */}
      <div className="flex flex-col md:flex-row items-start gap-8">
        
        {/* Left Vertical Tab Selection Bar */}
        <div className="w-full md:w-64 space-y-2 bg-card/25 border border-border p-3 rounded-xl flex-shrink-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-3 w-full rounded-lg px-4 py-3 text-sm font-bold text-left transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-primary/10 text-primary border border-primary/20' 
                    : 'text-muted hover:bg-border/30 hover:text-text'
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Configuration Forms Column */}
        <div className="flex-1 w-full bg-card/45 border border-border rounded-xl p-8 min-h-[400px]">
          
          {/* TAB 1: GENERAL */}
          {activeTab === 'general' && (
            <div className="space-y-6 text-sm">
              <h3 className="font-extrabold text-base border-b border-border pb-3.5 mb-5">General Settings</h3>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="font-bold text-xs uppercase text-muted block mb-2">Organization Alias</label>
                  <input type="text" defaultValue="Enterprise Cloud Sec" className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-text focus:outline-none" />
                </div>
                <div>
                  <label className="font-bold text-xs uppercase text-muted block mb-2">Environment Tag</label>
                  <input type="text" defaultValue="Production-US-East" className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-text focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="font-bold text-xs uppercase text-muted block mb-2">Console Session Timeout</label>
                  <select className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-text focus:outline-none cursor-pointer">
                    <option>30 Minutes (Recommended)</option>
                    <option>1 Hour</option>
                    <option>4 Hours</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="space-y-6 text-sm text-muted">
              <h3 className="font-extrabold text-base text-text border-b border-border pb-3.5 mb-5">Notification Routing Tunnel</h3>
              
              <div className="p-5 rounded-lg border border-border bg-background/25 flex items-start gap-4 justify-between">
                <div className="flex items-start gap-3">
                  <MessageSquare className="h-5 w-5 text-[#4A154B] mt-0.5" />
                  <div>
                    <span className="font-bold text-text text-sm block">Slack Security Feed Integration</span>
                    <p className="text-xs mt-0.5">Stream critical alerts directly into Slack #soc-alerts</p>
                  </div>
                </div>
                <input type="checkbox" defaultChecked className="h-5 w-5 cursor-pointer accent-primary mt-0.5" />
              </div>

              <div className="p-5 rounded-lg border border-border bg-background/25 flex items-start gap-4 justify-between">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <span className="font-bold text-text text-sm block">Email Notifications Dispatcher</span>
                    <p className="text-xs mt-0.5">Dispatch daily incident highlights to security leads</p>
                  </div>
                </div>
                <input type="checkbox" defaultChecked className="h-5 w-5 cursor-pointer accent-primary mt-0.5" />
              </div>

              <div className="p-5 rounded-lg border border-border bg-background/25 flex items-start gap-4 justify-between">
                <div className="flex items-start gap-3">
                  <Webhook className="h-5 w-5 text-success mt-0.5" />
                  <div>
                    <span className="font-bold text-text text-sm block">SIEM Webhook Receiver</span>
                    <p className="text-xs mt-0.5">Ingest structured JSON event data into Splunk endpoint</p>
                  </div>
                </div>
                <input type="checkbox" className="h-5 w-5 cursor-pointer accent-primary mt-0.5" />
              </div>
            </div>
          )}

          {/* TAB 3: AI CONFIGURATION */}
          {activeTab === 'ai' && (
            <div className="space-y-6 text-sm">
              <div className="border-b border-border pb-3.5 mb-5">
                <h3 className="font-extrabold text-base text-text">Autonomous AI Configuration</h3>
                <p className="text-xs text-muted mt-1">Adjust model autonomy boundaries and trust boundaries</p>
              </div>

              {/* Autonomy Level Slider */}
              <div className="space-y-3">
                <div className="flex justify-between font-bold text-xs uppercase text-muted">
                  <span>Remediation Autonomy Level</span>
                  <span className="text-primary">{autonomyLevel}% Autonomous</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={autonomyLevel} 
                  onChange={(e) => setAutonomyLevel(Number(e.target.value))}
                  className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <p className="text-xs text-muted leading-relaxed">
                  {autonomyLevel > 80 
                    ? 'CRITICAL WARNING: SentinelAI will autonomously isolate compromised hosts and terminate dangerous binaries without human approval.'
                    : autonomyLevel > 50
                      ? 'RECOMMENDED: SentinelAI autonomously mitigates low/medium risks. Critical risks are paused in the approval queue.'
                      : 'MANUAL MODE: All remediation actions require explicit operator confirmation.'
                  }
                </p>
              </div>

              {/* Confidence Threshold */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between font-bold text-xs uppercase text-muted">
                  <span>AI Detection Confidence Gate</span>
                  <span className="text-primary">&ge;{confidenceThreshold}% Confidence</span>
                </div>
                <input 
                  type="range" 
                  min="50" 
                  max="98" 
                  value={confidenceThreshold} 
                  onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                  className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <p className="text-xs text-muted">
                  SentinelAI suppresses threat indicators scoring below this confidence value to reduce SOC fatigue.
                </p>
              </div>

              {/* Copilot Model Engine */}
              <div className="pt-2">
                <label className="font-bold text-xs uppercase text-muted block mb-2">Model Engine Node</label>
                <select
                  value={aiModel}
                  onChange={(e) => setAiModel(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-text focus:outline-none cursor-pointer"
                >
                  <option value="gemini-3.5-flash">Gemini 3.5 Flash (Optimized Latency)</option>
                  <option value="gemini-3.5-pro">Gemini 3.5 Pro (Deep Reasoner)</option>
                  <option value="gpt-4o">GPT-4o Enterprise Agent</option>
                </select>
              </div>
            </div>
          )}

          {/* TAB 4: SECURITY POLICIES */}
          {activeTab === 'policies' && (
            <div className="space-y-6 text-sm text-muted">
              <h3 className="font-extrabold text-base text-text border-b border-border pb-3.5 mb-5">Active Security Templates</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
                {[
                  { title: 'CIS Benchmarks Level 1', desc: 'Core system hardening compliance checks active.', checked: true },
                  { title: 'PCI-DSS v4.0 Compliance', desc: 'Enforce cardholder isolated networks policy.', checked: true },
                  { title: 'SOC 2 Type II Auditing', desc: 'Audit system log configurations.', checked: true },
                  { title: 'HIPAA Isolation Matrix', desc: 'Patient databases TLS enforcement.', checked: false },
                ].map((p, idx) => (
                  <div key={idx} className="p-5 rounded-lg border border-border bg-background/25 flex items-start gap-3 justify-between">
                    <div>
                      <span className="font-bold text-text text-sm block">{p.title}</span>
                      <span className="text-xs text-muted block mt-1 leading-normal">{p.desc}</span>
                    </div>
                    <input type="checkbox" defaultChecked={p.checked} className="h-5 w-5 cursor-pointer accent-primary mt-0.5 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: INTEGRATIONS */}
          {activeTab === 'integrations' && (
            <div className="space-y-6 text-sm">
              <h3 className="font-extrabold text-base border-b border-border pb-3.5 mb-5">Third-Party Agent API Integrations</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="font-bold text-xs uppercase text-muted block mb-2">Crowdstrike Falcon Client ID</label>
                  <input type="password" value="****************************************" disabled className="w-full bg-background/50 border border-border rounded-lg px-4 py-2.5 text-muted focus:outline-none" />
                </div>
                <div>
                  <label className="font-bold text-xs uppercase text-muted block mb-2">Microsoft Sentinel Workspace Key</label>
                  <input type="password" value="****************************************" disabled className="w-full bg-background/50 border border-border rounded-lg px-4 py-2.5 text-muted focus:outline-none" />
                </div>
              </div>
              <p className="text-xs text-muted mt-2 leading-relaxed">
                Connect SentinelAI to external EDR endpoints to synthesize alert feeds into a unified SOC view.
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
