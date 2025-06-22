import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import SignUp from './pages/SignUp';
import MainApp from './MainApp';
import VoiceAssistantWidget from './components/VoiceAssistantWidget';

function App() {
  const [darkMode, setDarkMode] = React.useState(false);

  const toggleDarkMode = () => {
    setDarkMode(prevMode => {
      const newMode = !prevMode;
      if (newMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return newMode;
    });
  };
  
  // A placeholder for authentication logic
  const isAuthenticated = true; // Set to true to see the main app for now

  return (
    <Router>
      <div className={darkMode ? 'dark' : ''}>
        <Routes>
          <Route path="/" element={<LandingPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
          <Route path="/signup" element={<SignUp darkMode={darkMode} />} />
          <Route 
            path="/app" 
            element={isAuthenticated ? <MainApp darkMode={darkMode} toggleDarkMode={toggleDarkMode}/> : <Navigate to="/" replace />} 
          />
          {/* Redirect any unknown paths to the landing page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <VoiceAssistantWidget />
      </div>
    </Router>
  );
}

export default App; 