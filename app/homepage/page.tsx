"use client";

import { Box, Stack, Heading, Input, SimpleGrid } from "@chakra-ui/react";
import Navbar from "@/components/ui/navbar";

const dummyUser = { username: "admin1", role: "admin" };

export default function HomePage() {
  return (
    <Box>
      <Navbar user={dummyUser} />

      <Box p={8}>
        <Stack direction="column" gap={6} align="center">
          <Heading>Welcome to Asset Management</Heading>
          <p>Manage and view your assets easily. Use the search bar below to find files quickly.</p>
          <Input placeholder="Search files..." maxW="400px" />
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={4} w="full" mt={4}>
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <Box key={i} bg="gray.200" height="100px" borderRadius="md" />
              ))}
          </SimpleGrid>
        </Stack>
      </Box>
    </Box>
  );
}
