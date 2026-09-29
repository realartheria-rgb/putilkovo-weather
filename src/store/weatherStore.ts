import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  CurrentWeather,
  ForecastResponse,
  DailyForecastResponse,
  AirPollutionResponse,
  City,
  WeatherStore,
} from '../types/weather';
import { getDefaultCoordinates } from '../services/weather';

const DEFAULT_CITY: City = {
  name: 'Путилково',
  lat: getDefaultCoordinates().lat,
  lon: getDefaultCoordinates().lon,
  country: 'RU',
};

const CACHE_KEY = 'putilkovo-weather-cache';

interface CacheData {
  current: CurrentWeather | null;
  hourly: ForecastResponse | null;
  daily: DailyForecastResponse | null;
  airPollution: AirPollutionResponse | null;
  lastUpdated: number | null;
  city: City;
}

function loadCache(): CacheData | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveCache(data: CacheData): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // Storage full or unavailable
  }
}

export const useWeatherStore = create<WeatherStore>()(
  persist(
    (set) => ({
      // State
      current: null,
      hourly: null,
      daily: null,
      airPollution: null,
      loading: false,
      error: null,
      lastUpdated: null,
      isStale: false,
      city: DEFAULT_CITY,
      temperatureUnit: 'celsius',
      windSpeedUnit: 'ms',
      theme: 'auto',
      mapLayer: 'temperature',
      mapVisible: false,

      // Actions
      setCurrent: (data) => set({ current: data }),
      setHourly: (data) => set({ hourly: data }),
      setDaily: (data) => set({ daily: data }),
      setAirPollution: (data) => set({ airPollution: data }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setLastUpdated: (timestamp) => set({ lastUpdated: timestamp }),
      setStale: (stale) => set({ isStale: stale }),
      setCity: (city) => set({ city }),
      setTemperatureUnit: (unit) => set({ temperatureUnit: unit }),
      setWindSpeedUnit: (unit) => set({ windSpeedUnit: unit }),
      setTheme: (theme) => set({ theme }),
      setMapLayer: (layer) => set({ mapLayer: layer }),
      setMapVisible: (visible) => set({ mapVisible: visible }),

      loadFromCache: () => {
        const cache = loadCache();
        if (cache) {
          set({
            current: cache.current,
            hourly: cache.hourly,
            daily: cache.daily,
            airPollution: cache.airPollution,
            lastUpdated: cache.lastUpdated,
            city: cache.city,
            isStale: true,
          });
        }
      },

      clearCache: () => {
        localStorage.removeItem(CACHE_KEY);
        set({
          current: null,
          hourly: null,
          daily: null,
          airPollution: null,
          lastUpdated: null,
          isStale: false,
        });
      },
    }),
    {
      name: CACHE_KEY,
      partialize: (state) => ({
        current: state.current,
        hourly: state.hourly,
        daily: state.daily,
        airPollution: state.airPollution,
        lastUpdated: state.lastUpdated,
        city: state.city,
        temperatureUnit: state.temperatureUnit,
        windSpeedUnit: state.windSpeedUnit,
        theme: state.theme,
        mapLayer: state.mapLayer,
      }),
    }
  )
);

// Helper to save current state to cache
export function saveCurrentToCache(): void {
  const state = useWeatherStore.getState();
  saveCache({
    current: state.current,
    hourly: state.hourly,
    daily: state.daily,
    airPollution: state.airPollution,
    lastUpdated: state.lastUpdated,
    city: state.city,
  });
}
