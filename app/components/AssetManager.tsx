'use client'

import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Flex,
  Heading,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Grid,
  GridItem,
  Text,
  Spinner,
  VStack,
  HStack,
  Center,
} from '@chakra-ui/react';

const API_URL = 'http://localhost:8000/api/assets';

// Define the shape of a single asset object from our API
interface Asset {
  id: number;
  title: string;
  description: string;
  file_type: 'image' | 'video' | 'document' | 'other';
  tags: string;
  file: string;
  uploaded_at: string;
}

// Define the shape of the paginated API response
interface ApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Asset[];
}

export default function AssetManager() {
  const { token, logout, user } = useAuth();
  
  // State for data and loading
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start true for initial fetch
  const [error, setError] = useState<string>('');

  // State for search and filter inputs
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [tags, setTags] = useState<string>('');
  const [fileType, setFileType] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  // --- Core Logic (Unchanged) ---
  const fetchAssets = async () => {
    if (!token) return;
    setIsLoading(true);
    setError('');

    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (tags) params.append('tags', tags);
    if (fileType) params.append('file_type', fileType);
    if (dateFrom) params.append('uploaded_at_after', dateFrom);
    if (dateTo) params.append('uploaded_at_before', dateTo);

    try {
      const response = await fetch(`${API_URL}/search/?${params.toString()}`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch assets. Please try again.');
      }
      
      const data: ApiResponse = await response.json();
      setAssets(data.results || []);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [token]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    fetchAssets();
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    setTags('');
    setFileType('');
    setDateFrom('');
    setDateTo('');
    // After clearing, we immediately re-fetch to show the unfiltered list
    fetchAssets();
  };

  // --- JSX with Chakra UI Components ---
  return (
    <Box minH="100vh" bg="gray.50">
      <Flex
        as="header"
        bg="white"
        p={4}
        justifyContent="space-between"
        alignItems="center"
        boxShadow="sm"
        borderBottomWidth="1px"
      >
        <Heading as="h1" size="lg" color="gray.700">
          Digital Asset Manager
        </Heading>
        <HStack spacing={4}>
          {user && <Text color="gray.600">Welcome, {user.username}</Text>}
          <Button colorScheme="red" onClick={logout}>
            Logout
          </Button>
        </HStack>
      </Flex>

      <Flex>
        {/* Sidebar for Filters */}
        <Box
          as="aside"
          w={{ base: '100%', md: '300px' }} // Responsive width
          bg="white"
          p={6}
          borderRightWidth="1px"
          minH="calc(100vh - 72px)" // Full height minus header
        >
          <Heading as="h2" size="md" mb={6}>
            Filters
          </Heading>
          <Box as="form" onSubmit={handleSearch}>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>Keyword Search</FormLabel>
                <Input
                  placeholder="Title, description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Tags</FormLabel>
                <Input
                  placeholder="e.g., landscape, AI"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>File Type</FormLabel>
                <Select
                  placeholder="All Types"
                  value={fileType}
                  onChange={(e) => setFileType(e.target.value)}
                >
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                  <option value="document">Document</option>
                  <option value="other">Other</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Date From</FormLabel>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Date To</FormLabel>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </FormControl>
              <HStack mt={4}>
                <Button type="submit" colorScheme="blue" flex={1}>
                  Apply
                </Button>
                <Button onClick={clearFilters} variant="outline" flex={1}>
                  Clear
                </Button>
              </HStack>
            </VStack>
          </Box>
        </Box>

        {/* Main Content for Assets */}
        <Box as="main" flex={1} p={6}>
          {isLoading ? (
            <Center h="100%">
              <Spinner size="xl" />
            </Center>
          ) : error ? (
            <Center h="100%">
              <Text color="red.500">{error}</Text>
            </Center>
          ) : (
            <>
              {assets.length > 0 ? (
                <Grid
                  templateColumns="repeat(auto-fill, minmax(250px, 1fr))"
                  gap={6}
                >
                  {assets.map(asset => (
                    <GridItem key={asset.id}>
                      <Box
                        bg="white"
                        rounded="lg"
                        shadow="md"
                        overflow="hidden"
                        transition="all 0.2s"
                        _hover={{ transform: 'translateY(-4px)', shadow: 'lg' }}
                      >
                        <Center
                          w="100%"
                          h="180px"
                          bg="gray.100"
                          textTransform="uppercase"
                          fontWeight="bold"
                          color="gray.400"
                        >
                          {asset.file_type}
                        </Center>
                        <Box p={4}>
                          <Heading
                            as="h3"
                            size="sm"
                            isTruncated // Adds ellipsis (...) if text is too long
                            title={asset.title}
                          >
                            {asset.title}
                          </Heading>
                          <Text fontSize="sm" color="gray.500" mt={1}>
                            {new Date(asset.uploaded_at).toLocaleDateString()}
                          </Text>
                        </Box>
                      </Box>
                    </GridItem>
                  ))}
                </Grid>
              ) : (
                <Center h="100%">
                  <Text color="gray.500">
                    No assets found. Try adjusting your filters.
                  </Text>
                </Center>
              )}
            </>
          )}
        </Box>
      </Flex>
    </Box>
  );
}