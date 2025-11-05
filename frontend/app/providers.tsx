'use client'

import { ChakraProvider } from '@chakra-ui/react'
import { AuthProvider } from './context/AuthContext' // <-- 1. IMPORT AuthProvider

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    // 2. WRAP everything with AuthProvider
    <AuthProvider>
      <ChakraProvider>
        {children}
      </ChakraProvider>
    </AuthProvider>
  )
}