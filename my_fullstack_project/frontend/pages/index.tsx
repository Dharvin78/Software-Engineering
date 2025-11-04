import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../contexts/AuthContext";
import { Box, Spinner } from "@chakra-ui/react";

/**
 * This is the "smart" index page. It's the first page that loads.
 * It checks the auth state and redirects the user to the
 * correct page (login or assets).
 */
export default function IndexPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait until the AuthContext is finished loading
    if (loading) {
      return; // Do nothing while loading
    }

    // If loading is done and there IS a user, go to assets
    if (user) {
      router.push("/assets");
    }
    
    // If loading is done and there is NO user, go to login
    if (!user) {
      router.push("/login");
    }
    
  }, [user, loading, router]); // Re-run this effect when auth state changes

  // Show a full-screen loading spinner while we're checking the auth state
  // and redirecting. This prevents a "flash" of an empty page.
  return (
    <Box
      display="flex"
      minH="100vh"
      alignItems="center"
      justifyContent="center"
    >
      <Spinner
        thickness="4px"
        speed="0.65s"
        emptyColor="gray.200"
        color="blue.500"
        size="xl"
      />
    </Box>
  );
}

