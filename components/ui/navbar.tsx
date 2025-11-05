"use client";
import {
  Heading,
  Button,
  HStack,
} from "@chakra-ui/react";

import Link from "next/link";

interface User {
  username: string;
  role: string;
}

const dummyUser: User = { username: "admin1", role: "admin" };

const isAdmin = (user: User) => user?.role === "admin";

export default function Navbar({ user }: { user: User }) {
  return (
    <HStack justifyContent="space-between" p={4} bg="gray.100">
      <Heading size="md">DAM System</Heading>

      <HStack gap={4}>
        <Link href="/" passHref>
          <Button variant="ghost">Home</Button>
        </Link>
        <Link href="/upload" passHref>
          <Button variant="ghost">Upload</Button>
        </Link>
        <Link href="/metadata" passHref>
          <Button variant="ghost">Metadata</Button>
        </Link>
        <Link href="/metadata" passHref>
          <Button variant="ghost">Profile</Button>
        </Link>
        {isAdmin(user) && (
          <Link href="/manage-user" passHref>
            <Button colorScheme="red">Manage User</Button>
          </Link>
        )}

        <Button variant="outline">Logout</Button>
      </HStack>
    </HStack>
  );
}
