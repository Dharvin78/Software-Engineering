'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Stack,
  Heading,
  Text,
  Button,
  Spinner,
  Center,
  VStack,
  HStack,
  Tag,
} from '@chakra-ui/react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/ui/navbar';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  date_joined: string;
}

const API_URL = 'http://localhost:8000/api/users/';

export default function ManageUserPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const handleChangeRole = async (userId: number, newRole: string) => {
    if (!token) return;
    try {
      await fetch(`${API_URL}${userId}/change-role/`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleActive = async (userId: number, isActive: boolean) => {
    if (!token) return;
    try {
      await fetch(`${API_URL}${userId}/toggle-active/`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: !isActive }),
      });
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!token) return;

    const confirmed = window.confirm("Are you sure you want to delete this user?");
    if (!confirmed) return;

    try {
      const res = await fetch(`${API_URL}${userId}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Delete failed");

      // Update the frontend state
      setUsers((prev) => prev.filter((u) => u.id !== userId));

      alert("User deleted successfully!");
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(err.message);
        alert(err.message);
      } else {
        console.error(err);
        alert("Error deleting user");
      }
    }
  };

     return (
    <Box minH="100vh" bg="#f7f9fc">
      <Navbar />
      <Box maxW="6xl" mx="auto" py={10} px={6}>
        <Heading mb={8} textAlign="center" color="#2b6cb0">
          Manage Users
        </Heading>

        {loading ? (
          <Center h="50vh">
            <Spinner size="xl" color="#2b6cb0" />
          </Center>
        ) : users.length ? (
          <VStack gap={5} align="stretch">
            {users.map((u) => (
              <Box
                key={u.id}
                p={6}
                borderRadius="lg"
                shadow="md"
                bg="white"
                _hover={{ shadow: "lg", transform: "scale(1.01)" }}
                transition="all 0.2s ease-in-out"
              >
                <Stack
                  direction={{ base: "column", md: "row" }}
                  justify="space-between"
                  align="center"
                >
                  {/* User Info */}
                  <Box>
                    <Text fontWeight="bold" fontSize="xl" color="#1a202c">
                      {u.username}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      Email: {u.email}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      Date Joined: {u.date_joined}
                    </Text>

                    <HStack mt={2} gap={2}>
                      <Box
                        px={2}
                        py={1}
                        borderRadius="md"
                        bg={u.role === "admin" ? "red.100" : u.role === "editor" ? "blue.100" : "gray.200"}
                        color={u.role === "admin" ? "red.600" : u.role === "editor" ? "blue.600" : "gray.600"}
                        fontWeight="bold"
                        fontSize="xs"
                      >
                        {u.role.toUpperCase()}
                      </Box>

                      <Box
                        px={2}
                        py={1}
                        borderRadius="md"
                        bg={u.is_active ? "green.100" : "orange.100"}
                        color={u.is_active ? "green.600" : "orange.600"}
                        fontWeight="bold"
                        fontSize="xs"
                      >
                        {u.is_active ? "ACTIVE" : "INACTIVE"}
                      </Box>
                    </HStack>
                  </Box>

                  {/* Action Buttons */}
                  <HStack gap={3} mt={{ base: 4, md: 0 }}>
                    <Button
                      size="sm"
                      bg="blue.500"
                      color="white"
                      _hover={{ bg: "blue.600" }}
                      onClick={() => handleChangeRole(u.id, "editor")}
                    >
                      Make Editor
                    </Button>
                    <Button
                      size="sm"
                      bg="purple.500"
                      color="white"
                      _hover={{ bg: "purple.600" }}
                      onClick={() => handleChangeRole(u.id, "viewer")}
                    >
                      Make Viewer
                    </Button>
                    <Button
                      size="sm"
                      bg={u.is_active ? "orange.400" : "green.400"}
                      color="white"
                      _hover={{ bg: u.is_active ? "orange.500" : "green.500" }}
                      onClick={() => handleToggleActive(u.id, u.is_active)}
                    >
                      {u.is_active ? "Deactivate" : "Activate"}
                    </Button>
                    <Button
                      size="sm"
                      bg="red.500"
                      color="white"
                      _hover={{ bg: "red.600" }}
                      onClick={() => handleDeleteUser(u.id)}
                    >
                      Delete
                    </Button>
                  </HStack>
                </Stack>
              </Box>
            ))}
          </VStack>
        ) : (
          <Center>
            <Text color="gray.500">No users found.</Text>
          </Center>
        )}
      </Box>
    </Box>
  );
}