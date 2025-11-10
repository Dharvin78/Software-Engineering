// pages/upload.tsx
import { Flex, Box, Heading, Container, IconButton } from '@chakra-ui/react';
import Sidebar from '../components/Sidebar';
import AssetUploadForm from '../components/AssetUploadForm';
import HamburgerIcon from '../components/HamburgerIcon';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

// Define the static asset types (from your original JS)
const ASSET_TYPES = {
    'image': { containerId: 'image-form-container', title: 'Upload Image', mime: 'image/*', defaultCategory: 'Image' },
    'pdf': { containerId: 'pdf-form-container', title: 'Upload PDF', mime: 'application/pdf', defaultCategory: 'PDF' },
    'video': { containerId: 'video-form-container', title: 'Upload Video', mime: 'video/*', defaultCategory: 'Video' },
    'document': { containerId: 'document-form-container', title: 'Upload Document', mime: 'application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document', defaultCategory: 'Document' },
};

const UploadPage = () => {
  const [activeAssetType, setActiveAssetType] = useState<keyof typeof ASSET_TYPES | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [storageStats, setStorageStats] = useState({
    total_size_formatted: '0MB',
    storage_limit_formatted: '250GB',
    usage_percentage: 0
  });
  const { authApi } = useAuth();

  // Fetch storage statistics
  const fetchStorageStats = async () => {
    try {
      const response = await authApi.get('/assets/storage_stats/');
      setStorageStats(response.data);
    } catch (error) {
      console.error('Error fetching storage stats:', error);
    }
  };

  useEffect(() => {
    fetchStorageStats();
  }, []);

  const handleAssetTypeSelect = (assetType: keyof typeof ASSET_TYPES) => {
    setActiveAssetType(assetType);
    setIsSidebarOpen(false); // Close sidebar on mobile after selection
  };

  return (
    <Flex minH="100vh" bg="gray.100" position="relative">
      {/* Hamburger Menu Button */}
      <IconButton
        aria-label="Toggle sidebar"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        position="fixed"
        top={4}
        left={4}
        zIndex={1001}
        bg="white"
        color="gray.600"
        _hover={{ bg: 'gray.100', color: 'gray.800' }}
        boxShadow="lg"
        size="md"
      >
        <HamburgerIcon />
      </IconButton>

      {/* Sidebar Component (Handles the left navigation) */}
      <Box
        position={{ base: 'fixed', md: 'static' }}
        left={{ base: isSidebarOpen ? '0' : '-250px', md: '0' }}
        top="0"
        zIndex={1000}
        transition="left 0.3s ease"
        display={{ base: isSidebarOpen ? 'block' : 'none', md: 'block' }}
      >
        <Sidebar
          ASSET_TYPES={ASSET_TYPES}
          activeAssetType={activeAssetType}
          setActiveAssetType={handleAssetTypeSelect}
          storageStats={storageStats}
        />
      </Box>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <Box
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="blackAlpha.500"
          zIndex={999}
          display={{ base: 'block', md: 'none' }}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Main Content Area */}
      <Box flex="1" p={{ base: 6, md: 10 }} pt={{ base: 16, md: 10 }} ml={{ base: 0, md: isSidebarOpen ? '0' : '0' }}>
        {activeAssetType ? (
          <Container maxW="3xl" bg="white" p={8} borderRadius="xl" boxShadow="2xl">
            <Heading as="h1" size="xl" mb={6} borderBottom="1px" borderColor="gray.200" pb={3}>
                {ASSET_TYPES[activeAssetType].title}
            </Heading>

            {/* Render the core form component, passing the current active type */}
            <AssetUploadForm 
              activeAssetType={ASSET_TYPES[activeAssetType]} 
              onUploadSuccess={fetchStorageStats}
            />
          </Container>
        ) : (
          <Container maxW="3xl" bg="white" p={8} borderRadius="xl" boxShadow="2xl">
            <Heading as="h1" size="xl" mb={6} textAlign="center" color="gray.600">
              Welcome to Asset Manager
            </Heading>
            <Box textAlign="center" color="gray.500" fontSize="lg">
              Click the menu button and select an upload option to get started.
            </Box>
          </Container>
        )}
      </Box>
    </Flex>
  );
};

// Add Auth Guard (to ensure only logged-in users see this page)
// UploadPage.getLayout = page => <AuthGuard>{page}</AuthGuard>; 

export default UploadPage;
