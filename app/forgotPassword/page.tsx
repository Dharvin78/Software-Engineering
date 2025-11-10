"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Container,
  Input,
  Heading,
  Stack,
  Text,
  Link as ChakraLink,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(""); 
  const { requestPasswordReset } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      await requestPasswordReset(email);
      setMessage(
        "If an account with that email exists, a password reset link has been sent."
      );
       setTimeout(() => router.push("/login"), 2000);
    } catch (error: any) {
      setMessage(error?.message || "Unable to request password reset.");
      setIsLoading(false);
    }
  };

  return (
    <Container
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Stack gap={8} mx="auto" maxW="lg" py={12} px={6}>
        <Stack align="center">
          <Heading fontSize="4xl">Reset your password</Heading>
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
              {message && (
                <Box
                  mb={2}
                  p={2}
                  bg={message.includes("sent") ? "green.100" : "red.100"}
                  color={message.includes("sent") ? "green.700" : "red.700"}
                  borderRadius="md"
                >
                  {message}
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

              <Stack gap={6}>
                <Button
                  colorScheme="blue"
                  type="submit"
                  loading={isLoading}
                >
                  Send reset link
                </Button>

                <Text textAlign="center">
                  Remembered your password?{" "}
                  <ChakraLink as={NextLink} href="/login" color="blue.400">
                    Login
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
