import { motion } from 'framer-motion';
import { Mail, LayoutDashboard, Settings, X } from 'lucide-react';
import { useState } from 'react';
import WidgetManager from './components/WidgetManager';
import { useGlobal } from './context/GlobalContext';
import BackgroundManager from './components/BackgroundManager';

function App() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { settings, updateSettings } = useGlobal();

  return (
    <div className="min-h-screen flex flex-col items-center pt-[5vh] pb-12 relative overflow-x-hidden font-sans text-slate-200">
      <BackgroundManager />

      {/* Top Right Actions */}
      <div className="absolute top-6 right-8 z-20 flex items-center gap-4">
        <motion.a
          href="https://mail.google.com"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800/40 hover:bg-slate-700/60 border border-slate-700/50 backdrop-blur-md rounded-full text-slate-200 hover:text-white transition-all shadow-sm group"
        >
          <Mail className="w-4 h-4 text-slate-400 group-hover:text-red-400 transition-colors" />
          <span className="text-sm font-medium">Gmail</span>
        </motion.a>
        <motion.button
          onClick={() => setIsSettingsOpen(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center justify-center p-2.5 bg-slate-800/40 hover:bg-slate-700/60 border border-slate-700/50 backdrop-blur-md rounded-full text-slate-200 hover:text-white transition-all shadow-sm group"
          title="Impostazioni Globali"
        >
          <Settings className="w-5 h-5 text-slate-400 group-hover:text-amber-400 transition-colors" />
        </motion.button>
        <motion.button
          onClick={() => setIsEditMode(!isEditMode)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center justify-center p-2.5 bg-slate-800/40 hover:bg-slate-700/60 border backdrop-blur-md rounded-full transition-all shadow-sm group ${isEditMode ? 'border-emerald-500/50 text-emerald-400' : 'border-slate-700/50 text-slate-200 hover:text-white'}`}
          title={isEditMode ? "Fine Modifiche" : "Layout Widget"}
        >
          <LayoutDashboard className={`w-5 h-5 ${isEditMode ? 'text-emerald-400' : 'text-slate-400 group-hover:text-amber-400'} transition-colors`} />
        </motion.button>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-[1500px] px-8 flex flex-col items-center gap-6 pt-8">
        <WidgetManager isEditMode={isEditMode} />
      </div>

      {/* Global Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm p-6 rounded-3xl bg-slate-800/90 border border-slate-700 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-medium text-lg">Impostazioni</h3>
              <button onClick={() => setIsSettingsOpen(false)} className="p-1 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex flex-col gap-4">
              <label className="flex items-center justify-between cursor-pointer group p-3 rounded-xl hover:bg-slate-700/30 transition-colors">
                <span className="text-slate-200 font-medium">Sfondo Dinamico</span>
                <input 
                  type="checkbox" 
                  checked={settings.dynamicBackground}
                  onChange={(e) => updateSettings({ dynamicBackground: e.target.checked })}
                  className="w-5 h-5 rounded text-blue-500 bg-slate-900 border-slate-700 focus:ring-blue-500 focus:ring-offset-slate-800 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer group p-3 rounded-xl hover:bg-slate-700/30 transition-colors">
                <span className="text-slate-200 font-medium">Effetti Meteo</span>
                <input 
                  type="checkbox" 
                  checked={settings.weatherEffects}
                  onChange={(e) => updateSettings({ weatherEffects: e.target.checked })}
                  className="w-5 h-5 rounded text-blue-500 bg-slate-900 border-slate-700 focus:ring-blue-500 focus:ring-offset-slate-800 cursor-pointer"
                />
              </label>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default App;
