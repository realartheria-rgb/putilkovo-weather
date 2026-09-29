import type {
  CurrentWeather,
  ForecastResponse,
  DailyForecastResponse,
  DailyForecastItem,
  AirPollutionResponse,
  GeocodingResult,
  Coordinates,
} from '../types/weather';

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const GEO_URL = 'https://api.openweathermap.org/geo/1.0';
const AIR_URL = 'https://api.openweathermap.org/data/2.5/air_pollution';

// Default coordinates: Путилково, Московская область
const DEFAULT_COORDS: Coordinates = {
  lat: parseFloat(import.meta.env.VITE_DEFAULT_LAT || '56.0000'),
  lon: parseFloat(import.meta.env.VITE_DEFAULT_LON || '37.8333'),
};

class WeatherAPIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'WeatherAPIError';
  }
}

async function fetchWithErrorHandling<T>(url: string): Promise<T> {
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new WeatherAPIError(
        errorData.message || `HTTP ${response.status}`,
        response.status,
        errorData.cod
      );
    }
    
    return response.json();
  } catch (error) {
    if (error instanceof WeatherAPIError) throw error;
    
    // Network error or other
    throw new WeatherAPIError(
      error instanceof Error ? error.message : 'Network error',
      0,
      'NETWORK_ERROR'
    );
  }
}

export async function getCurrentWeather(
  coords: Coordinates = DEFAULT_COORDS,
  units: 'metric' | 'imperial' = 'metric'
): Promise<CurrentWeather> {
  const url = `${BASE_URL}/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${API_KEY}&units=${units}&lang=ru`;
  return fetchWithErrorHandling<CurrentWeather>(url);
}

export async function getHourlyForecast(
  coords: Coordinates = DEFAULT_COORDS,
  units: 'metric' | 'imperial' = 'metric'
): Promise<ForecastResponse> {
  const url = `${BASE_URL}/forecast?lat=${coords.lat}&lon=${coords.lon}&appid=${API_KEY}&units=${units}&lang=ru`;
  return fetchWithErrorHandling<ForecastResponse>(url);
}

export async function getDailyForecast(
  coords: Coordinates = DEFAULT_COORDS,
  units: 'metric' | 'imperial' = 'metric'
): Promise<DailyForecastResponse> {
  // Use /forecast (free tier) and aggregate to daily
  const url = `${BASE_URL}/forecast?lat=${coords.lat}&lon=${coords.lon}&appid=${API_KEY}&units=${units}&lang=ru`;
  const data = await fetchWithErrorHandling<ForecastResponse>(url);
  
  // Aggregate hourly data to daily
  const dailyMap = new Map<string, DailyForecastItem>();
  
  for (const item of data.list) {
    const date = new Date((item.dt + data.city.timezone) * 1000);
    const dateKey = date.toISOString().split('T')[0];
    
    const existing = dailyMap.get(dateKey);
    if (!existing) {
      dailyMap.set(dateKey, {
        dt: item.dt,
        sunrise: data.city.sunrise,
        sunset: data.city.sunset,
        moonrise: 0,
        moonset: 0,
        moon_phase: 0,
        summary: item.weather[0]?.description || '',
        temp: {
          day: item.main.temp,
          min: item.main.temp,
          max: item.main.temp,
          night: item.main.temp,
          eve: item.main.temp,
          morn: item.main.temp,
        },
        feels_like: {
          day: item.main.feels_like,
          night: item.main.feels_like,
          eve: item.main.feels_like,
          morn: item.main.feels_like,
        },
        pressure: item.main.pressure,
        humidity: item.main.humidity,
        dew_point: 0,
        wind_speed: item.wind.speed,
        wind_deg: item.wind.deg,
        wind_gust: item.wind.gust,
        weather: item.weather,
        clouds: item.clouds.all,
        pop: item.pop || 0,
        rain: item.rain?.['3h'],
        snow: item.snow?.['3h'],
        uvi: 0,
      });
    } else {
      existing.temp.min = Math.min(existing.temp.min, item.main.temp);
      existing.temp.max = Math.max(existing.temp.max, item.main.temp);
      existing.temp.day = item.main.temp;
      existing.feels_like.day = item.main.feels_like;
    }
  }
  
  const list = Array.from(dailyMap.values()).slice(0, 7);
  
  return {
    cod: data.cod,
    message: data.message,
    cnt: list.length,
    list,
    city: data.city,
  };
}

export async function getAirPollution(
  coords: Coordinates = DEFAULT_COORDS
): Promise<AirPollutionResponse> {
  const url = `${AIR_URL}?lat=${coords.lat}&lon=${coords.lon}&appid=${API_KEY}`;
  return fetchWithErrorHandling<AirPollutionResponse>(url);
}

export async function searchCities(
  query: string,
  limit: number = 5
): Promise<GeocodingResult[]> {
  const url = `${GEO_URL}/direct?q=${encodeURIComponent(query)}&limit=${limit}&appid=${API_KEY}`;
  return fetchWithErrorHandling<GeocodingResult[]>(url);
}

export async function reverseGeocode(
  coords: Coordinates
): Promise<GeocodingResult[]> {
  const url = `${GEO_URL}/reverse?lat=${coords.lat}&lon=${coords.lon}&limit=1&appid=${API_KEY}`;
  return fetchWithErrorHandling<GeocodingResult[]>(url);
}

export function getDefaultCoordinates(): Coordinates {
  return { ...DEFAULT_COORDS };
}

export { WeatherAPIError };
