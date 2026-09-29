import { motion } from 'framer-motion';
import { Card } from '../ui';
import {
  formatTemperature,
  formatWindSpeed,
  formatTime,
  formatDate,
  getDayLength,
  getMoonPhaseName,
  getAQILevel,
  getWeatherIconUrl,
} from '../../utils/formatters';
import type { CurrentWeather, ForecastResponse, DailyForecastResponse, AirPollutionResponse, TemperatureUnit, WindSpeedUnit } from '../../types/weather';

interface CurrentWeatherProps {
  data: CurrentWeather;
  temperatureUnit: TemperatureUnit;
  windSpeedUnit: WindSpeedUnit;
}

export function CurrentWeatherCard({ data, temperatureUnit, windSpeedUnit }: CurrentWeatherProps) {
  const weather = data.weather[0];
  
  return (
    <Card className="text-center">
      <div className="flex items-center justify-center gap-2 mb-2">
        <img
          src={getWeatherIconUrl(weather.icon, '4x')}
          alt={weather.description}
          className="w-20 h-20"
        />
      </div>
      <h2 className="text-5xl font-light text-gray-800 mb-1">
        {formatTemperature(data.main.temp, temperatureUnit)}
      </h2>
      <p className="text-gray-500 capitalize mb-4">{weather.description}</p>
      
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-gray-400 text-xs">Ощущается</p>
          <p className="text-gray-700 font-medium">{formatTemperature(data.main.feels_like, temperatureUnit)}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-gray-400 text-xs">Ветер</p>
          <p className="text-gray-700 font-medium">{formatWindSpeed(data.wind.speed, windSpeedUnit)}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-gray-400 text-xs">Влажность</p>
          <p className="text-gray-700 font-medium">{data.main.humidity}%</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-gray-400 text-xs">Давление</p>
          <p className="text-gray-700 font-medium">{Math.round(data.main.pressure * 0.750062)} мм рт.ст.</p>
        </div>
      </div>
    </Card>
  );
}

interface HourlyForecastProps {
  data: ForecastResponse;
  temperatureUnit: TemperatureUnit;
}

export function HourlyForecastCard({ data, temperatureUnit }: HourlyForecastProps) {
  const hours = data.list.slice(0, 8);
  
  return (
    <Card>
      <h3 className="text-sm font-medium text-gray-500 mb-3">Почасовой прогноз</h3>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
        {hours.map((item, idx) => (
          <motion.div
            key={item.dt}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="flex flex-col items-center min-w-[60px]"
          >
            <span className="text-xs text-gray-400 mb-1">
              {idx === 0 ? 'Сейчас' : formatTime(item.dt, data.city.timezone)}
            </span>
            <img
              src={getWeatherIconUrl(item.weather[0].icon)}
              alt={item.weather[0].description}
              className="w-8 h-8"
            />
            <span className="text-sm font-medium text-gray-700 mt-1">
              {formatTemperature(item.main.temp, temperatureUnit)}
            </span>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}

interface DailyForecastProps {
  data: DailyForecastResponse;
  temperatureUnit: TemperatureUnit;
}

export function DailyForecastCard({ data, temperatureUnit }: DailyForecastProps) {
  return (
    <Card>
      <h3 className="text-sm font-medium text-gray-500 mb-3">Прогноз на 7 дней</h3>
      <div className="space-y-2">
        {data.list.map((item, idx) => (
          <motion.div
            key={item.dt}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 w-16">
                {idx === 0 ? 'Сегодня' : formatDate(item.dt, data.city.timezone)}
              </span>
              <img
                src={getWeatherIconUrl(item.weather[0].icon)}
                alt={item.weather[0].description}
                className="w-8 h-8"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">
                {formatTemperature(item.temp.min, temperatureUnit)}
              </span>
              <div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-400 to-orange-400 rounded-full"
                  style={{
                    width: `${((item.temp.max - item.temp.min) / 30) * 100}%`,
                    marginLeft: `${((item.temp.min + 10) / 40) * 100}%`,
                  }}
                />
              </div>
              <span className="text-sm font-medium text-gray-700">
                {formatTemperature(item.temp.max, temperatureUnit)}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}

interface AirQualityProps {
  data: AirPollutionResponse;
}

export function AirQualityCard({ data }: AirQualityProps) {
  const aqi = data.list[0]?.main.aqi ?? 0;
  const { label, color } = getAQILevel(aqi);
  const components = data.list[0]?.components;
  
  return (
    <Card>
      <h3 className="text-sm font-medium text-gray-500 mb-3">Качество воздуха</h3>
      <div className="flex items-center gap-4">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl"
          style={{ backgroundColor: color }}
        >
          {aqi}
        </div>
        <div>
          <p className="text-gray-700 font-medium">{label}</p>
          {components && (
            <p className="text-xs text-gray-400 mt-1">
              PM2.5: {Math.round(components.pm2_5)} мкг/м³
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

interface SunMoonProps {
  sunrise: number;
  sunset: number;
  moonPhase: number;
  timezone: number;
}

export function SunMoonCard({ sunrise, sunset, moonPhase, timezone }: SunMoonProps) {
  return (
    <Card>
      <h3 className="text-sm font-medium text-gray-500 mb-3">Солнце и Луна</h3>
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <p className="text-xs text-gray-400 mb-1">Восход</p>
          <p className="text-sm font-medium text-gray-700">{formatTime(sunrise, timezone)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-400 mb-1">Закат</p>
          <p className="text-sm font-medium text-gray-700">{formatTime(sunset, timezone)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-400 mb-1">День</p>
          <p className="text-sm font-medium text-gray-700">{getDayLength(sunrise, sunset)}</p>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-100 text-center">
        <p className="text-xs text-gray-400 mb-1">Фаза Луны</p>
        <p className="text-sm font-medium text-gray-700">{getMoonPhaseName(moonPhase)}</p>
      </div>
    </Card>
  );
}
