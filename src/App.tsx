import React, { useState, useEffect } from 'react';
import { Header } from './components/common/Header';
import { Navigation, ActiveTab } from './components/common/Navigation';
import { Footer } from './components/common/Footer';
import { EmergencyModal } from './components/common/EmergencyModal';
import { AchievementToast } from './components/common/AchievementToast';
import { CustomFlightModal } from './components/flight-tracker/CustomFlightModal';

import { OperationsDashboard } from './components/dashboard/OperationsDashboard';
import { FlightTracker } from './components/flight-tracker/FlightTracker';
import { FidsBoard } from './components/arrivals-departures/FidsBoard';
import { AtcSimulator } from './components/atc-simulator/AtcSimulator';
import { AirportMap } from './components/airport-map/AirportMap';
import { WeatherCenter } from './components/weather-center/WeatherCenter';
import { FlightSimulator } from './components/flight-simulator/FlightSimulator';
import { AirportManagement } from './components/airport-management/AirportManagement';
import { AircraftEncyclopedia } from './components/encyclopedia/AircraftEncyclopedia';

import { INITIAL_FLIGHTS } from './data/initialFlights';
import { Flight } from './types/flight';
import { WeatherData, WeatherScenario } from './types/weather';
import { WEATHER_PRESETS } from './services/simulationStore';
import { Achievement, ACHIEVEMENTS_LIST } from './data/achievements';
import { audioService } from './services/audioService';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [flights, setFlights] = useState<Flight[]>(INITIAL_FLIGHTS);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [weather, setWeather] = useState<WeatherData>(WEATHER_PRESETS.clear);
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState<boolean>(false);
  const [isCustomFlightModalOpen, setIsCustomFlightModalOpen] = useState<boolean>(false);
  const [activeAchievement, setActiveAchievement] = useState<Achievement | null>(null);

  // Dynamic Flight Movement Simulation Loop
  useEffect(() => {
    if (simSpeed === 0) return;

    const interval = setInterval(() => {
      setFlights((prevFlights) =>
        prevFlights.map((f) => {
          // If on ground, stay parked or taxi slightly
          if (f.altitude === 0) return f;

          // Compute step velocity
          const stepSpeed = (f.groundSpeed / 3600) * 0.15 * simSpeed;
          const rad = (f.heading * Math.PI) / 180;
          const deltaX = Math.sin(rad) * stepSpeed;
          const deltaY = -Math.cos(rad) * stepSpeed;

          let nextX = f.position.x + deltaX;
          let nextY = f.position.y + deltaY;

          // Wrap around radar screen boundaries (0 - 100)
          if (nextX > 96) nextX = 4;
          if (nextX < 4) nextX = 96;
          if (nextY > 96) nextY = 4;
          if (nextY < 4) nextY = 96;

          // Altitude adjustments
          let nextAlt = f.altitude;
          if (f.type === 'arrival' && f.altitude > 1500) {
            nextAlt = Math.max(1200, f.altitude - Math.round(15 * simSpeed));
          } else if (f.type === 'departure' && f.altitude < 35000) {
            nextAlt = Math.min(36000, f.altitude + Math.round(25 * simSpeed));
          }

          // Append path history (last 5 points)
          const newPath = [...f.pathHistory, { x: nextX, y: nextY }].slice(-6);

          return {
            ...f,
            position: { x: nextX, y: nextY },
            altitude: nextAlt,
            pathHistory: newPath,
          };
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [simSpeed]);

  const handleSelectWeatherScenario = (scenario: WeatherScenario) => {
    const nextW = WEATHER_PRESETS[scenario] || WEATHER_PRESETS.clear;
    setWeather(nextW);

    // If thunderstorm, introduce random flight delays
    if (scenario === 'thunderstorm' || scenario === 'severe') {
      setFlights((prev) =>
        prev.map((f) => (f.altitude > 0 && Math.random() > 0.4 ? { ...f, status: 'Delayed', delayReason: 'Ground stop - Thunderstorm over airfield' } : f))
      );
    }
  };

  const handleAddCustomFlight = (customFlight: Flight) => {
    setFlights((prev) => [customFlight, ...prev]);
    setSelectedFlight(customFlight);
    setActiveTab('tracker');
  };

  const handleTriggerEmergencyScenario = (type: string, description: string) => {
    // Find or convert first active flight into emergency
    setFlights((prev) =>
      prev.map((f, i) =>
        i === 0
          ? {
              ...f,
              status: 'Emergency',
              emergencyType: description,
              squawk: '7700',
            }
          : f
      )
    );
  };

  const handleUnlockAchievement = (id: string) => {
    const found = ACHIEVEMENTS_LIST.find((a) => a.id === id);
    if (found) {
      setActiveAchievement(found);
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#050b14] text-slate-100' : 'bg-[#f1f5f9] text-slate-900'} flex flex-col font-sans transition-colors duration-300`}>
      
      {/* Top Header */}
      <Header
        weather={weather}
        simSpeed={simSpeed}
        onSetSimSpeed={setSimSpeed}
        onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
        onOpenWeather={() => setActiveTab('weather')}
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      />

      {/* Primary Navigation Tabs */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        flightCount={flights.length}
        alertCount={flights.filter((f) => f.status === 'Emergency').length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-6">
        {activeTab === 'dashboard' && (
          <OperationsDashboard
            flights={flights}
            weather={weather}
            onSelectTab={setActiveTab}
            onSelectFlight={(flight) => {
              setSelectedFlight(flight);
              setActiveTab('tracker');
            }}
            onOpenCustomFlightModal={() => setIsCustomFlightModalOpen(true)}
            onUnlockAchievement={handleUnlockAchievement}
          />
        )}

        {activeTab === 'tracker' && (
          <FlightTracker
            flights={flights}
            onAddCustomFlight={handleAddCustomFlight}
            onUnlockAchievement={handleUnlockAchievement}
            selectedFlight={selectedFlight}
            onSelectFlight={setSelectedFlight}
          />
        )}

        {activeTab === 'fids' && (
          <FidsBoard
            flights={flights}
            onSelectFlight={(flight) => {
              setSelectedFlight(flight);
              setActiveTab('tracker');
            }}
            onUnlockAchievement={handleUnlockAchievement}
          />
        )}

        {activeTab === 'atc' && (
          <AtcSimulator
            weather={weather}
            onUnlockAchievement={handleUnlockAchievement}
          />
        )}

        {activeTab === 'map' && (
          <AirportMap />
        )}

        {activeTab === 'weather' && (
          <WeatherCenter
            currentWeather={weather}
            onSelectWeatherScenario={handleSelectWeatherScenario}
            onUnlockAchievement={handleUnlockAchievement}
          />
        )}

        {activeTab === 'simulator' && (
          <FlightSimulator
            weather={weather}
            onUnlockAchievement={handleUnlockAchievement}
          />
        )}

        {activeTab === 'management' && (
          <AirportManagement
            onUnlockAchievement={handleUnlockAchievement}
          />
        )}

        {activeTab === 'encyclopedia' && (
          <AircraftEncyclopedia
            onUnlockAchievement={handleUnlockAchievement}
          />
        )}
      </main>

      {/* Footer */}
      <Footer onSelectTab={setActiveTab} />

      {/* Emergency Scenario Modal */}
      <EmergencyModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        onTriggerScenario={handleTriggerEmergencyScenario}
      />

      {/* Custom Flight Creator Wizard */}
      <CustomFlightModal
        isOpen={isCustomFlightModalOpen}
        onClose={() => setIsCustomFlightModalOpen(false)}
        onAddCustomFlight={handleAddCustomFlight}
      />

      {/* Achievement Unlocked Toast Notification */}
      <AchievementToast
        achievement={activeAchievement}
        onClose={() => setActiveAchievement(null)}
      />

    </div>
  );
}

export default App;
