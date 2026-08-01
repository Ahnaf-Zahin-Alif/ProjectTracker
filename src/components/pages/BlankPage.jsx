import React, { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { 
  FilePlus, 
  Plus, 
  Sparkles, 
  LayoutDashboard, 
  FolderKanban, 
  FileText, 
  Layers, 
  Save, 
  Trash2, 
  CheckSquare, 
  Square,
  Zap,
  Grid
} from 'lucide-react';

export function BlankPage() {
  const { 
    projects, 
    setIsNewProjectModalOpen, 
    setCurrentView,
    showToast 
  } = useAppState();

  const [page2Notes, setPage2Notes] = useState(() => {
    try {
      return localStorage.getItem('pt_page2_notes') || '';
    } catch (e) {
      return '';
    }
  });

  const [page2Cards, setPage2Cards] = useState(() => {
    try {
      const saved = localStorage.getItem('pt_page2_cards');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [newCardTitle, setNewCardTitle] = useState('');
  const [newCardContent, setNewCardContent] = useState('');

  const savePage2Notes = (val) => {
    setPage2Notes(val);
    try {
      localStorage.setItem('pt_page2_notes', val);
    } catch (e) {}
  };

  const handleAddCard = (e) => {
    e.preventDefault();
    if (!newCardTitle.trim()) return;

    const newCard = {
      id: `card_${Date.now()}`,
      title: newCardTitle.trim(),
      content: newCardContent.trim(),
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updated = [newCard, ...page2Cards];
    setPage2Cards(updated);
    try {
      localStorage.setItem('pt_page2_cards', JSON.stringify(updated));
    } catch (e) {}

    setNewCardTitle('');
    setNewCardContent('');
    showToast('✨ Added card to Page 2 canvas!');
  };

  const handleDeleteCard = (cardId) => {
    const updated = page2Cards.filter(c => c.id !== cardId);
    setPage2Cards(updated);
    try {
      localStorage.setItem('pt_page2_cards', JSON.stringify(updated));
    } catch (e) {}
    showToast('🗑️ Card removed from Page 2');
  };

  return (
    <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6 animate-in fade-in duration-200">
      
      {/* Page 2 Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/40 border border-slate-800 shadow-xl">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-lg shadow-cyan-500/10">
            <Grid className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-extrabold text-lg text-slate-100 tracking-tight">Page 2: Blank Canvas & Workspace</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">PAGE 2</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Customizable blank page for extra project drafts, focus notes, or scratchpad tiles.</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          <button
            onClick={() => setIsNewProjectModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-cyan-500/20"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>New Project</span>
          </button>

          <button
            onClick={() => setCurrentView('page1')}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold transition"
          >
            <LayoutDashboard className="w-4 h-4 text-cyan-400" />
            <span>Back to Page 1</span>
          </button>
        </div>
      </div>

      {/* Grid Layout for Page 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Quick Notepad for Page 2 */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="glass-panel p-5 rounded-2xl bg-slate-900/80 border-slate-800 flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm text-slate-200">Page 2 Scratchpad & Notes</h3>
              </div>
              <button
                onClick={() => showToast('📝 Page 2 notes saved!')}
                className="flex items-center space-x-1 px-2.5 py-1 text-xs rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </div>

            <textarea
              value={page2Notes}
              onChange={(e) => savePage2Notes(e.target.value)}
              placeholder="Type your notes, ideas, or temporary specs for Page 2..."
              className="glass-input font-mono text-xs w-full h-72 resize-none leading-relaxed bg-slate-950"
            />
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Auto-saves to Page 2 cache</span>
              <span>{page2Notes.length} characters</span>
            </div>
          </div>
        </div>

        {/* Right Column: Custom Cards Creator */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          
          {/* New Card Form */}
          <div className="glass-panel p-5 rounded-2xl bg-slate-900/80 border-slate-800 space-y-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-sm text-slate-200">Add Custom Card / Tile</h3>
            </div>

            <form onSubmit={handleAddCard} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Card Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Next.js API Architecture Ideas"
                  value={newCardTitle}
                  onChange={(e) => setNewCardTitle(e.target.value)}
                  className="glass-input w-full text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Card Details / Code Snippet</label>
                <textarea
                  rows={3}
                  placeholder="Details, checklist items, or links..."
                  value={newCardContent}
                  onChange={(e) => setNewCardContent(e.target.value)}
                  className="glass-input w-full text-xs font-mono resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center space-x-1.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition shadow-md shadow-cyan-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>Add Card to Canvas</span>
              </button>
            </form>
          </div>

          {/* Cards List */}
          <div className="space-y-3">
            {page2Cards.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-2">
                <FilePlus className="w-6 h-6 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400 font-medium">Page 2 Canvas is empty</p>
                <p className="text-[11px] text-slate-500">Create a custom card above or start drafting your ideas.</p>
              </div>
            ) : (
              page2Cards.map((card) => (
                <div key={card.id} className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 relative group hover:border-slate-700 transition">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-200 text-xs">{card.title}</h4>
                      <span className="text-[10px] text-slate-500 font-mono">{card.createdAt}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteCard(card.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition"
                      title="Delete card"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {card.content && (
                    <p className="text-xs text-slate-300 whitespace-pre-wrap font-mono bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                      {card.content}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>

        </div>

      </div>

    </main>
  );
}
