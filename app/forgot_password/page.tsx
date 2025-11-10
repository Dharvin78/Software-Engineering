"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Container,
  Heading,
  Input,
  Stack,
  Text,
  Link as ChakraLink,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { requestPasswordReset } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
    const res = await fetch("http://localhost:8000/api/password-reset-request/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (!res.ok) {
      // backend returned 404 for non-existent email
      setMessage(`❌ ${data.error || "Unable to send password reset email."}`);
      return;
    }

    setMessage("✅ Password reset link has been sent to your email.");
    setTimeout(() => router.push("/login"), 3000);

  } catch (error: any) {
    setMessage(error?.message || "❌ Unable to send password reset email.");
  }finally {
  setIsLoading(false); // <- always reset loading
}

};

  return (
    <Container minH="100vh" display="flex" alignItems="center" justifyContent="center">
      <Stack gap={8} w="full" maxW="md" bg="white" p={8} rounded="lg" boxShadow="lg">
        <Heading textAlign="center" fontSize="2xl">Forgot Password</Heading>
        {message && (
          <Box
            p={2}
            bg={message.startsWith("✅") ? "green.100" : "red.100"}
            color={message.startsWith("✅") ? "green.700" : "red.700"}
            borderRadius="md"
          >
            {message}
          </Box>
        )}
        <form onSubmit={handleSubmit}>
          <Stack gap={4}>
            <Box>
              <Text mb={1}>Email address</Text>
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Box>
            <Button type="submit" colorScheme="blue" loading={loading}>
              Send Reset Link
            </Button>
            <Text textAlign="center">
              Remember your password?{" "}
              <ChakraLink as={NextLink} href="/login" color="blue.500">
                Login
              </ChakraLink>
            </Text>
          </Stack>
        </form>
      </Stack>
    </Container>
  );
}
