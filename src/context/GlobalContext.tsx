import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface GlobalSettings {
  dynamicBackground: boolean;
  weatherEffects: boolean;
}

interface WeatherState {
  weatherCode: number | null;
  isDay: number;
}

interface GlobalContextType {
  settings: GlobalSettings;
  updateSettings: (newSettings: Partial<GlobalSettings>) => void;
  weatherState: WeatherState;
  setWeatherState: (state: WeatherState) => void;
}

const defaultSettings: GlobalSettings = {
  dynamicBackground: true,
  weatherEffects: true,
};

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export function GlobalProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<GlobalSettings>(() => {
    const saved = localStorage.getItem('apex_global_settings');
    if (saved) {
      try {
        return { ...defaultSettings, ...JSON.parse(saved) };
      } catch {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  const [weatherState, setWeatherState] = useState<WeatherState>({
    weatherCode: null,
    isDay: 1, // Default to day
  });

  useEffect(() => {
    localStorage.setItem('apex_global_settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: Partial<GlobalSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  return (
    <GlobalContext.Provider value={{ settings, updateSettings, weatherState, setWeatherState }}>
      {children}
    </GlobalContext.Provider>
  );
}

export function useGlobal() {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error('useGlobal must be used within a GlobalProvider');
  }
  return context;
}
