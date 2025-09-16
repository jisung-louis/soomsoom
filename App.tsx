import React from 'react';
import { OnboardingProvider } from './contexts/OnboardingContext';
import { ToastProvider } from './contexts/ToastContext';
import AppContent from './app/AppContent';

export default function App() {
  return (
    <OnboardingProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </OnboardingProvider>
  );
}