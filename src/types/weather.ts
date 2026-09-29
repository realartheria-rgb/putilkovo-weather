// OpenWeatherMap API Types

export interface Coordinates {
  lat: number;
  lon: number;
}

export interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface CurrentWeather {
  coord: Coordinates;
  weather: WeatherCondition[];
  base: string;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
    sea_level?: number;
    grnd_level?: number;
  };
  visibility: number;
  wind: {
    speed: number;
    deg: number;
    gust?: number;
  };
  clouds: {
    all: number;
  };
  rain?: { '1h'?: number; '3h'?: number };
  snow?: { '1h'?: number; '3h'?: number };
  dt: number;
  sys: {
    type?: number;
    id?: number;
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

export interface HourlyForecastItem {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
    sea_level?: number;
    grnd_level?: number;
    temp_kf?: number;
  };
  weather: WeatherCondition[];
  clouds: { all: number };
  wind: {
    speed: number;
    deg: number;
    gust?: number;
  };
  visibility: number;
  pop: number;
  rain?: { '3h'?: number };
  snow?: { '3h'?: number };
  sys: { pod: string };
  dt_txt: string;
}

export interface DailyForecastItem {
  dt: number;
  sunrise: number;
  sunset: number;
  moonrise: number;
  moonset: number;
  moon_phase: number;
  summary: string;
  temp: {
    day: number;
    min: number;
    max: number;
    night: number;
    eve: number;
    morn: number;
  };
  feels_like: {
    day: number;
    night: number;
    eve: number;
    morn: number;
  };
  pressure: number;
  humidity: number;
  dew_point: number;
  wind_speed: number;
  wind_deg: number;
  wind_gust?: number;
  weather: WeatherCondition[];
  clouds: number;
  pop: number;
  rain?: number;
  snow?: number;
  uvi: number;
}

export interface ForecastResponse {
  cod: string;
  message: number;
  cnt: number;
  list: HourlyForecastItem[];
  city: {
    id: number;
    name: string;
    coord: Coordinates;
    country: string;
    population: number;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
}

export interface DailyForecastResponse {
  cod: string;
  message: number;
  cnt: number;
  list: DailyForecastItem[];
  city: {
    id: number;
    name: string;
    coord: Coordinates;
    country: string;
    population: number;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
}

export interface AirPollutionResponse {
  coord: Coordinates;
  list: Array<{
    dt: number;
    main: { aqi: number };
    components: {
      co: number;
      no: number;
      no2: number;
      o3: number;
      so2: number;
      pm2_5: number;
      pm10: number;
      nh3: number;
    };
  }>;
}

export interface GeocodingResult {
  name: string;
  local_names?: Record<string, string>;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

// App Types
export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type WindSpeedUnit = 'ms' | 'kmh';
export type Theme = 'light' | 'dark' | 'auto';

export interface City {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

export interface WeatherState {
  current: CurrentWeather | null;
  hourly: ForecastResponse | null;
  daily: DailyForecastResponse | null;
  airPollution: AirPollutionResponse | null;
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
  isStale: boolean;
  city: City;
  temperatureUnit: TemperatureUnit;
  windSpeedUnit: WindSpeedUnit;
  theme: Theme;
  mapLayer: 'temperature' | 'precipitation' | 'wind' | 'clouds' | 'pressure';
  mapVisible: boolean;
}

export interface WeatherActions {
  setCurrent: (data: CurrentWeather) => void;
  setHourly: (data: ForecastResponse) => void;
  setDaily: (data: DailyForecastResponse) => void;
  setAirPollution: (data: AirPollutionResponse) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setLastUpdated: (timestamp: number) => void;
  setStale: (stale: boolean) => void;
  setCity: (city: City) => void;
  setTemperatureUnit: (unit: TemperatureUnit) => void;
  setWindSpeedUnit: (unit: WindSpeedUnit) => void;
  setTheme: (theme: Theme) => void;
  setMapLayer: (layer: WeatherState['mapLayer']) => void;
  setMapVisible: (visible: boolean) => void;
  loadFromCache: () => void;
  clearCache: () => void;
}

export type WeatherStore = WeatherState & WeatherActions;
