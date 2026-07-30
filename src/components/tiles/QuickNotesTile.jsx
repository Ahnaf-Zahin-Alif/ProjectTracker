import React from 'react';
import { useAppState } from '../../context/AppStateContext';
import { TileWrapper } from './TileWrapper';
import { FileText, Save, Check } from 'lucide-react';

export function QuickNotesTile() {
  const { notes, setNotes, showToast } = useAppState();

  const handleSave = () => {
    showToast('📝 Scratchpad notes saved to localStorage!');
  };

  return (
    <TileWrapper
      title="Quick Scratchpad & Drafts"
      icon={FileText}
      badge="Auto-Saved"
      colSpan="col-span-12 lg:col-span-6"
      headerAccent="text-amber-400"
      actions={
        <button
          onClick={handleSave}
          className="flex items-center space-x-1 px-2.5 py-1 text-xs rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save</span>
        </button>
      }
    >
      <div className="flex flex-col h-full space-y-2">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Jot down quick thoughts, architectural notes, or terminal commands..."
          className="glass-input font-mono text-xs w-full h-64 resize-none leading-relaxed"
        />
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span>Markdown supported. Automatically persists in localStorage.</span>
          <span>{notes.length} chars</span>
        </div>
      </div>
    </TileWrapper>
  );
}
