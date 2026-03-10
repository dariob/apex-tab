import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ReactSortable } from 'react-sortablejs';
import { X, GripHorizontal, Settings2, Plus } from 'lucide-react';

import Clock from './Clock';
import SearchBar from './SearchBar';
import QuickLinks from './QuickLinks';
import Greeting from './Greeting';
import type { GreetingSettings } from './Greeting';

export type WidgetType = 'clock' | 'search' | 'quicklinks' | 'greeting';

export interface WidgetInstance {
  id: string;
  type: WidgetType;
  settings: Record<string, unknown>;
}

const DEFAULT_WIDGETS: WidgetInstance[] = [
  { id: 'w_clock', type: 'clock', settings: {} },
  { id: 'w_search', type: 'search', settings: {} },
  { id: 'w_quicklinks', type: 'quicklinks', settings: {} },
];

const WIDGET_CATALOG: { type: WidgetType; name: string; defaultSettings: Record<string, unknown> }[] = [
  { type: 'clock', name: 'Orologio', defaultSettings: {} },
  { type: 'search', name: 'Barra di Ricerca', defaultSettings: {} },
  { type: 'quicklinks', name: 'Link Veloci', defaultSettings: {} },
  { type: 'greeting', name: 'Saluto Personalizzato', defaultSettings: { text: 'Ciao Dario!' } },
];

const WidgetManager = ({ isEditMode }: { isEditMode: boolean }) => {
  const [widgets, setWidgets] = useState<WidgetInstance[]>(() => {
    const saved = localStorage.getItem('startpage_widgets');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_WIDGETS;
      }
    }
    return DEFAULT_WIDGETS;
  });

  const [isAddingWidget, setIsAddingWidget] = useState(false);
  const [editingWidget, setEditingWidget] = useState<WidgetInstance | null>(null);

  useEffect(() => {
    localStorage.setItem('startpage_widgets', JSON.stringify(widgets));
  }, [widgets]);

  const removeWidget = (id: string) => {
    if (window.confirm('Rimuovere questo widget?')) {
      setWidgets(prev => prev.filter(w => w.id !== id));
    }
  };

  const addWidget = (type: WidgetType, defaultSettings: Record<string, unknown>) => {
    const newWidget: WidgetInstance = {
      id: `w_${crypto.randomUUID()}`,
      type,
      settings: defaultSettings,
    };
    setWidgets([...widgets, newWidget]);
    setIsAddingWidget(false);
  };

  const saveWidgetSettings = (id: string, newSettings: Record<string, unknown>) => {
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, settings: newSettings } : w));
    setEditingWidget(null);
  };

  const renderWidgetContent = (widget: WidgetInstance) => {
    switch (widget.type) {
      case 'clock': return <Clock />;
      case 'search': return <SearchBar />;
      case 'quicklinks': return <QuickLinks isEditMode={isEditMode} />;
      case 'greeting': return <Greeting settings={widget.settings as unknown as GreetingSettings} />;
      default: return null;
    }
  };

  return (
    <div className="w-full relative min-h-[50vh]">
      <ReactSortable
        list={widgets}
        setList={setWidgets}
        animation={200}
        disabled={!isEditMode}
        handle=".widget-drag-handle"
        className="w-full flex flex-col items-center gap-6 pb-20"
      >
        {widgets.map(widget => (
          <div key={widget.id} className="w-full relative group flex flex-col items-center justify-center">
            
            {/* Widget Controls Wrapper */}
            {isEditMode && (
              <div className="absolute -top-10 flex items-center gap-2 bg-slate-800/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-50">
                <div 
                  className="widget-drag-handle cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-white transition-colors"
                  title="Trascina Widget"
                >
                  <GripHorizontal className="w-4 h-4" />
                </div>
                
                {widget.type === 'greeting' && (
                  <button 
                    onClick={() => setEditingWidget(widget)}
                    className="p-1 text-slate-400 hover:text-blue-400 transition-colors"
                    title="Impostazioni"
                  >
                    <Settings2 className="w-4 h-4" />
                  </button>
                )}

                <button 
                  onClick={() => removeWidget(widget.id)}
                  className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                  title="Rimuovi Widget"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            
            <div className={`w-full flex justify-center ${isEditMode ? 'ring-2 ring-transparent group-hover:ring-slate-700/50 rounded-3xl p-4 transition-all' : ''}`}>
              {renderWidgetContent(widget)}
            </div>
            
          </div>
        ))}
      </ReactSortable>

      {/* Global Add Widget Button */}
      <AnimatePresence>
        {isEditMode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40"
          >
            <motion.button
              onClick={() => setIsAddingWidget(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600/90 hover:bg-blue-500 text-white backdrop-blur-md transition-all shadow-xl border border-blue-400/30"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Aggiungi Widget</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Widget Catalog Modal */}
      <AnimatePresence>
        {isAddingWidget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md p-6 rounded-3xl bg-slate-800 border border-slate-700 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-medium text-xl">Nuovo Widget</h3>
                <button onClick={() => setIsAddingWidget(false)} className="p-1 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {WIDGET_CATALOG.map((catalogItem) => (
                  <button
                    key={catalogItem.type}
                    onClick={() => addWidget(catalogItem.type, catalogItem.defaultSettings)}
                    className="flex flex-col items-start p-4 rounded-2xl bg-slate-900/50 hover:bg-blue-500/10 border border-slate-700 hover:border-blue-500/30 transition-all text-left group"
                  >
                    <span className="text-slate-200 font-medium group-hover:text-white">{catalogItem.name}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Editing Widget Settings Modal (Greeting specifically for now) */}
      <AnimatePresence>
        {editingWidget && editingWidget.type === 'greeting' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm p-6 rounded-3xl bg-slate-800 border border-slate-700 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-white font-medium text-lg">Testo Saluto</h3>
                <button onClick={() => setEditingWidget(null)} className="p-1 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  saveWidgetSettings(editingWidget.id, { text: fd.get('text') as string });
                }} 
                className="flex flex-col gap-4"
              >
                <input
                  name="text"
                  type="text"
                  defaultValue={editingWidget.settings.text as string}
                  placeholder="Es. Ciao Dario!"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 focus:border-blue-500 rounded-xl text-white text-base focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                  autoFocus
                  required
                />
                <button
                  type="submit"
                  className="mt-2 w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-all shadow-lg hover:shadow-blue-500/25"
                >
                  Salva Modifiche
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default WidgetManager;
