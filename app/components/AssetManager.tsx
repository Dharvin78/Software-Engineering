'use client'

import { useState, useEffect, FormEvent, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import CreatableSelect from 'react-select/creatable';
import { MultiValue } from 'react-select';

import {
  Box,
  Flex,
  Heading,
  Button,
  FormControl,
  Input,
  Select,
  Grid,
  GridItem,
  Text,
  Spinner,
  VStack,
  HStack,
  Center,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  IconButton,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useDisclosure,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';

const FilterIcon = (props: any) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"
    />
  </Icon>
);

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

const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
};

export default function AssetManager() {
  const { token, logout, user } = useAuth();
  
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [tags, setTags] = useState<MultiValue<TagOption>>([]);
  const [fileType, setFileType] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [displayDateFilter, setDisplayDateFilter] = useState('Date');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [availableUsers, setAvailableUsers] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<TagOption[]>([]);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const isInitialMount = useRef(true);

  const fetchAssets = async (paramsString = '') => {
    if (!token) return;
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/search/?${paramsString}`, {
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

  const fetchFilterOptions = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/filter-options/`, {
        headers: { 'Authorization': `Token ${token}` }
      });
      const data = await response.json();
      const tagOptions = data.tags.map((tag: string) => ({ value: tag, label: tag }));
      setAvailableTags(tagOptions);
      setAvailableUsers(data.users || []);
    } catch (err) {
      console.error("Failed to fetch filter options", err);
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
    if (tags && tags.length > 0) {
      const tagString = tags.map((tag: TagOption) => tag.value).join(',');
      params.append('tag', tagString);
    }
    if (fileType) params.append('file_type', fileType);
    if (dateFrom) params.append('date_from', dateFrom);
    if (dateTo) params.append('date_to', dateTo);
    
    fetchAssets(params.toString());
  }, [debouncedSearchTerm, tags, fileType, dateFrom, dateTo, selectedUser, token]);

  const clearFilters = () => {
    setSearchTerm('');
    setTags([]);
    setFileType('');
    setDateFrom('');
    setDateTo('');
    setDisplayDateFilter('Date');
    setSelectedUser('');
  };

  const DateFilterMenu = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [tempDateFrom, setTempDateFrom] = useState(dateFrom);
    const [tempDateTo, setTempDateTo] = useState(dateTo);
    const handlePreset = (preset: string) => {
      const today = new Date();
      let fromDate = new Date();
      switch (preset) {
        case 'today': fromDate.setDate(today.getDate()); setDisplayDateFilter('Today'); break;
        case 'last7': fromDate.setDate(today.getDate() - 7); setDisplayDateFilter('Last 7 days'); break;
        case 'last30': fromDate.setDate(today.getDate() - 30); setDisplayDateFilter('Last 30 days'); break;
        default: return;
      }
      setDateFrom(formatDate(fromDate));
      setDateTo(formatDate(today));
      onClose();
    };
    const handleCustomApply = () => {
      setDateFrom(tempDateFrom);
      setDateTo(tempDateTo);
      if (tempDateFrom || tempDateTo) {
        setDisplayDateFilter(`${tempDateFrom || '...'} to ${tempDateTo || '...'}`);
      } else {
        setDisplayDateFilter('Date');
      }
      onClose();
    };
    return (
      <Menu isOpen={isOpen} onClose={onClose} closeOnSelect={false}>
        <MenuButton as={Button} onClick={onOpen} bg="white" w="100%">{displayDateFilter}</MenuButton>
        <MenuList>
          <MenuItem onClick={() => handlePreset('today')}>Today</MenuItem>
          <MenuItem onClick={() => handlePreset('last7')}>Last 7 days</MenuItem>
          <MenuItem onClick={() => handlePreset('last30')}>Last 30 days</MenuItem>
          <MenuDivider />
          <Box p={2}>
            <VStack>
              <FormControl><Input type="date" placeholder="After" value={tempDateFrom} onChange={(e) => setTempDateFrom(e.target.value)} /></FormControl>
              <FormControl><Input type="date" placeholder="Before" value={tempDateTo} onChange={(e) => setTempDateTo(e.target.value)} /></FormControl>
              <HStack w="100%"><Button variant="ghost" onClick={onClose} flex={1}>Cancel</Button><Button colorScheme="blue" onClick={handleCustomApply} flex={1}>Apply</Button></HStack>
            </VStack>
          </Box>
        </MenuList>
      </Menu>
    );
  };

  return (
    <Box minH="100vh" bg="gray.50">
      <Flex as="header" bg="white" p={4} justifyContent="space-between" alignItems="center" boxShadow="sm" borderBottomWidth="1px">
        <Heading as="h1" size="lg" color="gray.700">Digital Asset Manager</Heading>
        <HStack spacing={4}>{user && <Text color="gray.600">Welcome, {user.username}</Text>}<Button colorScheme="red" onClick={logout}>Logout</Button></HStack>
      </Flex>

      <Box as="main" p={6}>
        <VStack spacing={4} align="stretch" mb={8} maxW="1200px" mx="auto">
          <InputGroup size="lg" bg="white" rounded="md" shadow="sm">
            <InputLeftElement pointerEvents="none"><SearchIcon color="gray.400" /></InputLeftElement>
            <Input placeholder="Search assets..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </InputGroup>

          <Grid
            templateColumns={{ base: '1fr', md: '1.5fr 1.5fr 2.5fr 1.5fr auto' }}
            gap={4}
          >
            <FormControl>
              <Select placeholder="All Types" value={fileType} onChange={(e) => setFileType(e.target.value)} bg="white">
                <option value="image">Image</option><option value="video">Video</option><option value="document">Document</option><option value="other">Other</option>
              </Select>
            </FormControl>
            
            <FormControl>
              <Select placeholder="All Users" value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} bg="white">
                {availableUsers.map(username => (
                  <option key={username} value={username}>{username}</option>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <CreatableSelect isMulti options={availableTags} value={tags} onChange={(selectedOptions: MultiValue<TagOption>) => setTags(selectedOptions)} placeholder="Tags" styles={{ control: (base) => ({ ...base, background: 'white', borderColor: '#E2E8F0', minHeight: '40px' }), menu: (base) => ({ ...base, zIndex: 2 }) }} />
            </FormControl>

            <FormControl>
              <DateFilterMenu />
            </FormControl>
            
            <Button onClick={clearFilters} variant="outline">Clear All</Button>
          </Grid>
        </VStack>

        {isLoading ? ( <Center h="50vh"><Spinner size="xl" /></Center> ) : error ? ( <Center h="50vh"><Text color="red.500">{error}</Text></Center> ) : (
            <>{assets.length > 0 ? ( <Grid templateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={6}>
                  {assets.map(asset => ( <GridItem key={asset.id}> <Box bg="white" rounded="lg" shadow="md" overflow="hidden" transition="all 0.2s" _hover={{ transform: 'translateY(-4px)', shadow: 'lg' }}>
                        <Center w="100%" h="180px" bg="gray.100" textTransform="uppercase" fontWeight="bold" color="gray.400">{asset.file_type}</Center>
                        <Box p={4}><Heading as="h3" size="sm" isTruncated title={asset.title}>{asset.title}</Heading><Text fontSize="sm" color="gray.500" mt={1}>{new Date(asset.uploaded_at).toLocaleDateString()}</Text></Box>
                      </Box> </GridItem>
                  ))}</Grid>
              ) : ( <Center h="50vh"> <Text color="gray.500"> No assets found. Try adjusting your filters. </Text> </Center>
              )}</>
        )}
      </Box>
    </Box>
  );
}