import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const Clock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const dateStr = time.toLocaleDateString('it-IT', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-6 bg-slate-800/30 border border-slate-700/50 rounded-3xl backdrop-blur-md shadow-lg group hover:bg-slate-800/40 transition-colors w-full h-full min-h-[140px]"
    >
      <h1 className="text-6xl md:text-7xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-white/70 drop-shadow-sm">
        {hours}:{minutes}
      </h1>
      <p className="mt-2 text-lg text-slate-300 capitalize font-medium tracking-wide">
        {dateStr}
      </p>
    </motion.div>
  );
};

export default Clock;
