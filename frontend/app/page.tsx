'use client'

import { useAuth } from './context/AuthContext';
import AuthComponent from './components/Auth'; // Assuming your Auth component is named Auth.tsx
import AssetManager from './components/AssetManager';
import { Center, Spinner } from '@chakra-ui/react';

export default function Home() {
  const { token, isLoading } = useAuth();

  // 1. Show a loading spinner while the AuthContext is checking localStorage.
  // This prevents a "flash" of the login screen if the user is already logged in.
  if (isLoading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }
  
  // 2. Once loading is complete, check for a token.
  // If a token exists, the user is logged in, so show the AssetManager.
  // Otherwise, show the authentication component.
  return (
    <main>
      {token ? <AssetManager /> : <AuthComponent />}
    </main>
  );
}