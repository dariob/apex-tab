import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ReactSortable } from 'react-sortablejs';
import { X, GripHorizontal, Settings2, Plus } from 'lucide-react';

import Clock from './Clock';
import SearchBar from './SearchBar';
import QuickLinks from './QuickLinks';
import Greeting from './Greeting';
import type { GreetingSettings } from './Greeting';
import Quote from './Quote';
import Weather from './Weather';
import type { WeatherSettings } from './Weather';

export type WidgetType = 'clock' | 'search' | 'quicklinks' | 'greeting' | 'quote' | 'weather';

export interface WidgetInstance {
  id: string;
  type: WidgetType;
  settings: Record<string, unknown>;
}

export interface WidgetLayout {
  left: WidgetInstance[];
  center: WidgetInstance[];
  right: WidgetInstance[];
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
  { type: 'quote', name: 'Aforisma Random', defaultSettings: {} },
  { type: 'weather', name: 'Meteo Locale', defaultSettings: { city: 'Roma' } },
];

const getWidgetSpan = (type: WidgetType) => {
  switch (type) {
    case 'greeting': return 'md:col-span-4 lg:col-span-12';
    case 'search': return 'md:col-span-4 lg:col-span-12'; 
    case 'clock': return 'md:col-span-2 lg:col-span-4';
    case 'weather': return 'md:col-span-2 lg:col-span-4';
    case 'quote': return 'md:col-span-4 lg:col-span-4';
    case 'quicklinks': return 'md:col-span-4 lg:col-span-12';
    default: return 'md:col-span-4 lg:col-span-12';
  }
};

const WidgetManager = ({ isEditMode }: { isEditMode: boolean }) => {
  const [layout, setLayout] = useState<WidgetLayout>(() => {
    const saved = localStorage.getItem('startpage_widgets');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return { left: [], center: parsed, right: [] };
        }
        return {
          left: parsed.left || [],
          center: parsed.center || [],
          right: parsed.right || []
        };
      } catch {
        return { left: [], center: DEFAULT_WIDGETS, right: [] };
      }
    }
    return { left: [], center: DEFAULT_WIDGETS, right: [] };
  });

  const [isAddingWidget, setIsAddingWidget] = useState(false);
  const [editingWidget, setEditingWidget] = useState<WidgetInstance | null>(null);

  useEffect(() => {
    localStorage.setItem('startpage_widgets', JSON.stringify(layout));
  }, [layout]);

  const removeWidget = (id: string) => {
    if (window.confirm('Rimuovere questo widget?')) {
      setLayout(prev => ({
        left: prev.left.filter(w => w.id !== id),
        center: prev.center.filter(w => w.id !== id),
        right: prev.right.filter(w => w.id !== id),
      }));
    }
  };

  const addWidget = (type: WidgetType, defaultSettings: Record<string, unknown>) => {
    const newWidget: WidgetInstance = {
      id: `w_${crypto.randomUUID()}`,
      type,
      settings: defaultSettings,
    };
    setLayout(prev => ({ ...prev, center: [...prev.center, newWidget] }));
    setIsAddingWidget(false);
  };

  const saveWidgetSettings = (id: string, newSettings: Record<string, unknown>) => {
    const mapColumn = (col: WidgetInstance[]) => col.map(w => w.id === id ? { ...w, settings: newSettings } : w);
    setLayout(prev => ({
      left: mapColumn(prev.left),
      center: mapColumn(prev.center),
      right: mapColumn(prev.right),
    }));
    setEditingWidget(null);
  };

  const renderWidgetContent = (widget: WidgetInstance) => {
    switch (widget.type) {
      case 'clock': return <Clock />;
      case 'search': return <SearchBar />;
      case 'quicklinks': return <QuickLinks isEditMode={isEditMode} />;
      case 'greeting': return <Greeting settings={widget.settings as unknown as GreetingSettings} />;
      case 'quote': return <Quote />;
      case 'weather': return <Weather settings={widget.settings as unknown as WeatherSettings} />;
      default: return null;
    }
  };

  const renderWidgetWrapper = (widget: WidgetInstance, context: 'center' | 'sidebar') => {
    let containerClass = "w-full relative group flex flex-col justify-center h-full";
    if (context === 'center') {
      containerClass += ` ${getWidgetSpan(widget.type)}`;
    }

    return (
      <div key={widget.id} className={containerClass}>
        {isEditMode && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-800/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-50">
            <div 
              className="widget-drag-handle cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-white transition-colors"
              title="Trascina Widget"
            >
              <GripHorizontal className="w-4 h-4" />
            </div>
            
            {(widget.type === 'greeting' || widget.type === 'weather') && (
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
        
        <div className={`w-full h-full flex justify-center ${isEditMode ? 'ring-2 ring-transparent group-hover:ring-slate-700/50 rounded-3xl p-2 transition-all' : ''}`}>
          {renderWidgetContent(widget)}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full relative min-h-[50vh] flex flex-col lg:flex-row gap-8 items-start justify-center pb-24">
      
      {/* LEFT COLUMN */}
      {(isEditMode || layout.left.length > 0) && (
        <div className={`w-full lg:w-1/4 xl:w-1/5 flex-shrink-0 flex flex-col pt-2 transition-all duration-300 ${isEditMode && layout.left.length === 0 ? 'bg-slate-800/20 border-2 border-dashed border-slate-700/50 rounded-3xl p-4' : ''}`}>
          {isEditMode && layout.left.length === 0 && (
            <div className="text-slate-500 font-medium text-center mb-4 uppercase text-xs tracking-wider">Colonna Sinistra</div>
          )}
          <ReactSortable
            group="widgets"
            list={layout.left}
            setList={(l) => setLayout(p => ({ ...p, left: l }))}
            animation={200}
            disabled={!isEditMode}
            handle=".widget-drag-handle"
            className={`w-full flex flex-col gap-6 items-center ${isEditMode && layout.left.length === 0 ? 'min-h-[200px]' : ''}`}
          >
             {layout.left.map(w => renderWidgetWrapper(w, 'sidebar'))}
          </ReactSortable>
        </div>
      )}

      {/* CENTER COLUMN */}
      <div className={`w-full flex-grow transition-all duration-300 ${isEditMode && layout.center.length === 0 ? 'bg-slate-800/20 border-2 border-dashed border-slate-700/50 rounded-3xl p-4' : ''}`}>
          {isEditMode && layout.center.length === 0 && (
            <div className="text-slate-500 font-medium text-center mb-4 uppercase text-xs tracking-wider">Area Centrale</div>
          )}
          <ReactSortable
            group="widgets"
            list={layout.center}
            setList={(l) => setLayout(p => ({ ...p, center: l }))}
            animation={200}
            disabled={!isEditMode}
            handle=".widget-drag-handle"
            className={`w-full grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-6 items-stretch auto-rows-min mx-auto ${isEditMode && layout.center.length === 0 ? 'min-h-[200px]' : ''}`}
          >
            {layout.center.map(w => renderWidgetWrapper(w, 'center'))}
          </ReactSortable>
      </div>

      {/* RIGHT COLUMN */}
      {(isEditMode || layout.right.length > 0) && (
        <div className={`w-full lg:w-1/4 xl:w-1/5 flex-shrink-0 flex flex-col pt-2 transition-all duration-300 ${isEditMode && layout.right.length === 0 ? 'bg-slate-800/20 border-2 border-dashed border-slate-700/50 rounded-3xl p-4' : ''}`}>
          {isEditMode && layout.right.length === 0 && (
            <div className="text-slate-500 font-medium text-center mb-4 uppercase text-xs tracking-wider">Colonna Destra</div>
          )}
          <ReactSortable
            group="widgets"
            list={layout.right}
            setList={(l) => setLayout(p => ({ ...p, right: l }))}
            animation={200}
            disabled={!isEditMode}
            handle=".widget-drag-handle"
            className={`w-full flex flex-col gap-6 items-center ${isEditMode && layout.right.length === 0 ? 'min-h-[200px]' : ''}`}
          >
             {layout.right.map(w => renderWidgetWrapper(w, 'sidebar'))}
          </ReactSortable>
        </div>
      )}

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

      <AnimatePresence>
        {editingWidget && (editingWidget.type === 'greeting' || editingWidget.type === 'weather') && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm p-6 rounded-3xl bg-slate-800 border border-slate-700 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-white font-medium text-lg">
                  {editingWidget.type === 'greeting' ? 'Testo Saluto' : 'Città Meteo'}
                </h3>
                <button onClick={() => setEditingWidget(null)} className="p-1 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  if (editingWidget.type === 'greeting') {
                    saveWidgetSettings(editingWidget.id, { text: fd.get('text') as string });
                  } else if (editingWidget.type === 'weather') {
                    saveWidgetSettings(editingWidget.id, { city: fd.get('city') as string });
                  }
                }} 
                className="flex flex-col gap-4"
              >
                {editingWidget.type === 'greeting' && (
                  <input
                    name="text"
                    type="text"
                    defaultValue={editingWidget.settings.text as string}
                    placeholder="Es. Ciao Dario!"
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 focus:border-blue-500 rounded-xl text-white text-base focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                    autoFocus
                    required
                  />
                )}

                {editingWidget.type === 'weather' && (
                  <input
                    name="city"
                    type="text"
                    defaultValue={editingWidget.settings.city as string}
                    placeholder="Es. Roma, Milano..."
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 focus:border-blue-500 rounded-xl text-white text-base focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                    autoFocus
                    required
                  />
                )}
                
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
