import type { TemperatureUnit, WindSpeedUnit } from '../types/weather';

export function formatTemperature(celsius: number, unit: TemperatureUnit): string {
  if (unit === 'fahrenheit') {
    return `${Math.round((celsius * 9) / 5 + 32)}°F`;
  }
  return `${Math.round(celsius)}°C`;
}

export function formatWindSpeed(ms: number, unit: WindSpeedUnit): string {
  if (unit === 'kmh') {
    return `${Math.round(ms * 3.6)} км/ч`;
  }
  return `${Math.round(ms * 10) / 10} м/с`;
}

export function formatTime(timestamp: number, timezone: number = 0): string {
  const date = new Date((timestamp + timezone) * 1000);
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
}

export function formatDate(timestamp: number, timezone: number = 0): string {
  const date = new Date((timestamp + timezone) * 1000);
  return date.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });
}

export function formatLastUpdated(timestamp: number | null): string {
  if (!timestamp) return '';
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'только что';
  if (minutes < 60) return `${minutes} мин назад`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ч назад`;
  return `${Math.floor(hours / 24)} дн назад`;
}

export function getDayLength(sunrise: number, sunset: number): string {
  const diff = sunset - sunrise;
  const hours = Math.floor(diff / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  return `${hours}ч ${minutes}м`;
}

export function getMoonPhaseName(phase: number): string {
  // Moon phase: 0 = new moon, 0.5 = full moon
  if (phase < 0.03 || phase > 0.97) return 'Новолуние';
  if (phase < 0.22) return 'Растущий серп';
  if (phase < 0.28) return 'Первая четверть';
  if (phase < 0.47) return 'Растущая луна';
  if (phase < 0.53) return 'Полнолуние';
  if (phase < 0.72) return 'Убывающая луна';
  if (phase < 0.78) return 'Последняя четверть';
  return 'Убывающий серп';
}

export function getAQILevel(aqi: number): { label: string; color: string } {
  switch (aqi) {
    case 1: return { label: 'Хорошее', color: '#10b981' };
    case 2: return { label: 'Удовлетворительное', color: '#84cc16' };
    case 3: return { label: 'Умеренное', color: '#f59e0b' };
    case 4: return { label: 'Плохое', color: '#ef4444' };
    case 5: return { label: 'Очень плохое', color: '#7c2d12' };
    default: return { label: 'Нет данных', color: '#9ca3af' };
  }
}

export function getWeatherIconUrl(iconCode: string, size: '1x' | '2x' | '4x' = '2x'): string {
  const sizeMap = { '1x': '', '2x': '@2x', '4x': '@4x' };
  return `https://openweathermap.org/img/wn/${iconCode}${sizeMap[size]}.png`;
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}
