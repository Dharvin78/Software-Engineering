'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Stack,
  Heading,
  Input,
  SimpleGrid,
  Button,
  Text,
  VStack,
  Center,
  Grid,
  Spinner,
  Image,
} from '@chakra-ui/react';
import Navbar from '@/components/ui/navbar';
import CreatableSelect from 'react-select/creatable';
import { MultiValue } from 'react-select';
import { useAuth } from '@/contexts/AuthContext';
import { useAssets } from '@/contexts/AssetsContext';

const API_URL = 'http://localhost:8000/api/assets';

interface Asset {
  id: number;
  name: string;
  description: string;
  category: string;
  tags: string;
  file: string;
  file_size: number;
  uploaded_at: string;
  uploaded_by: { id: number; username: string; email: string; is_staff: boolean } | null;
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

interface UserOption {
  id: number;
  username: string;
  role: string;
}

// Debounce hook
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

export default function HomePage() {
  const { user, token } = useAuth();
  const { assetVersion } = useAssets();

  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [tags, setTags] = useState<MultiValue<TagOption>>([]);
  const [category, setCategory] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [availableUsers, setAvailableUsers] = useState<UserOption[]>([]);
  const [availableTags, setAvailableTags] = useState<TagOption[]>([]);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const isInitialMount = useRef(true);
  const [reloadFlag, setReloadFlag] = useState(false);

  const [previewFile, setPreviewFile] = useState<string | null>(null);
  const [previewMime, setPreviewMime] = useState<string | null>(null);

  // Helper to generate URL for grid previews
  const getFileUrl = (filePath: string) => {
    if (!filePath) return '';
    if (filePath.startsWith('http') || filePath.startsWith('https')) return filePath;
    const mediaUrl = '/media/';
    const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
    return `http://localhost:8000${mediaUrl}${cleanPath}`;
  };

  // Fetch assets
  const fetchAssets = async () => {
    if (!token) return;

    setIsLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      if (selectedUser) params.set('user', selectedUser);
      if (tags.length) params.set('tag', tags.map((t) => t.value).join(','));
      if (category && category !== 'all') params.set('category', category);
      if (dateFrom) params.set('date_from', dateFrom);
      if (dateTo) params.set('date_to', dateTo);
      if (debouncedSearchTerm) params.set('keyword', debouncedSearchTerm);

      const res = await fetch(`${API_URL}/search/?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to fetch assets.');

      const data = await res.json();
      setAssets(data.results || []);
    } catch (err: any) {
      setError(err.message || 'Unknown error.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch tags & users
  const fetchFilterOptions = async () => {
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/filter-options/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      setAvailableTags(data.tag.map((tag: string) => ({ value: tag, label: tag })));

      if (user?.role === 'admin' || user?.role === 'editor') setAvailableUsers(data.users || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Initial load
  useEffect(() => {
    if (!token) return; 
    fetchAssets();
    fetchFilterOptions();
  }, [token, reloadFlag, assetVersion]);

  // Refetch on filter change
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    fetchAssets();
  }, [debouncedSearchTerm, tags, category, dateFrom, dateTo, selectedUser]);

  const clearFilters = () => {
    setSearchTerm('');
    setTags([]);
    setCategory('');
    setDateFrom('');
    setDateTo('');
    if (user?.role === 'admin' || user?.role === 'editor') setSelectedUser('');
  };

  // Render Download / View buttons
  const renderPreviewButtons = (asset: Asset) => {
    const ext = asset.file.split('.').pop()?.toLowerCase();
    if (!ext) return null;

    const viewableExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov', 'avi', 'mkv', 'pdf', 'txt', 'doc', 'docx'];
    const fileUrl = getFileUrl(asset.file);

    const handleDownload = async () => {
      try {
        const res = await fetch(`${API_URL}/${asset.id}/download/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to download file');
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = asset.name;
        a.click();
        URL.revokeObjectURL(url);
      } catch (err: any) {
        console.error(err.message);
      }
    };

    const handleView = async (asset: Asset) => {
      const ext = asset.file.split('.').pop()?.toLowerCase();
      const fileUrl = getFileUrl(asset.file);

      if (['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(ext!)) {
        const previewUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`;
        setPreviewFile(previewUrl);
        setPreviewMime('office');
        return;
      }
      try {
        const res = await fetch(`${API_URL}/${asset.id}/preview/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Failed to fetch file');

        const blob = await res.blob();
        const mime = res.headers.get('Content-Type') || 'application/octet-stream';
        const url = URL.createObjectURL(new Blob([blob], { type: mime }));

        setPreviewFile(url);
        setPreviewMime(mime);
      } catch (err: any) {
        console.error(err.message);
      }
    };

    return (
      <Box mt={2} display="flex" gap={2} alignItems="center">
        <Button colorScheme="purple" onClick={handleDownload}>
          ⬇ Download
        </Button>
        {viewableExts.includes(ext) && (
          <Button colorScheme="blue" variant="ghost" onClick={() => handleView(asset)}>
            👁 View
          </Button>
        )}
      </Box>
    );
  };

  return (
    <Box>
      <Navbar />
      <Box p={8}>
        <Stack direction="column" gap={6} align="center">
          <Heading>Welcome to Asset Management</Heading>
          <Text>Manage and view your uploaded assets easily.</Text>
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
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
              }}
              style={{ width: '100%', padding: '8px', borderRadius: '6px' }}
            >
              <option value="all">All Categories</option>
              <option value="Image">Image</option>
              <option value="Video">Video</option>
              <option value="Document">Document</option>
              <option value="PDF">PDF</option>
              <option value="Other">Other</option>
            </select>

            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '6px' }}
            >
              <option value="">All Users</option>
              {availableUsers.map((u) => (
                <option key={u.id} value={u.username}>
                  {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                </option>
              ))}
            </select>

            <CreatableSelect
              isMulti
              options={availableTags}
              value={tags}
              onChange={(selected) => setTags(selected)}
            />

            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            <Button onClick={clearFilters}>Clear All</Button>
            <Button colorScheme="teal" onClick={fetchAssets}>
              Refresh Assets
            </Button>
          </Grid>
        </VStack>

        {/* Assets Grid */}
        {isLoading ? (
          <Center h="50vh">
            <Spinner size="xl" />
          </Center>
        ) : error ? (
          <Center h="50vh">
            <Text color="red.500">{error}</Text>
          </Center>
        ) : assets.length ? (
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={6}>
            {assets.map((asset) => {
              const fileUrl = getFileUrl(asset.file);
              const ext = asset.file.split('.').pop()?.toLowerCase();
              return (
                <Box key={asset.id} bg="gray.100" borderRadius="lg" p={4} shadow="md">
                  <Text fontWeight="bold" mb={2}>{asset.name}</Text>
                  {asset.uploaded_by && (
                    <Text fontSize="sm" color="gray.600" mb={1}>
                      Uploaded by: {asset.uploaded_by.username} ({asset.uploaded_by.email})
                    </Text>
                  )}

                  {/* Images */}
                  {['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext!) && (
                    <Image src={fileUrl} h="200px" w="100%" objectFit="cover" mb={2} alt={asset.name} />
                  )}

                  {/* Videos */}
                  {['mp4', 'mov', 'avi', 'mkv'].includes(ext!) && (
                    <video
                      src={fileUrl}
                      controls
                      style={{ width: '100%', height: '200px', borderRadius: '8px', marginBottom: '8px' }}
                    />
                  )}

                  {renderPreviewButtons(asset)}

                  <Text fontSize="sm" mt={2}>{asset.description || 'No description'}</Text>
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    Uploaded: {new Date(asset.uploaded_at).toLocaleString()}
                  </Text>

                </Box>
              );
            })}
          </SimpleGrid>
        ) : (
          <Center h="50vh">
            <Text>No assets found. Adjust filters.</Text>
          </Center>
        )}

        {/* Fullscreen Preview Overlay */}
        {previewFile && previewMime && (
          <Box
            position="fixed"
            top={0}
            left={0}
            w="100vw"
            h="100vh"
            bg="rgba(0,0,0,0.7)"
            display="flex"
            justifyContent="center"
            alignItems="center"
            zIndex={9999}
            onClick={() => {
              if (previewMime !== 'office')URL.revokeObjectURL(previewFile);
              setPreviewFile(null);
              setPreviewMime(null);
            }}
          >
            <Box
              bg="white"
              p={4}
              borderRadius="md"
              w="95vw"
              h="95vh"
              overflow="auto"
              display="flex"
              onClick={(e) => e.stopPropagation()}
            >
              <Button mb={2} size="sm" alignSelf="flex-end"   onClick={() => {
                if (previewMime !== 'office') URL.revokeObjectURL(previewFile);
                setPreviewFile(null);
                setPreviewMime(null);
              }}>
                Close
              </Button>
              <Box flex="1" overflow="auto" display="flex" justifyContent="center" alignItems="center">
              {previewMime === 'office' && (
                <iframe src={previewFile} width="100%" height="100%" style={{ border: 'none' }} />
              )}

              {previewMime && previewMime.startsWith('image/') && (
                <Image src={previewFile} maxW="100%" maxH="100%" objectFit="contain" />
              )}

              {previewMime && previewMime.startsWith('video/') && (
                <video src={previewFile} controls style={{ maxWidth: '100%', maxHeight: '100%' }} />
              )}

              {previewMime === 'application/pdf' && (
                <iframe src={previewFile} width="100%" height="100%" style={{ border: 'none' }} />
              )}

              {previewMime &&
                ['text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
                  .includes(previewMime) && (
                  <iframe src={previewFile} width="100%" height="100%" style={{ border: 'none' }} />
                )}

              {previewMime &&
                !previewMime.startsWith('image/') &&
                !previewMime.startsWith('video/') &&
                previewMime !== 'application/pdf' &&
                !['text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
                  .includes(previewMime) && (
                  <Text fontSize="2xl" textAlign="center" overflow="auto">
                    Preview not available
                  </Text>
                )}
            </Box>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
