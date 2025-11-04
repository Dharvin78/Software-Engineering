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

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState(""); // For password confirmation
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth(); // Get the signup function from your context
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if passwords match
    if (password !== password2) {
      toast({
        title: "Passwords do not match.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return; // Stop the submission
    }

    setIsLoading(true);
    try {
      // Call the signup function from your AuthContext
      // The user role is 'user' by default on your backend
      await signup({ email, username, password, password2 });
      
      // The redirect to '/assets' is handled inside the 
      // AuthContext's signup function (which calls login).
      
    } catch (error: any) {
      // If signup fails, show an error message
      let errorMessage = "Please check your details and try again.";
      // Try to parse error from Django
      try {
        const errorData = JSON.parse(error.message);
        if (errorData.email) {
          errorMessage = `Email: ${errorData.email[0]}`;
        } else if (errorData.username) {
          errorMessage = `Username: ${errorData.username[0]}`;
        }
      } catch (e) {}

      toast({
        title: "Signup Failed",
        description: errorMessage,
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
          <Heading fontSize="4xl">Create your account</Heading>
        </Stack>
        <Box
          rounded="lg"
          bg="white" // Assuming a default light mode
          boxShadow="lg"
          p={8}
          border="1px"
          borderColor="gray.200"
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
              <FormControl id="username" isRequired>
                <FormLabel>Username</FormLabel>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                />
              </FormControl>
              <FormControl id="password" isRequired>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </FormControl>
              <FormControl id="password2" isRequired>
                <FormLabel>Confirm Password</FormLabel>
                <Input
                  type="password"
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                  autoComplete="new-password"
                />
              </FormControl>
              <Stack spacing={6}>
                <Button
                  colorScheme="blue"
                  type="submit"
                  isLoading={isLoading}
                >
                  Sign up
                </Button>
                <Text align="center">
                  Already have an account?{" "}
                  <NextLink href="/login" passHref>
                    <ChakraLink color="blue.400">Login</ChakraLink>
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