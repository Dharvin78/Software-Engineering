"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import Navbar from "@/components/ui/navbar";
import {
  Box, Button, Stack, Heading, Text, Spinner, useDisclosure,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  FormControl, FormLabel, Input, Select,
  Center, Flex, Menu, MenuButton, MenuList, MenuItem
} from "@chakra-ui/react";
import { useRouter } from 'next/navigation';
import { User } from "@/lib/types";
import { ChevronDownIcon } from '@chakra-ui/icons';

interface Group {
  id: number;
  name: string;
}

export default function ManageUsersPage() {
  const {user: currentUser } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for the create user modal
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newUser, setNewUser] = useState({
    username: '', email: '', password: '', groups: ['Viewer']
  });
    const [availableGroups, setAvailableGroups] = useState<Group[]>([]);

  // Frontend Route Protection
  useEffect(() => {
    // If auth is still loading, wait. If it's loaded and there's no superuser, redirect.
    if (currentUser && !currentUser.is_superuser) {
      router.push('/'); // Redirect to home page if not an admin
    }
  }, [currentUser, router]);

  useEffect(() => {
    if (currentUser?.is_superuser) {
      const fetchUsers = async () => {
        try {
          // The apiClient will automatically add the token, so you don't need it here.
          const resp = await api.get("/users/");
          setUsers(resp.data);
        } catch (err) {
          console.error("Failed to fetch users:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchUsers();
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser?.is_superuser) {
      const fetchGroups = async () => {
        try {
          const resp = await api.get("/groups/");
          setAvailableGroups(resp.data);
        } catch (err) {
          console.error("Failed to fetch groups:", err);
        }
      };
      fetchGroups();
    }
  }, [currentUser]);

  const handleRoleChange = async (userId: number, groupName: string) => {
    try {
      const resp = await api.post(`/users/${userId}/set-role/`, { group: groupName });
      // Update the user in the local state with the returned data
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? resp.data : u))
      );
    } catch (err) {
      console.error("Failed to change user role:", err);
      // You could show an error toast here
    }
  };

  const handleCreateUser = async () => {
    try {
        await api.post("/users/", newUser);
        onClose(); // Close modal on success
        // Refresh user list
        setLoading(true);
        const resp = await api.get("/users/");
        setUsers(resp.data);
    } catch (err) {
        console.error("Failed to create user:", err);
        // You can add an error message to the user here
    } finally {
        setLoading(false);
    }
  };

  const toggleActive = async (user: User) => {
    const action = user.is_active ? "deactivate" : "activate";
    try {
      await api.post(`/users/${user.id}/${action}/`);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, is_active: !u.is_active } : u))
      );
    } catch (err) {
      console.error(`Failed to ${action} user:`, err);
    }
  };

  const deleteUser = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
        try {
            await api.delete(`/users/${id}/`);
            setUsers((prev) => prev.filter((u) => u.id !== id));
        } catch (err) {
            console.error("Failed to delete user:", err);
        }
    }
  };

  // Render nothing or a loading spinner until we confirm user is an admin
  if (!currentUser?.is_superuser) {
    return (
      <Center h="100vh">
        <Spinner />
        <Text ml={4}>Verifying permissions...</Text>
      </Center>
    );
  }

  return (
    <>
      <Navbar user={currentUser} />

      <Box p={8} maxW="1000px" mx="auto">
        <Stack gap={4}>
          <Flex justifyContent="space-between" alignItems="center">
            <Heading>Manage Users</Heading>
            <Button colorScheme="blue" onClick={onOpen}>Add New User</Button>
          </Flex>

          {loading && <Spinner size="xl" alignSelf="center" mt={8} />}

          {!loading && users.map((user) => (
            <Box key={user.id} p={4} borderWidth={1} borderRadius="md" display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Text><strong>Username:</strong> {user.username} {user.is_superuser && "(Admin)"}</Text>
                <Text><strong>Email:</strong> {user.email}</Text>
                <Text><strong>Role:</strong> {user.groups.join(', ') || 'N/A'}</Text>
                <Text><strong>Status:</strong> {user.is_active ? "Active" : "Inactive"}</Text>
              </Box>
              <Stack direction="row" gap={2}>
                {!user.is_superuser && (
                  <Menu>
                    <MenuButton as={Button} size="sm" rightIcon={<ChevronDownIcon />}>
                      Change Role
                    </MenuButton>
                    <MenuList>
                      {availableGroups.map((group) => (
                        <MenuItem 
                          key={group.id} 
                          onClick={() => handleRoleChange(user.id, group.name)}
                          isDisabled={user.groups.includes(group.name)}
                        >
                          Set as {group.name}
                        </MenuItem>
                      ))}
                    </MenuList>
                  </Menu>
                )}
                <Button size="sm" onClick={() => toggleActive(user)}>
                  {user.is_active ? "Deactivate" : "Activate"}
                </Button>
                {!user.is_superuser && (
                  <Button size="sm" colorScheme="red" onClick={() => deleteUser(user.id)}>
                    Delete
                  </Button>
                )}
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>

      {/* Create User Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create a New User</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Username</FormLabel>
                <Input placeholder="john_doe" onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input type="email" placeholder="john@example.com" onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <Input type="password" placeholder="••••••••" onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Role</FormLabel>
                <Select onChange={(e) => setNewUser({ ...newUser, groups: [e.target.value] })}>
                  <option value="Viewer">Viewer</option>
                  <option value="Editor">Editor</option>
                </Select>
              </FormControl>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
            <Button colorScheme="blue" onClick={handleCreateUser}>Create User</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}