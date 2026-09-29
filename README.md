# Погода в Путилково 🌤️

Премиум PWA-приложение для просмотра погоды в Путилково с поддержкой OpenWeatherMap API.

## Возможности

- ✅ Текущая погода
- ✅ Почасовой прогноз
- ✅ Прогноз на 7 дней
- ✅ Карта погоды (температура, осадки, ветер, облака, давление)
- ✅ Качество воздуха (AQI)
- ✅ Восход/закат, фаза Луны
- ✅ Поиск городов
- ✅ Геолокация
- ✅ Переключение °C/°F
- ✅ Переключение скорости ветра (м/с, км/ч)
- ✅ Автообновление каждые 10 минут
- ✅ Кэширование в localStorage
- ✅ Офлайн-режим (PWA)
- ✅ Pull-to-refresh
- ✅ Анимации Framer Motion

## Установка

```bash
npm install
```

## Настройка

1. Скопируйте `.env.example` в `.env`:
   ```bash
   cp .env.example .env
   ```

2. Добавьте ваш API-ключ OpenWeatherMap в `.env`:
   ```
   VITE_OPENWEATHER_API_KEY=your_api_key_here
   ```

3. Получите API-ключ на [openweathermap.org](https://openweathermap.org/api)

## Запуск

### Development
```bash
npm run dev
```

### Production build
```bash
npm run build
```

### Preview production build
```bash
npm run preview
```

## Структура проекта

```
src/
├── components/
│   ├── weather/     # Погодные компоненты
│   ├── map/         # Карта погоды
│   └── ui/          # UI-компоненты
├── pages/           # Страницы
├── services/        # API-сервисы
├── hooks/           # React-хуки
├── utils/           # Утилиты
├── types/           # TypeScript-типы
└── store/           # Zustand store
```

## Технологии

- React 18 + TypeScript
- Vite
- Zustand (state management)
- Framer Motion (анимации)
- OpenWeatherMap API
- PWA (Service Worker, Manifest)

## Лицензия

MIT
