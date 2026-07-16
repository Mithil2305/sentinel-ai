'use client';

import React, { useState } from 'react';
import { 
  Settings, Bell, Sparkles, Shield, Share2, 
  Save, MessageSquare, Mail, Webhook 
} from 'lucide-react';

// Import Reusable Design System Components
import { PageHeader } from '@/components/ui/page-header';
import { ActionButton } from '@/components/ui/action-button';

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
    <div className="max-w-7xl mx-auto pb-16 space-y-8 animate-fade-in">
      
      {/* Page Header with Save Button in Action Slot */}
      <PageHeader 
        title="Platform Configuration" 
        description="Configure autonomous thresholds, notification tunnels, integrations, and compliance policy templates."
        icon={Settings}
        rightElement={
          <ActionButton
            onClick={handleSave}
            loading={saving}
            variant="primary"
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            <span>Save Settings</span>
          </ActionButton>
        }
      />

      {/* TABS CONTAINER AND CONFIG VIEW */}
      <div className="flex flex-col md:flex-row items-start gap-8">
        
        {/* Left Vertical Tab Selection Bar */}
        <div className="w-full md:w-64 space-y-2 bg-card/25 border border-border p-3 rounded-card flex-shrink-0 select-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-3 w-full rounded-input px-4 py-3 text-caption font-bold text-left transition-all cursor-pointer ${
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
        <div className="flex-1 w-full bg-card/45 border border-border rounded-card p-card-padding min-h-[400px] shadow-md">
          
          {/* TAB 1: GENERAL */}
          {activeTab === 'general' && (
            <div className="space-y-6 text-caption">
              <div className="border-b border-border pb-3.5 mb-5 select-none">
                <h3 className="font-bold text-[14px] text-text uppercase tracking-wider">General Settings</h3>
                <p className="text-caption text-muted mt-1 font-normal">Manage organization profile and environment scopes</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="font-bold text-[10px] uppercase text-muted block select-none">Organization Alias</label>
                  <input 
                    type="text" 
                    defaultValue="Enterprise Cloud Sec" 
                    className="w-full h-10 bg-background border border-border rounded-input px-4 py-2 text-small-text text-text focus:outline-none focus:border-primary/50 transition-colors" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-[10px] uppercase text-muted block select-none">Environment Tag</label>
                  <input 
                    type="text" 
                    defaultValue="Production-US-East" 
                    className="w-full h-10 bg-background border border-border rounded-input px-4 py-2 text-small-text text-text focus:outline-none focus:border-primary/50 transition-colors" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="font-bold text-[10px] uppercase text-muted block select-none">Console Session Timeout</label>
                  <select className="w-full h-10 bg-background border border-border rounded-input px-3.5 text-small-text font-bold text-text focus:outline-none cursor-pointer">
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
            <div className="space-y-6 text-caption text-muted">
              <div className="border-b border-border pb-3.5 mb-5 select-none">
                <h3 className="font-bold text-[14px] text-text border-b border-border pb-1 uppercase tracking-wider">Notification Routing Tunnel</h3>
                <p className="text-caption text-muted mt-1 font-normal">Stream critical SOC activity to external communicators</p>
              </div>
              
              <div className="p-5 rounded-input border border-border bg-background/25 flex items-start gap-4 justify-between">
                <div className="flex items-start gap-3">
                  <MessageSquare className="h-5 w-5 text-[#4A154B] mt-0.5" />
                  <div>
                    <span className="font-bold text-text text-small-text block">Slack Security Feed Integration</span>
                    <p className="text-[11px] mt-0.5 font-normal">Stream critical alerts directly into Slack #soc-alerts</p>
                  </div>
                </div>
                <input type="checkbox" defaultChecked className="h-5 w-5 cursor-pointer accent-primary mt-0.5" />
              </div>

              <div className="p-5 rounded-input border border-border bg-background/25 flex items-start gap-4 justify-between">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <span className="font-bold text-text text-small-text block">Email Notifications Dispatcher</span>
                    <p className="text-[11px] mt-0.5 font-normal">Dispatch daily incident highlights to security leads</p>
                  </div>
                </div>
                <input type="checkbox" defaultChecked className="h-5 w-5 cursor-pointer accent-primary mt-0.5" />
              </div>

              <div className="p-5 rounded-input border border-border bg-background/25 flex items-start gap-4 justify-between">
                <div className="flex items-start gap-3">
                  <Webhook className="h-5 w-5 text-success mt-0.5" />
                  <div>
                    <span className="font-bold text-text text-small-text block">SIEM Webhook Receiver</span>
                    <p className="text-[11px] mt-0.5 font-normal">Ingest structured JSON event data into Splunk endpoint</p>
                  </div>
                </div>
                <input type="checkbox" className="h-5 w-5 cursor-pointer accent-primary mt-0.5" />
              </div>
            </div>
          )}

          {/* TAB 3: AI CONFIGURATION */}
          {activeTab === 'ai' && (
            <div className="space-y-6 text-caption">
              <div className="border-b border-border pb-3.5 mb-5 select-none">
                <h3 className="font-bold text-[14px] text-text uppercase tracking-wider">Autonomous AI Configuration</h3>
                <p className="text-caption text-muted mt-1 font-normal">Adjust model autonomy boundaries and trust thresholds</p>
              </div>

              {/* Autonomy Level Slider */}
              <div className="space-y-3">
                <div className="flex justify-between font-bold text-[10px] uppercase text-muted select-none">
                  <span>Remediation Autonomy Level</span>
                  <span className="text-primary font-bold">{autonomyLevel}% Autonomous</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={autonomyLevel} 
                  onChange={(e) => setAutonomyLevel(Number(e.target.value))}
                  className="w-full h-1.5 bg-border rounded-badge appearance-none cursor-pointer accent-primary"
                />
                <p className="text-[11px] text-muted leading-relaxed font-normal">
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
                <div className="flex justify-between font-bold text-[10px] uppercase text-muted select-none">
                  <span>AI Detection Confidence Gate</span>
                  <span className="text-primary font-bold">&ge;{confidenceThreshold}% Confidence</span>
                </div>
                <input 
                  type="range" 
                  min="50" 
                  max="98" 
                  value={confidenceThreshold} 
                  onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                  className="w-full h-1.5 bg-border rounded-badge appearance-none cursor-pointer accent-primary"
                />
                <p className="text-[11px] text-muted font-normal">
                  SentinelAI suppresses threat indicators scoring below this confidence value to reduce SOC fatigue.
                </p>
              </div>

              {/* Copilot Model Engine */}
              <div className="pt-2 space-y-1.5">
                <label className="font-bold text-[10px] uppercase text-muted block select-none">Model Engine Node</label>
                <select
                  value={aiModel}
                  onChange={(e) => setAiModel(e.target.value)}
                  className="w-full h-10 bg-background border border-border rounded-input px-3.5 text-small-text font-bold text-text focus:outline-none cursor-pointer"
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
            <div className="space-y-6 text-caption text-muted">
              <div className="border-b border-border pb-3.5 mb-5 select-none">
                <h3 className="font-bold text-[14px] text-text border-b border-border pb-1 uppercase tracking-wider">Active Security Templates</h3>
                <p className="text-caption text-muted mt-1 font-normal">Hardening compliance standards mapped against ingestion</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
                {[
                  { title: 'CIS Benchmarks Level 1', desc: 'Core system hardening compliance checks active.', checked: true },
                  { title: 'PCI-DSS v4.0 Compliance', desc: 'Enforce cardholder isolated networks policy.', checked: true },
                  { title: 'SOC 2 Type II Auditing', desc: 'Audit system log configurations.', checked: true },
                  { title: 'HIPAA Isolation Matrix', desc: 'Patient databases TLS enforcement.', checked: false },
                ].map((p, idx) => (
                  <div key={idx} className="p-5 rounded-input border border-border bg-background/25 flex items-start gap-3 justify-between">
                    <div>
                      <span className="font-bold text-text text-small-text block">{p.title}</span>
                      <span className="text-[11px] text-muted block mt-1 leading-normal font-normal">{p.desc}</span>
                    </div>
                    <input type="checkbox" defaultChecked={p.checked} className="h-5 w-5 cursor-pointer accent-primary mt-0.5 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: INTEGRATIONS */}
          {activeTab === 'integrations' && (
            <div className="space-y-6 text-caption">
              <div className="border-b border-border pb-3.5 mb-5 select-none">
                <h3 className="font-bold text-[14px] text-text border-b border-border pb-1 uppercase tracking-wider">Third-Party Agent API Integrations</h3>
                <p className="text-caption text-muted mt-1 font-normal">Connect SentinelAI to secondary telemetry ingestion endpoints</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="font-bold text-[10px] uppercase text-muted block select-none">Crowdstrike Falcon Client ID</label>
                  <input 
                    type="password" 
                    value="****************************************" 
                    disabled 
                    className="w-full h-10 bg-background/50 border border-border rounded-input px-4 py-2 text-muted focus:outline-none select-none font-mono" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-[10px] uppercase text-muted block select-none">Microsoft Sentinel Workspace Key</label>
                  <input 
                    type="password" 
                    value="****************************************" 
                    disabled 
                    className="w-full h-10 bg-background/50 border border-border rounded-input px-4 py-2 text-muted focus:outline-none select-none font-mono" 
                  />
                </div>
              </div>
              <p className="text-caption text-muted mt-2 leading-relaxed font-normal">
                Connect SentinelAI to external EDR endpoints to synthesize alert feeds into a unified SOC view.
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
