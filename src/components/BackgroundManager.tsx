import { motion, AnimatePresence } from 'framer-motion';
import { useGlobal } from '../context/GlobalContext';
import { useEffect, useState } from 'react';

type TimeOfDay = 'morning' | 'afternoon' | 'night';

const BackgroundManager = () => {
  const { settings, weatherState } = useGlobal();
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning');

  useEffect(() => {
    const updateTime = () => {
      const hour = new Date().getHours();
      if (hour >= 6 && hour < 12) {
        setTimeOfDay('morning');
      } else if (hour >= 12 && hour < 18) {
        setTimeOfDay('afternoon');
      } else {
        setTimeOfDay('night');
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 60000); // check every minute
    return () => clearInterval(interval);
  }, []);

  const { dynamicBackground, weatherEffects } = settings;
  const { weatherCode, isDay } = weatherState;

  // Determine which weather effect to show
  const showSun = weatherEffects && weatherCode !== null && (weatherCode === 0 || weatherCode === 1) && isDay === 1;
  const showRain = weatherEffects && weatherCode !== null && (
    (weatherCode >= 51 && weatherCode <= 67) || // drizzle/rain
    (weatherCode >= 80 && weatherCode <= 82) || // rain showers
    (weatherCode >= 95 && weatherCode <= 99)    // thunderstorm
  );
  const showSnow = weatherEffects && weatherCode !== null && (
    (weatherCode >= 71 && weatherCode <= 77) || // snow
    (weatherCode >= 85 && weatherCode <= 86)    // snow showers
  );
  const showClouds = weatherEffects && weatherCode !== null && (weatherCode === 2 || weatherCode === 3 || weatherCode === 45 || weatherCode === 48);

  // Gradient configurations for the dynamic background
  const getGradients = () => {
    if (!dynamicBackground) {
      // Default static dark theme
      return (
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none bg-slate-900 transition-colors duration-1000">
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
      );
    }

    // Dynamic combinations
    if (timeOfDay === 'morning') {
      return (
        <motion.div 
          key="morning"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 2 }}
          className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none bg-sky-900"
        >
          <motion.div 
            animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.6, 0.5] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-[10%] -left-[10%] w-[60vw] h-[60vw] rounded-full bg-amber-500/30 blur-[120px]"
          />
          <motion.div 
            animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.5, 0.4] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute top-[30%] -right-[10%] w-[50vw] h-[50vw] rounded-full bg-orange-400/20 blur-[100px]"
          />
        </motion.div>
      );
    } else if (timeOfDay === 'afternoon') {
      return (
        <motion.div 
          key="afternoon"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 2 }}
          className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none bg-indigo-950"
        >
          <motion.div 
            animate={{ scale: [1, 1.05, 1], opacity: [0.4, 0.5, 0.4] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-orange-600/30 blur-[120px]"
          />
          <motion.div 
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.4, 0.3] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute top-[20%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-pink-600/30 blur-[100px]"
          />
          <motion.div 
            animate={{ scale: [1, 1.05, 1], opacity: [0.2, 0.3, 0.2] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-[-10%] left-[20%] w-[40vw] h-[40vw] rounded-full bg-purple-700/20 blur-[100px]"
          />
        </motion.div>
      );
    } else { // night
      return (
        <motion.div 
          key="night"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 2 }}
          className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none bg-slate-950"
        >
          <motion.div 
            animate={{ scale: [1, 1.02, 1], opacity: [0.3, 0.4, 0.3] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-[20%] -left-[10%] w-[60vw] h-[60vw] rounded-full bg-indigo-900/40 blur-[120px]"
          />
          <motion.div 
            animate={{ scale: [1, 1.05, 1], opacity: [0.2, 0.3, 0.2] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute top-[20%] -right-[10%] w-[50vw] h-[50vw] rounded-full bg-blue-900/30 blur-[100px]"
          />
        </motion.div>
      );
    }
  };

  return (
    <>
      {/* Base Background layer */}
      <div className={`fixed inset-0 -z-20 transition-colors duration-1000 ${!dynamicBackground ? 'bg-slate-900' : ''}`} />
      
      {/* Gradients */}
      <AnimatePresence mode="wait">
        {getGradients()}
      </AnimatePresence>

      {/* Weather overlays */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <AnimatePresence>
          {showClouds && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 3 }}
              className="absolute inset-0"
            >
              <motion.div 
                animate={{ x: [0, 100, 0] }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                className="absolute top-[5%] left-[-10%] w-[40vw] h-[20vw] bg-slate-400/10 rounded-full blur-[60px]"
              />
              <motion.div 
                animate={{ x: [0, -100, 0] }} transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                className="absolute top-[15%] right-[-10%] w-[50vw] h-[30vw] bg-slate-300/10 rounded-full blur-[80px]"
              />
            </motion.div>
          )}

          {showRain && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }}
              className="absolute inset-0"
            >
              {/* Raindrops simulated with fast moving CSS gradients */}
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={`rain-${i}`}
                  className="absolute w-[2px] h-[100px] bg-gradient-to-b from-transparent to-blue-300/40"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `-${Math.random() * 20}%`
                  }}
                  animate={{
                    y: ['0vh', '120vh'],
                    opacity: [0, 1, 0]
                  }}
                  transition={{
                    duration: 0.8 + Math.random() * 0.5,
                    repeat: Infinity,
                    ease: "linear",
                    delay: Math.random() * 2
                  }}
                />
              ))}
            </motion.div>
          )}

          {showSnow && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 2 }}
              className="absolute inset-0"
            >
              {/* Snowflakes simulated with slow moving circles */}
              {Array.from({ length: 40 }).map((_, i) => (
                <motion.div
                  key={`snow-${i}`}
                  className="absolute bg-white rounded-full blur-[0.5px] shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `-10%`,
                    width: `${Math.random() * 6 + 4}px`,
                    height: `${Math.random() * 6 + 4}px`,
                    opacity: Math.random() * 0.5 + 0.5
                  }}
                  animate={{
                    y: ['0vh', '110vh'],
                    x: [`${Math.random() * 15 - 7.5}vw`, `${Math.random() * 20 - 10}vw`],
                  }}
                  transition={{
                    duration: 5 + Math.random() * 7,
                    repeat: Infinity,
                    ease: "linear",
                    delay: Math.random() * 5
                  }}
                />
              ))}
            </motion.div>
          )}

          {showSun && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 3 }}
              className="absolute inset-0"
            >
              {/* Soft Sun Core */}
              <motion.div 
                animate={{ scale: [1, 1.05, 1], opacity: [0.4, 0.5, 0.4] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[-10%] left-[-5%] w-[15vw] h-[15vw] min-w-[150px] min-h-[150px] bg-white rounded-full blur-[40px]"
              />
              {/* Wide Yellowish Warm Halo */}
              <motion.div 
                animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[-15%] left-[-10%] w-[40vw] h-[40vw] min-w-[300px] min-h-[300px] bg-yellow-300/30 rounded-full blur-[80px]"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default BackgroundManager;
