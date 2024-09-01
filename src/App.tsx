import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './components/ui/theme-provider';
import { LandingPage } from './components/LandingPage';
import { Login } from './components/Login';
import { Pricing } from './components/Pricing';
import AudioMixer from './AudioMixer';

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="min-h-screen bg-background font-sans antialiased">
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/app" element={<AudioMixer />} />
          </Routes>
        </Router>
      </div>
    </ThemeProvider>
  );
}

export default App;