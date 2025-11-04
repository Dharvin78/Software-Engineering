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
  Link as ChakraLink,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { useAuth } from "../contexts/AuthContext"; // Import the useAuth hook
import { useRouter } from "next/router";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth(); // Get the login function from your context
  const router = useRouter();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Call the login function from your AuthContext
      await login(email, password);
      
      // The redirect to '/assets' is handled inside the AuthContext
      // after a successful login.
      
    } catch (error: any) {
      // If login fails, show an error message
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password.",
        status: "error",
        duration: 5000,
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
          <Heading fontSize="4xl">Sign in to your account</Heading>
        </Stack>
        <Box
          rounded="lg"
          bg="white" // Assuming a default light mode, or use Chakra's theme-aware colors
          boxShadow="lg"
          p={8}
          border="1px"
          borderColor="gray.200" // Use theme-aware border color
        >
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
              <FormControl id="password" isRequired>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword((e as React.ChangeEvent<HTMLInputElement>).target.value)}
                  autoComplete="current-password"
                />
              </FormControl>
              <Box textAlign="right" mb={2}>
                <NextLink href="/forgot-password" passHref>
                  <ChakraLink color="blue.400">Forgot password?</ChakraLink>
                </NextLink>
              </Box>
              <Stack spacing={6}>
                <Button
                  colorScheme="blue"
                  type="submit"
                  isLoading={isLoading}
                >
                  Sign in
                </Button>
                <Text align="center">
                  Don&apos;t have an account?{" "}
                  <NextLink href="/signup" passHref>
                    <ChakraLink color="blue.400">Sign up</ChakraLink>
                  </NextLink>
                </Text>
              </Stack>
            </Stack>
          </form>
        </Box>
      </Stack>
    </Container>
  );
}

