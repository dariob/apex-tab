import { motion } from 'framer-motion';
import { Mail, Settings } from 'lucide-react';
import { useState } from 'react';
import Clock from './components/Clock';
import SearchBar from './components/SearchBar';
import QuickLinks from './components/QuickLinks';

function App() {
  const [isEditMode, setIsEditMode] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 relative overflow-hidden font-sans">
      {/* Animated Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.6, scale: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-purple-600/30 blur-[120px]"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.4, scale: 1 }}
          transition={{ duration: 2.5, ease: "easeOut", delay: 0.2 }}
          className="absolute top-[20%] -right-[10%] w-[40vw] h-[40vw] rounded-full bg-blue-500/30 blur-[100px]"
        />
      </div>

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
          onClick={() => setIsEditMode(!isEditMode)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center justify-center p-2.5 bg-slate-800/40 hover:bg-slate-700/60 border backdrop-blur-md rounded-full transition-all shadow-sm group ${isEditMode ? 'border-emerald-500/50 text-emerald-400' : 'border-slate-700/50 text-slate-200 hover:text-white'}`}
          title={isEditMode ? "Fine Modifiche" : "Attiva Modifiche"}
        >
          <Settings className={`w-5 h-5 ${isEditMode ? 'text-emerald-400' : 'text-slate-400 group-hover:text-amber-400'} transition-colors`} />
        </motion.button>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-4xl px-6 flex flex-col items-center gap-12">
        <Clock />
        <SearchBar />
        <QuickLinks isEditMode={isEditMode} />
      </div>
    </div>
  );
}

export default App;
