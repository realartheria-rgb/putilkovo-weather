import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWeather } from '../hooks/useWeather';
import { useWeatherStore } from '../store/weatherStore';
import { CurrentWeatherCard, HourlyForecastCard, DailyForecastCard, AirQualityCard, SunMoonCard } from '../components/weather';
import { WeatherMap } from '../components/map';
import { Card, LoadingSpinner, ErrorMessage, StaleDataBadge } from '../components/ui';
import { formatLastUpdated } from '../utils/formatters';
import { searchCities } from '../services/weather';
import type { City } from '../types/weather';

export function WeatherPage() {
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
    refresh,
    changeCity,
  } = useWeather();

  const { setMapVisible, mapVisible, setTemperatureUnit, setWindSpeedUnit, setMapLayer, mapLayer } = useWeatherStore();

  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<City[]>([]);
  const [showSearch, setShowSearch] = React.useState(false);
  const [isSearching, setIsSearching] = React.useState(false);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchCities(searchQuery);
        setSearchResults(results.map((r) => ({
          name: r.name,
          lat: r.lat,
          lon: r.lon,
          country: r.country,
          state: r.state,
        })));
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleCitySelect = (selectedCity: City) => {
    changeCity(selectedCity);
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleGeolocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        changeCity({
          name: 'Текущее местоположение',
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          country: '',
        });
      },
      () => {}
    );
  };

  if (loading && !current) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error && !current) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <ErrorMessage message={error} onRetry={refresh} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-safe">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-gray-800">{city.name}</h1>
              {lastUpdated && (
                <p className="text-xs text-gray-400">
                  Обновлено {formatLastUpdated(lastUpdated)}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <button
                onClick={handleGeolocation}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <button
                onClick={refresh}
                disabled={loading}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                <svg className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>

          {/* Search */}
          {showSearch && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-3"
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск города..."
                className="w-full px-4 py-2 rounded-xl bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              {isSearching && <p className="text-xs text-gray-400 mt-2">Поиск...</p>}
              {searchResults.length > 0 && (
                <div className="mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                  {searchResults.map((result, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleCitySelect(result)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-50 last:border-0"
                    >
                      <p className="text-sm font-medium text-gray-700">{result.name}</p>
                      <p className="text-xs text-gray-400">
                        {result.state ? `${result.state}, ` : ''}{result.country}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </header>

      {/* Stale Data Badge */}
      {isStale && (
        <div className="max-w-lg mx-auto px-4 pt-3">
          <StaleDataBadge />
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {current && (
          <CurrentWeatherCard
            data={current}
            temperatureUnit={temperatureUnit}
            windSpeedUnit={windSpeedUnit}
          />
        )}

        {hourly && (
          <HourlyForecastCard data={hourly} temperatureUnit={temperatureUnit} />
        )}

        {daily && (
          <DailyForecastCard data={daily} temperatureUnit={temperatureUnit} />
        )}

        {airPollution && <AirQualityCard data={airPollution} />}

        {current && daily && (
          <SunMoonCard
            sunrise={current.sys.sunrise}
            sunset={current.sys.sunset}
            moonPhase={daily.list[0]?.moon_phase ?? 0}
            timezone={current.timezone}
          />
        )}

        {/* Map Toggle */}
        <Card>
          <button
            onClick={() => setMapVisible(!mapVisible)}
            className="w-full flex items-center justify-between"
          >
            <span className="text-sm font-medium text-gray-700">Карта погоды</span>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${mapVisible ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </Card>

        {current && (
          <WeatherMap
            mapLayer={mapLayer}
            setMapLayer={setMapLayer}
            mapVisible={mapVisible}
            setMapVisible={setMapVisible}
            lat={current.coord.lat}
            lon={current.coord.lon}
          />
        )}

        {/* Settings */}
        <Card>
          <h3 className="text-sm font-medium text-gray-500 mb-3">Настройки</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Температура</span>
              <div className="flex bg-gray-100 rounded-lg p-0.5">
                <button
                  onClick={() => setTemperatureUnit('celsius')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    temperatureUnit === 'celsius' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'
                  }`}
                >
                  °C
                </button>
                <button
                  onClick={() => setTemperatureUnit('fahrenheit')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    temperatureUnit === 'fahrenheit' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'
                  }`}
                >
                  °F
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Скорость ветра</span>
              <div className="flex bg-gray-100 rounded-lg p-0.5">
                <button
                  onClick={() => setWindSpeedUnit('ms')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    windSpeedUnit === 'ms' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'
                  }`}
                >
                  м/с
                </button>
                <button
                  onClick={() => setWindSpeedUnit('kmh')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    windSpeedUnit === 'kmh' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'
                  }`}
                >
                  км/ч
                </button>
              </div>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
