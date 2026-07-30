import React, { useState } from 'react';
import { Maximize2, Minimize2, ChevronDown, ChevronUp } from 'lucide-react';

export function TileWrapper({ 
  title, 
  icon: Icon, 
  badge, 
  colSpan = 'col-span-12 lg:col-span-6', 
  actions, 
  children,
  headerAccent = 'text-cyan-400'
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  if (isMaximized) {
    return (
      <div className="fixed inset-4 z-50 flex flex-col glass-panel bg-slate-950/95 border-cyan-500/50 p-6 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            {Icon && <Icon className={`w-6 h-6 ${headerAccent}`} />}
            <h2 className="text-xl font-bold text-slate-100 tracking-tight">{title}</h2>
            {badge && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800/80">
                {badge}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {actions}
            <button
              onClick={() => setIsMaximized(false)}
              className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Exit Fullscreen Tile"
            >
              <Minimize2 className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto pr-2">{children}</div>
      </div>
    );
  }

  return (
    <div className={`${colSpan} glass-panel flex flex-col overflow-hidden transition-all duration-200`}>
      {/* Tile Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800/80 bg-slate-900/40 select-none">
        <div className="flex items-center space-x-2.5">
          {Icon && <Icon className={`w-4 h-4 ${headerAccent}`} />}
          <h3 className="font-bold text-sm text-slate-200 tracking-tight">{title}</h3>
          {badge && (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-800/80 text-cyan-300 border border-slate-700/60">
              {badge}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-1.5">
          {actions}

          <button
            onClick={() => setIsMaximized(true)}
            className="p-1 rounded bg-slate-900/60 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition"
            title="Maximize Tile View"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsCollapsed(prev => !prev)}
            className="p-1 rounded bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            title={isCollapsed ? 'Expand Tile' : 'Collapse Tile'}
          >
            {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Tile Body */}
      {!isCollapsed && (
        <div className="p-5 flex-1 overflow-y-auto max-h-[500px]">{children}</div>
      )}
    </div>
  );
}
