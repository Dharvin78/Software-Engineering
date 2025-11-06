'use client';

import { useState, useEffect, useRef } from 'react';
import { Box, Stack, Heading, Input, SimpleGrid, Flex, Button, Select, Text, VStack, HStack, Center, Grid, GridItem, Spinner } from '@chakra-ui/react';
import Navbar from '@/components/ui/navbar';
import CreatableSelect from 'react-select/creatable';
import { MultiValue } from 'react-select';
import { useAuth } from '@/contexts/AuthContext';

const dummyUser = { username: 'user1', role: 'user' };

const API_URL = 'http://localhost:8000/api/assets';

interface Asset {
  id: number;
  title: string;
  description: string;
  file_type: 'image' | 'video' | 'document' | 'other';
  tags: string;
  file: string;
  uploaded_at: string;
}

interface ApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Asset[];
}

interface TagOption {
  value: string;
  label: string;
}

const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

export default function HomePage() {
  const { token, logout, user } = useAuth();

  // AssetManager state
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [tags, setTags] = useState<MultiValue<TagOption>>([]);
  const [fileType, setFileType] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [availableUsers, setAvailableUsers] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<TagOption[]>([]);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const isInitialMount = useRef(true);

  const fetchAssets = async (paramsString = '') => {
    if (!token) return;
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/search/?${paramsString}`, {
        headers: { Authorization: `Token ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch assets.');
      const data: ApiResponse = await res.json();
      setAssets(data.results || []);
    } catch (err: any) {
      setError(err.message || 'Unknown error.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFilterOptions = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/filter-options/`, {
        headers: { Authorization: `Token ${token}` },
      });
      const data = await res.json();
      setAvailableTags(data.tags.map((tag: string) => ({ value: tag, label: tag })));
      setAvailableUsers(data.users || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAssets();
    fetchFilterOptions();
  }, [token]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const params = new URLSearchParams();
    if (debouncedSearchTerm) params.append('keyword', debouncedSearchTerm);
    if (selectedUser) params.append('user', selectedUser);
    if (tags.length) params.append('tag', tags.map(t => t.value).join(','));
    if (fileType) params.append('file_type', fileType);
    if (dateFrom) params.append('date_from', dateFrom);
    if (dateTo) params.append('date_to', dateTo);

    fetchAssets(params.toString());
  }, [debouncedSearchTerm, tags, fileType, dateFrom, dateTo, selectedUser]);

  const clearFilters = () => {
    setSearchTerm('');
    setTags([]);
    setFileType('');
    setDateFrom('');
    setDateTo('');
    setSelectedUser('');
  };

  return (
    <Box>
      <Navbar user={dummyUser} />

      <Box p={8}>
        {/* Welcome Section */}
        <Stack direction="column" gap={6} align="center">
          <Heading>Welcome to Asset Management</Heading>
          <Text>Manage and view your assets easily. Use the search bar below to find files quickly.</Text>
        </Stack>

        {/* Filters */}
        <VStack gap={4} align="stretch" mt={6} mb={6}>
          <Input
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            maxW="400px"
          />

          <Grid templateColumns={{ base: '1fr', md: '1.5fr 1.5fr 2fr 1fr auto' }} gap={4}>
            <Box>
    <select
      value={fileType}
      onChange={(e) => setFileType(e.target.value)}
      style={{ width: '100%', padding: '8px', borderRadius: '6px' }}
    >
      <option value="">All Types</option>
      <option value="image">Image</option>
      <option value="video">Video</option>
      <option value="document">Document</option>
      <option value="other">Other</option>
    </select>
  </Box>

  {/* Users */}
  <Box>
    <select
      value={selectedUser}
      onChange={(e) => setSelectedUser(e.target.value)}
      style={{ width: '100%', padding: '8px', borderRadius: '6px' }}
    >
      <option value="">All Users</option>
      {availableUsers.map((u) => (
        <option key={u} value={u}>
          {u}
        </option>
      ))}
    </select>
  </Box>

  {/* Tags */}
  <Box>
    <CreatableSelect
      isMulti
      options={availableTags}
      value={tags}
      onChange={(selected) => setTags(selected)}
    />
  </Box>

  {/* Dates */}
  <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
  <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />

  <Button onClick={clearFilters}>Clear All</Button>
</Grid>
        </VStack>

        {/* Assets Grid */}
        {isLoading ? (
          <Center h="50vh"><Spinner size="xl" /></Center>
        ) : error ? (
          <Center h="50vh"><Text color="red.500">{error}</Text></Center>
        ) : assets.length ? (
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
            {assets.map(asset => (
              <Box key={asset.id} bg="gray.200" height="100px" borderRadius="md" p={2}>
                <Text fontWeight="bold">{asset.title}</Text>
                <Text fontSize="sm">{asset.file_type}</Text>
              </Box>
            ))}
          </SimpleGrid>
        ) : (
          <Center h="50vh"><Text>No assets found. Adjust filters.</Text></Center>
        )}
      </Box>
    </Box>
  );
}
