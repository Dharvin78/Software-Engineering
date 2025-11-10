"use client";

import { useState } from "react";
import { Box, Button, Container, Input, Heading, Stack, Text, Link as ChakraLink } from "@chakra-ui/react";
import NextLink from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  // Login page
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  setErrorMessage("");

  try {
    await login(email, password); // call login from context
    router.push("/homepage"); // redirect on success
  } catch (error: any) {
    // Safe error handling
    setErrorMessage(error?.message || "Login failed. Please try again.");
  } finally {
    setIsLoading(false);
  }
};

  return (
    <Container minH="100vh" display="flex" alignItems="center" justifyContent="center">
      <Stack gap={8} mx="auto" maxW="lg" py={12} px={6}>
        <Stack align="center">
          <Heading fontSize="4xl">Sign in to your account</Heading>
        </Stack>

        <Box rounded="lg" bg="white" boxShadow="lg" p={8} border="1px" borderColor="gray.200">
          <form onSubmit={handleSubmit}>
            <Stack gap={4}>
              {errorMessage && (
                <Box mb={2} p={2} bg="red.100" color="red.700" borderRadius="md">
                  {errorMessage}
                </Box>
              )}

              <Box>
                <Text mb={1}>Email address</Text>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </Box>

              <Box>
                <Text mb={1}>Password</Text>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </Box>

              <Box textAlign="right" mb={2}>
                <ChakraLink as={NextLink} href="/forgot_password" color="blue.400">
                  Forgot password?
                </ChakraLink>
              </Box>

              <Stack gap={6}>
                <Button colorScheme="blue" type="submit" loading={isLoading}>
                  Sign in
                </Button>
                <Text textAlign="center">
                  Don&apos;t have an account?{" "}
                  <ChakraLink as={NextLink} href="/sign_up" color="blue.400">
                    Sign up
                  </ChakraLink>
                </Text>
              </Stack>
            </Stack>
          </form>
        </Box>
      </Stack>
    </Container>
  );
}
