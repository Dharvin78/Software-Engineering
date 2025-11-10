"use client";


import { useState } from "react";
import { Box, Button, Container, Input, Heading, Stack, Text, Link as ChakraLink } from "@chakra-ui/react";
import NextLink from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { signup } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== password2) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      await signup({ email, username, password, password2 });
      router.push("/login"); // redirect after signup
    } catch (error: any) {
      let message = error?.message || "Signup failed. Please try again.";
      try {
        const data = JSON.parse(error.message);
        if (data.email) message = `Email: ${data.email[0]}`;
        else if (data.username) message = `Username: ${data.username[0]}`;
      } catch {}
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="gray.50"
      px={4}
    >
      <Stack gap={8} maxW="lg" w="full" py={12} px={6}>
        <Stack align="center">
          <Heading fontSize="4xl">Create your account</Heading>
        </Stack>

        <Box
          rounded="lg"
          bg="white"
          boxShadow="lg"
          p={8}
          border="1px"
          borderColor="gray.200"
        >
          <form onSubmit={handleSubmit}>
            <Stack gap={4}>
              {errorMessage && (
                <Box
                  mb={2}
                  p={2}
                  bg="red.100"
                  color="red.700"
                  borderRadius="md"
                >
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
                <Text mb={1}>Username</Text>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                />
              </Box>

              <Box>
                <Text mb={1}>Password</Text>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </Box>

              <Box>
                <Text mb={1}>Confirm Password</Text>
                <Input
                  type="password"
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </Box>

              <Stack gap={6}>
                <Button colorScheme="blue" type="submit" loading={isLoading}>
                Sign up
              </Button>

                <Text textAlign="center">
                  Already have an account?{" "}
                  <ChakraLink as={NextLink} href="/login" color="blue.400">
                    Login
                  </ChakraLink>
                </Text>
              </Stack>
            </Stack>
          </form>
        </Box>
      </Stack>
    </Box>
  );
}
