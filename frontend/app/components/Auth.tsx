'use client'

import { useState, FormEvent }  from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Flex,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  VStack,
  Alert,
  AlertIcon,
  AlertDescription,
} from '@chakra-ui/react'; // <-- THIS BLOCK IS THE FIX

// Define the shape for our message state
interface Message {
  text: string;
  type: 'success' | 'error' | 'info';
}

export default function AuthComponent() {
  const { login } = useAuth();
  
  // State for loading and messaging
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<Message | null>(null);

  // State for form inputs
  const [loginData, setLoginData] = useState({
    username: '',
    password: '',
  });

  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const showMessage = (text: string, type: Message['type'] = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!loginData.username || !loginData.password) {
      showMessage('Please fill in all fields', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/assets/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });
      const data = await response.json();

      if (response.ok) {
        login(data);
      } else {
        throw new Error(data.error || 'Invalid credentials');
      }
    } catch (error) {
      if (error instanceof Error) {
        showMessage(error.message, 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    if (!registerData.username || !registerData.email || !registerData.password) {
      showMessage('Please fill in all fields', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/assets/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData),
      });
      const data = await response.json();

      if (response.ok) {
        login(data);
      } else {
        throw new Error(data.error || 'Could not create account');
      }
    } catch (error) {
      if (error instanceof Error) {
        showMessage(error.message, 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bg="gray.50"
      p={4}
    >
      <Box
        bg="white"
        p={8}
        rounded="xl"
        shadow="lg"
        w="100%"
        maxW="md"
      >
        <Heading as="h1" size="lg" textAlign="center" mb={6}>
          DAM System
        </Heading>
        
        {message && (
          <Alert status={message.type} mb={6} rounded="md">
            <AlertIcon />
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <Tabs isFitted variant="enclosed">
          <TabList>
            <Tab>Login</Tab>
            <Tab>Register</Tab>
          </TabList>

          <TabPanels>
            {/* Login Panel */}
            <TabPanel>
              <Box as="form" onSubmit={handleLogin}>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Username</FormLabel>
                    <Input
                      type="text"
                      placeholder="Enter username"
                      value={loginData.username}
                      onChange={(e) =>
                        setLoginData({ ...loginData, username: e.target.value })
                      }
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Password</FormLabel>
                    <Input
                      type="password"
                      placeholder="Enter password"
                      value={loginData.password}
                      onChange={(e) =>
                        setLoginData({ ...loginData, password: e.target.value })
                      }
                    />
                  </FormControl>
                  <Button
                    type="submit"
                    colorScheme="blue"
                    w="100%"
                    isLoading={isLoading} // This will now work correctly
                  >
                    Login
                  </Button>
                </VStack>
              </Box>
            </TabPanel>

            {/* Register Panel */}
            <TabPanel>
              <Box as="form" onSubmit={handleRegister}>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Username</FormLabel>
                    <Input
                      type="text"
                      placeholder="Choose a username"
                      value={registerData.username}
                      onChange={(e) =>
                        setRegisterData({ ...registerData, username: e.target.value })
                      }
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Email</FormLabel>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={registerData.email}
                      onChange={(e) =>
                        setRegisterData({ ...registerData, email: e.target.value })
                      }
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Password</FormLabel>
                    <Input
                      type="password"
                      placeholder="Create a password"
                      value={registerData.password}
                      onChange={(e) =>
                        setRegisterData({ ...registerData, password: e.target.value })
                      }
                    />
                  </FormControl>
                  <Button
                    type="submit"
                    colorScheme="green"
                    w="100%"
                    isLoading={isLoading} // This will also work correctly
                  >
                    Register
                  </Button>
                </VStack>
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Flex>
  );
}