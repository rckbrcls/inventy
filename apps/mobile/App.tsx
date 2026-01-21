import { ScreenContent } from 'components/ScreenContent';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { createTables } from './src/db/schema';

import './global.css';

export default function App() {
  useEffect(() => {
    createTables();
  }, []);

  return (
    <>
      <ScreenContent title="Home" path="App.tsx"></ScreenContent>
      <StatusBar style="auto" />
    </>
  );
}
