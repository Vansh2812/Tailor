import { Toaster } from '@/components/ui/sonner.jsx';
import { TooltipProvider } from '@/components/ui/tooltip.jsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import './i18n'; // 👈 Import i18n setup

// Pages
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import LoginForm from './components/LoginForm.jsx';
import ResetPassword from './components/ResetPassword.jsx';

const queryClient = new QueryClient();

const App = () => {
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language);

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    i18n.changeLanguage(lang);
    localStorage.setItem('lang', lang);
    setLanguage(lang);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          {/* Simple Header for language switch */}


          {/* All Routes */}
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginForm onLogin={() => console.log('Logged in')} />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
