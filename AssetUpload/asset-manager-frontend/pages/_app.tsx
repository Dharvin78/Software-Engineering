// Custom App
import type { AppProps } from 'next/app';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { AuthProvider } from '../context/AuthContext';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider value={defaultSystem}>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </ChakraProvider>
  );
}
