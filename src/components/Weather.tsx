import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cloud, Sun, Moon, CloudRain, CloudSnow, CloudLightning, Wind } from 'lucide-react';
import { useGlobal } from '../context/GlobalContext';

export interface WeatherSettings {
  city: string;
  showHourly?: boolean;
  showDaily?: boolean;
}

interface WeatherProps {
  settings: WeatherSettings;
}

interface HourlyForecast {
  time: string;
  temp: number;
  condition: number;
  is_day: number;
}

interface DailyForecast {
  date: string;
  tempMax: number;
  tempMin: number;
  condition: number;
}

interface WeatherData {
  temp: number;
  condition: number;
  timestamp: number;
  is_day: number;
  cityName: string;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
}

const getWeatherIcon = (code: number, isDay: number = 1, className = "w-12 h-12") => {
  if (code === 0 || code === 1) {
    return isDay ? <Sun className={`${className} text-amber-400 drop-shadow-sm`} /> 
                 : <Moon className={`${className} text-slate-300 drop-shadow-sm`} />;
  }
  if (code === 2 || code === 3 || code === 45 || code === 48) return <Cloud className={`${className} text-slate-300 drop-shadow-sm`} />;
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return <CloudRain className={`${className} text-blue-400 drop-shadow-sm`} />;
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return <CloudSnow className={`${className} text-sky-200 drop-shadow-sm`} />;
  if (code >= 95 && code <= 99) return <CloudLightning className={`${className} text-yellow-500 drop-shadow-sm`} />;
  return <Wind className={`${className} text-slate-400 drop-shadow-sm`} />;
};

const getWeatherDescription = (code: number) => {
  if (code === 0 || code === 1) return 'Sereno';
  if (code === 2 || code === 3) return 'Nuvoloso';
  if (code === 45 || code === 48) return 'Nebbia';
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'Pioggia';
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return 'Neve';
  if (code >= 95 && code <= 99) return 'Temporale';
  return 'Misto/Vento';
};

const Weather = ({ settings }: WeatherProps) => {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const { setWeatherState } = useGlobal();

  // default to true if undefined
  const showHourly = settings.showHourly !== false;
  const showDaily = settings.showDaily !== false;

  useEffect(() => {
    const activeCity = settings.city?.trim() || 'Roma';
    const CACHE_KEY = `startpage_weather_v3_${activeCity.toLowerCase()}`;
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
            setWeatherState({ weatherCode: parsed.condition, isDay: parsed.is_day });
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

        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,weathercode,is_day&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`;
        const wetRes = await fetch(url);
        const wetData = await wetRes.json();
        
        const current = wetData.current_weather;
        
        // Parse Next 5 hours
        const currentHourStr = new Date().toISOString().slice(0, 13) + ":00";
        const hourlyIndex = wetData.hourly.time.findIndex((t: string) => t >= currentHourStr);
        const startIndex = hourlyIndex !== -1 ? hourlyIndex : 0;
        
        const hourly: HourlyForecast[] = [];
        for(let i = startIndex + 1; i <= startIndex + 5; i++) {
          if (wetData.hourly.time[i]) {
            const dateObj = new Date(wetData.hourly.time[i]);
            hourly.push({
              time: `${dateObj.getHours().toString().padStart(2, '0')}:00`,
              temp: wetData.hourly.temperature_2m[i],
              condition: wetData.hourly.weathercode[i],
              is_day: wetData.hourly.is_day[i]
            });
          }
        }

        // Parse Next 5 days
        const daily: DailyForecast[] = [];
        for(let i = 1; i <= 5; i++) {
          if (wetData.daily.time[i]) {
            const dateObj = new Date(wetData.daily.time[i]);
            const days = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
            daily.push({
              date: days[dateObj.getDay()],
              tempMax: wetData.daily.temperature_2m_max[i],
              tempMin: wetData.daily.temperature_2m_min[i],
              condition: wetData.daily.weathercode[i]
            });
          }
        }
        
        const newData: WeatherData = {
          temp: current.temperature,
          condition: current.weathercode,
          timestamp: Date.now(),
          is_day: current.is_day,
          cityName: finalCityName,
          hourly,
          daily
        };

        setData(newData);
        setWeatherState({ weatherCode: current.weathercode, isDay: current.is_day });
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
      <div className="flex animate-pulse items-center gap-6 px-10 py-6 bg-slate-800/30 border border-slate-700/50 rounded-3xl backdrop-blur-md shadow-lg w-full h-full min-h-[140px]" />
    );
  }

  if (!data) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col gap-6 px-8 py-6 bg-slate-800/30 border border-slate-700/50 rounded-3xl backdrop-blur-md shadow-lg group hover:bg-slate-800/40 transition-colors w-full h-full min-h-[140px]"
    >
      {/* Current Weather */}
      <div className="flex items-center justify-between gap-6 w-full">
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
        <div className="flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
          {getWeatherIcon(data.condition, data.is_day, "w-14 h-14")}
        </div>
      </div>

      {/* Hourly Forecast */}
      {showHourly && data.hourly && data.hourly.length > 0 && (
        <div className="flex items-center justify-between w-full pt-4 border-t border-slate-700/50">
          {data.hourly.map((hour, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">{hour.time}</span>
              {getWeatherIcon(hour.condition, hour.is_day, "w-6 h-6")}
              <span className="text-sm font-bold text-slate-200">{Math.round(hour.temp)}°</span>
            </div>
          ))}
        </div>
      )}

      {/* Daily Forecast */}
      {showDaily && data.daily && data.daily.length > 0 && (
        <div className="flex flex-col gap-3 w-full pt-4 border-t border-slate-700/50">
          {data.daily.map((day, i) => (
            <div key={i} className="flex items-center justify-between w-full">
              <span className="text-sm text-slate-400 font-medium w-10">{day.date}</span>
              <div className="flex justify-center w-8">
                {getWeatherIcon(day.condition, 1, "w-5 h-5")}
              </div>
              <div className="flex items-center gap-1 w-[72px] justify-end">
                <span className="text-sm font-bold text-slate-200 w-8 text-right">{Math.round(day.tempMax)}°</span>
                <span className="text-xs font-medium text-slate-500 w-8 text-right">{Math.round(day.tempMin)}°</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default Weather;
