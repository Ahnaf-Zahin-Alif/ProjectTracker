import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
      <div className="fixed inset-4 z-50 flex flex-col studio-panel bg-[#0b101b]/98 border-cyan-500/50 p-6 shadow-2xl overflow-hidden backdrop-blur-xl">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.08]">
          <div className="flex items-center space-x-3">
            {Icon && <Icon className={`w-5 h-5 ${headerAccent}`} />}
            <h2 className="text-lg font-bold text-slate-100 tracking-tight">{title}</h2>
            {badge && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800/80">
                {badge}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {actions}
            <button
              onClick={() => setIsMaximized(false)}
              className="p-1.5 rounded-lg bg-[#111827] text-slate-400 hover:text-white hover:bg-[#162033] transition"
              title="Exit Fullscreen Tile"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto pr-2">{children}</div>
      </div>
    );
  }

  return (
    <div className={`${colSpan} studio-panel flex flex-col overflow-hidden`}>
      {/* Tile Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06] bg-[#0e1422]/60 select-none">
        <div className="flex items-center space-x-2.5">
          {Icon && <Icon className={`w-4 h-4 ${headerAccent}`} />}
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">{title}</h3>
          {badge && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-[#111827] text-cyan-300 border border-white/[0.08]">
              {badge}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-1.5">
          {actions}

          <button
            onClick={() => setIsMaximized(true)}
            className="p-1 rounded-md bg-[#111827]/70 text-slate-400 hover:text-cyan-400 hover:bg-[#162033] transition"
            title="Maximize Tile"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsCollapsed(prev => !prev)}
            className="p-1 rounded-md bg-[#111827]/70 text-slate-400 hover:text-slate-200 hover:bg-[#162033] transition"
            title={isCollapsed ? 'Expand Tile' : 'Collapse Tile'}
          >
            {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Tile Body with smooth spring collapse */}
      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="p-5 flex-1 overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
