import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui';
import type { WeatherStore } from '../../types/weather';

interface WeatherMapProps {
  mapLayer: WeatherStore['mapLayer'];
  setMapLayer: (layer: WeatherStore['mapLayer']) => void;
  mapVisible: boolean;
  setMapVisible: (visible: boolean) => void;
  lat: number;
  lon: number;
}

const LAYERS: Array<{ id: WeatherStore['mapLayer']; label: string }> = [
  { id: 'temperature', label: 'Температура' },
  { id: 'precipitation', label: 'Осадки' },
  { id: 'wind', label: 'Ветер' },
  { id: 'clouds', label: 'Облака' },
  { id: 'pressure', label: 'Давление' },
];

function latLonToTile(lat: number, lon: number, zoom: number): { x: number; y: number } {
  const x = Math.floor((lon + 180) / 360 * Math.pow(2, zoom));
  const y = Math.floor(
    (1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom)
  );
  return { x, y };
}

export function WeatherMap({ mapLayer, setMapLayer, mapVisible, setMapVisible, lat, lon }: WeatherMapProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (mapVisible) {
      setIsLoaded(false);
      setHasError(false);
    }
  }, [mapVisible, mapLayer, lat, lon]);

  if (!mapVisible) return null;

  const zoom = 8;
  const { x, y } = latLonToTile(lat, lon, zoom);
  const layerMap: Record<string, string> = {
    temperature: 'temp_new',
    precipitation: 'precipitation_new',
    wind: 'wind_new',
    clouds: 'clouds_new',
    pressure: 'pressure_new',
  };

  const mapUrl = `https://tile.openweathermap.org/map/${layerMap[mapLayer]}/${zoom}/${x}/${y}.png?appid=${import.meta.env.VITE_OPENWEATHER_API_KEY}`;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <Card className="p-0 overflow-hidden">
        <div className="flex items-center justify-between p-3 border-b border-gray-100">
          <h3 className="text-sm font-medium text-gray-500">Карта погоды</h3>
          <button
            onClick={() => setMapVisible(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        
        <div className="flex gap-1 p-2 overflow-x-auto">
          {LAYERS.map((layer) => (
            <button
              key={layer.id}
              onClick={() => setMapLayer(layer.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                mapLayer === layer.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {layer.label}
            </button>
          ))}
        </div>

        <div className="relative h-64 bg-gray-100">
          {!isLoaded && !hasError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
            </div>
          )}
          {hasError ? (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
              Карта недоступна
            </div>
          ) : (
            <img
              src={mapUrl}
              alt="Weather Map"
              className="w-full h-full object-cover"
              onLoad={() => setIsLoaded(true)}
              onError={() => setHasError(true)}
            />
          )}
        </div>
      </Card>
    </motion.div>
  );
}
