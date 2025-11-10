// @ts-nocheck
import { ChakraProvider } from "@chakra-ui/react";
import type { AppProps } from "next/app";

// Import the AuthProvider you just created
import { AuthProvider } from "../contexts/AuthContext";

/**
 * This is the root component of your application.
 * We wrap everything in ChakraProvider (for UI)
 * and AuthProvider (for login state).
 */
function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </ChakraProvider>
  );
}

export default MyApp;