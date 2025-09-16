import React from 'react';
import { OnboardingProvider } from './contexts/OnboardingContext';
import { ToastProvider } from './contexts/ToastContext';
import AppContent from './app/AppContent';
import { useAppConfigStore } from './stores/appConfigStore';

// // 개발용 임시 콘솔 필터: ERROR만 보이게
// if (__DEV__) {
//   // eslint-disable-next-line no-console
//   console.log = () => {};
//   // eslint-disable-next-line no-console
//   console.info = () => {};
//   // eslint-disable-next-line no-console
//   console.debug = () => {};
//   // eslint-disable-next-line no-console
//   console.warn = () => {};
// }

export default function App() {
  const { useMockApi } = useAppConfigStore();
  return (
    <OnboardingProvider>
      <ToastProvider>
        <AppContent key={`app-${useMockApi ? 'mock' : 'live'}`} />
      </ToastProvider>
    </OnboardingProvider>
  );
}