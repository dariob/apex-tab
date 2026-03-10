import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cloud, Sun, CloudRain, CloudSnow, CloudLightning, Wind } from 'lucide-react';

export interface WeatherSettings {
  city: string;
}

interface WeatherProps {
  settings: WeatherSettings;
}

interface WeatherData {
  temp: number;
  condition: number;
  timestamp: number;
  cityName: string;
}

// Convert Open-Meteo WMO code to an appropriate Lucide React icon
const getWeatherIcon = (code: number) => {
  if (code === 0 || code === 1) return <Sun className="w-12 h-12 text-amber-400 drop-shadow-sm" />;
  if (code === 2 || code === 3) return <Cloud className="w-12 h-12 text-slate-300 drop-shadow-sm" />;
  if (code >= 51 && code <= 67) return <CloudRain className="w-12 h-12 text-blue-400 drop-shadow-sm" />;
  if (code >= 71 && code <= 82) return <CloudSnow className="w-12 h-12 text-sky-200 drop-shadow-sm" />;
  if (code >= 95 && code <= 99) return <CloudLightning className="w-12 h-12 text-yellow-500 drop-shadow-sm" />;
  return <Wind className="w-12 h-12 text-slate-400 drop-shadow-sm" />;
};

const getWeatherDescription = (code: number) => {
  if (code === 0) return 'Sereno';
  if (code === 1 || code === 2 || code === 3) return 'Nuvoloso';
  if (code >= 51 && code <= 67) return 'Pioggia';
  if (code >= 71 && code <= 82) return 'Neve';
  if (code >= 95 && code <= 99) return 'Temporale';
  return 'Mix/Vento';
};

const Weather = ({ settings }: WeatherProps) => {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const activeCity = settings.city?.trim() || 'Roma';
    const CACHE_KEY = `startpage_weather_${activeCity.toLowerCase()}`;
    const CACHE_MINUTES = 20;

    const fetchWeather = async () => {
      setLoading(true);
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached) as WeatherData;
          const now = Date.now();
          if (now - parsed.timestamp < CACHE_MINUTES * 60 * 1000) {
            setData(parsed);
            setLoading(false);
            return;
          }
        } catch {
          // ignore cache issue
        }
      }

      try {
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(activeCity)}&count=1&language=it`);
        const geoData = await geoRes.json();
        
        if (!geoData.results || geoData.results.length === 0) {
          throw new Error("Città non trovata");
        }
        
        const lat = geoData.results[0].latitude;
        const lon = geoData.results[0].longitude;
        const finalCityName = geoData.results[0].name;

        const wetRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
        const wetData = await wetRes.json();
        const current = wetData.current_weather;
        
        const newData: WeatherData = {
          temp: current.temperature,
          condition: current.weathercode,
          timestamp: Date.now(),
          cityName: finalCityName
        };

        setData(newData);
        localStorage.setItem(CACHE_KEY, JSON.stringify(newData));

      } catch (error) {
        console.error("Weather fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [settings.city]);

  if (loading && !data) {
    return (
      <div className="flex animate-pulse items-center gap-6 px-10 py-6 bg-slate-800/30 border border-slate-700/50 rounded-3xl backdrop-blur-md shadow-lg w-[280px] h-[116px]" />
    );
  }

  if (!data) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center justify-center gap-6 px-10 py-6 bg-slate-800/30 border border-slate-700/50 rounded-3xl backdrop-blur-md shadow-lg group hover:bg-slate-800/40 transition-colors w-full h-full min-h-[140px]"
    >
      <div className="flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
        {getWeatherIcon(data.condition)}
      </div>
      <div className="flex flex-col">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl md:text-5xl font-bold tracking-tighter text-white">
            {Math.round(data.temp)}°
          </span>
          <span className="text-lg font-medium text-slate-300 capitalize">
            {getWeatherDescription(data.condition)}
          </span>
        </div>
        <span className="text-sm font-semibold text-slate-400 tracking-wide uppercase mt-1">
          {data.cityName}
        </span>
      </div>
    </motion.div>
  );
};

export default Weather;
