import { WeatherPage } from './pages/WeatherPage';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <WeatherPage />
    </ErrorBoundary>
  );
}

export default App;
