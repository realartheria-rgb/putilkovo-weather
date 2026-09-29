import React from 'react';
import { useEffect, useCallback, useRef } from 'react';
import { useWeatherStore, saveCurrentToCache } from '../store/weatherStore';
import {
  getCurrentWeather,
  getHourlyForecast,
  getDailyForecast,
  getAirPollution,
  WeatherAPIError,
} from '../services/weather';
import type { City } from '../types/weather';

const REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes

export function useWeather() {
  const {
    current,
    hourly,
    daily,
    airPollution,
    loading,
    error,
    lastUpdated,
    isStale,
    city,
    temperatureUnit,
    windSpeedUnit,
    setCurrent,
    setHourly,
    setDaily,
    setAirPollution,
    setLoading,
    setError,
    setLastUpdated,
    setStale,
    setCity,
    loadFromCache,
  } = useWeatherStore();

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMountedRef = useRef(true);

  // Load cache on mount
  useEffect(() => {
    loadFromCache();
    return () => {
      isMountedRef.current = false;
    };
  }, [loadFromCache]);

  const fetchWeather = useCallback(async (targetCity?: City) => {
    const target = targetCity || city;
    setLoading(true);
    setError(null);

    try {
      const units = temperatureUnit === 'celsius' ? 'metric' : 'imperial';
      
      // Fetch all data in parallel
      const [currentData, hourlyData, dailyData, airData] = await Promise.allSettled([
        getCurrentWeather(target, units),
        getHourlyForecast(target, units),
        getDailyForecast(target, units),
        getAirPollution(target),
      ]);

      if (!isMountedRef.current) return;

      if (currentData.status === 'fulfilled') {
        setCurrent(currentData.value);
      }
      if (hourlyData.status === 'fulfilled') {
        setHourly(hourlyData.value);
      }
      if (dailyData.status === 'fulfilled') {
        setDaily(dailyData.value);
      }
      if (airData.status === 'fulfilled') {
        setAirPollution(airData.value);
      }

      // Check if all failed
      const allFailed = [currentData, hourlyData, dailyData, airData].every(
        (r) => r.status === 'rejected'
      );

      if (allFailed) {
        const firstError = [currentData, hourlyData, dailyData, airData].find(
          (r) => r.status === 'rejected'
        );
        if (firstError && firstError.status === 'rejected') {
          const err = firstError.reason;
          if (err instanceof WeatherAPIError) {
            setError(err.message);
          } else {
            setError('Ошибка загрузки данных');
          }
        }
        setStale(true);
      } else {
        setStale(false);
      }

      setLastUpdated(Date.now());
      saveCurrentToCache();
    } catch (err) {
      if (!isMountedRef.current) return;
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      setStale(true);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [city, temperatureUnit, setCurrent, setHourly, setDaily, setAirPollution, setLoading, setError, setLastUpdated, setStale]);

  // Auto-refresh every 10 minutes
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => {
      fetchWeather();
    }, REFRESH_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchWeather]);

  const refresh = useCallback(() => {
    return fetchWeather();
  }, [fetchWeather]);

  const changeCity = useCallback((newCity: City) => {
    setCity(newCity);
    return fetchWeather(newCity);
  }, [setCity, fetchWeather]);

  return {
    current,
    hourly,
    daily,
    airPollution,
    loading,
    error,
    lastUpdated,
    isStale,
    city,
    temperatureUnit,
    windSpeedUnit,
    refresh,
    changeCity,
  };
}

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function usePullToRefresh(onRefresh: () => Promise<void>) {
  const [pullDistance, setPullDistance] = React.useState(0);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const startY = React.useRef(0);
  const isPulling = React.useRef(false);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
      isPulling.current = true;
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isPulling.current) return;
    const diff = e.touches[0].clientY - startY.current;
    if (diff > 0 && window.scrollY === 0) {
      setPullDistance(Math.min(diff * 0.5, 100));
    }
  }, []);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling.current) return;
    isPulling.current = false;
    
    if (pullDistance > 60) {
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
    }
    setPullDistance(0);
  }, [pullDistance, onRefresh]);

  useEffect(() => {
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return { pullDistance, isRefreshing };
}
