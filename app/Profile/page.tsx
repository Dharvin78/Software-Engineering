'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Spinner,
  Center,
  Button,
  VStack,
  SimpleGrid,
  Input,
  HStack,
  Icon,
} from '@chakra-ui/react';
import { FaUser, FaEnvelope, FaUserShield, FaCheckCircle } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/ui/navbar';

export default function ProfilePage() {
  const { user, token, fetchUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
  });

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      if (!user) {
        setLoading(true);
        await fetchUser();
        setLoading(false);
      } else {
        setFormData({
          username: user.username || '',
          email: user.email || '',
        });
      }
    };
    loadUser();
  }, [user, fetchUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/users/me/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username: formData.username, email: formData.email })
      });
      const data = await res.json();

      if (!res.ok) {
      let errorMsg = '';
      if (typeof data === 'object') {
        errorMsg = Object.entries(data)
          .map(([key, val]) => `${key}: ${val}`)
          .join('\n');
      } else {
        errorMsg = JSON.stringify(data);
      }
      console.error('Profile update failed:', data);
      alert('Update Failed：\n' + errorMsg);
      return ;
    }
     await fetchUser();
    setIsEditing(false);
    alert('Profile update successfully！');
  } catch (err) {
    console.error(err);
    alert('Update failed. Please check your network or try again later.');
  }
};

  if (loading) {
    return (
      <Center h="50vh">
        <Spinner size="xl" color="teal.500" />
      </Center>
    );
  }

  if (!user) {
    return (
      <Center h="50vh">
        <Text>Please log in first</Text>
      </Center>
    );
  }

  return (
    <Box bg="white.100" minH="100vh">
      <Navbar />

      <Box p={8} maxW="5xl" mx="auto">
        <Heading mb={8} textAlign="center" color="teal.600"> MY Profile </Heading>

        <SimpleGrid columns={{ base: 1, md: 2 }} gap={6} mb={6}>
          <Box
            bg="teal.50"
            p={6}
            borderRadius="xl"
            boxShadow="lg"
            transition="all 0.3s"
            _hover={{ transform: 'translateY(-4px)', boxShadow: 'xl' }}
          >
            <HStack mb={2}>
              <Icon as={FaUser} color="teal.500" />
              <Heading size="md">Username</Heading>
            </HStack>
            {isEditing ? (
              <Input
                name="username"
                value={formData.username}
                onChange={handleChange}
                borderColor="teal.400"
              />
            ) : (
              <Text fontSize="lg">{user.username}</Text>
            )}
          </Box>

          <Box
            bg="blue.50"
            p={6}
            borderRadius="xl"
            boxShadow="lg"
            transition="all 0.3s"
            _hover={{ transform: 'translateY(-4px)', boxShadow: 'xl' }}
          >
            <HStack mb={2}>
              <Icon as={FaEnvelope} color="blue.500" />
              <Heading size="md">Email</Heading>
            </HStack>
            {isEditing ? (
              <Input
                name="email"
                value={formData.email}
                onChange={handleChange}
                borderColor="blue.400"
              />
            ) : (
              <Text fontSize="lg">{user.email}</Text>
            )}
          </Box>

          <Box
            bg="purple.50"
            p={6}
            borderRadius="xl"
            boxShadow="lg"
            transition="all 0.3s"
            _hover={{ transform: 'translateY(-4px)', boxShadow: 'xl' }}
          >
            <HStack mb={2}>
              <Icon as={FaUserShield} color="purple.500" />
              <Heading size="md">Role</Heading>
            </HStack>
            <Text fontSize="lg">{user.role}</Text>
          </Box>

          <Box
            bg="green.50"
            p={6}
            borderRadius="xl"
            boxShadow="lg"
            transition="all 0.3s"
            _hover={{ transform: 'translateY(-4px)', boxShadow: 'xl' }}
          >
            <HStack mb={2}>
              <Icon as={FaCheckCircle} color="green.500" />
              <Heading size="md">Active</Heading>
            </HStack>
            <Text fontSize="lg">{user.is_active ? 'Yes' : 'No'}</Text>
          </Box>
        </SimpleGrid>

        <VStack mt={6} gap={4} align="stretch">
          {isEditing ? (
            <HStack gap={4}>
              <Button colorScheme="teal" onClick={handleSave}>
                Save
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </HStack>
          ) : (
            <Button colorScheme="teal" onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          )}
        </VStack>
      </Box>
    </Box>
  );
}
