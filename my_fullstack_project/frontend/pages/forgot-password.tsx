import { useState } from "react";
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  Heading,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/router";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { requestPasswordReset } = useAuth();
  const toast = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await requestPasswordReset(email);
      toast({
        title: "If an account exists",
        description:
          "If an account with that email exists we'll send a password reset link.",
        status: "info",
        duration: 6000,
        isClosable: true,
      });
      router.push("/login");
    } catch (error: any) {
      toast({
        title: "Request failed",
        description: error.message || "Unable to request password reset.",
        status: "error",
        duration: 6000,
        isClosable: true,
      });
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
      <Stack spacing={8} mx="auto" maxW="lg" py={12} px={6}>
        <Stack align="center">
          <Heading fontSize="4xl">Reset your password</Heading>
        </Stack>
        <Box rounded="lg" bg="white" boxShadow="lg" p={8} border="1px" borderColor="gray.200">
          <form onSubmit={handleSubmit}>
            <Stack spacing={4}>
              <FormControl id="email" isRequired>
                <FormLabel>Email address</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </FormControl>

              <Stack spacing={6}>
                <Button colorScheme="blue" type="submit" isLoading={isLoading}>
                  Send reset link
                </Button>
                <Text align="center">
                  Remembered your password? <NextLink href="/login">Login</NextLink>
                </Text>
              </Stack>
            </Stack>
          </form>
        </Box>
      </Stack>
    </Container>
  );
}
