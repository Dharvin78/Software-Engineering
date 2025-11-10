'use client';
import {
  Heading,
  Button,
  HStack,
} from "@chakra-ui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();           // Clear token & user data
    router.push("/login"); // Redirect to login page
  };
  const isAdmin = user?.role === "admin";

  return (
    <HStack justifyContent="space-between" p={4} bg="gray.100">
      <Heading size="md">DAM System</Heading>

      <HStack gap={4}>
        <Link href="/homepage" passHref>
          <Button variant="ghost">Home</Button>
        </Link>

        <Link href="/upload" passHref>
          <Button variant="ghost">Upload</Button>
        </Link>

        <Link href="/metadata" passHref>
          <Button variant="ghost">Metadata</Button>
        </Link>

        <Link href="/Profile" passHref>
          <Button variant="ghost">Profile</Button>
        </Link>

        {isAdmin && (
          <Link href="/manage_user" passHref>
            <Button colorScheme="red">Manage User</Button>
          </Link>
        )}

        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </HStack>
    </HStack>
  );
}
