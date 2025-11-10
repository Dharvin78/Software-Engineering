'use client';

import { Flex, Box, Heading, Container, Text } from '@chakra-ui/react';
import Sidebar from '@/components/ui/sidebar';
import AssetUploadForm from '@/components/ui/AssetUploadForm';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/ui/navbar';
import { useAssets } from '@/contexts/AssetsContext';

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
  const [loadingStats, setLoadingStats] = useState(true);

  const { user, token } = useAuth();
  const { refreshAssets } = useAssets();

  const fetchStorageStats = async () => {
    if (!token) return;
    try {
      const res = await fetch("http://localhost:8000/api/assets/storage_stats/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        console.warn('Storage stats not available:', res.status);
        return; 
    }
      const data = await res.json();
      setStorageStats(data);
    } catch (error) {
      console.error("Error fetching storage stats:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStorageStats();
  }, []);

  const handleAssetTypeSelect = (assetType: keyof typeof ASSET_TYPES) => {
    setActiveAssetType(assetType);
    setIsSidebarOpen(false); // close sidebar on mobile
  };
  if (!user || user.role === 'viewer' || user.role === 'user') {
  return (
    <>
      <Navbar />
      <Box p={8} textAlign="center">
        <Heading size="lg" mb={2}>Access Denied</Heading>
        <Text>You do not have permission to view this page.</Text>
      </Box>
    </>
  );
}

  return (
    <Flex direction="column" minH="100vh" bg="white.100">
      {/* Navbar */}
      <Box position="fixed" top={0} left={0} right={0} zIndex={1100}>
        <Navbar />
      </Box>

      {/* Main content */}
      <Flex flex="1" mt="16">
        {/* Sidebar */}
        <Box
          position={{ base: 'fixed', md: 'static' }}
          top="0"
          left={{ base: isSidebarOpen ? '0' : '-250px', md: '0' }}
          zIndex={1000}
          h="100vh"
          w={{ base: '250px', md: '250px' }}
          bg="white"
          shadow={{ base: 'md', md: 'none' }}
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
            zIndex={900}
            display={{ base: 'block', md: 'none' }}
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Upload Form */}
        <Box flex="1" p={{ base: 6, md: 10 }}>
          {activeAssetType ? (
            <Container maxW="3xl" bg="white" p={8} borderRadius="xl" boxShadow="2xl">
              <Heading as="h1" size="xl" mb={6} borderBottom="1px" borderColor="gray.200" pb={3}>
                {ASSET_TYPES[activeAssetType].title}
              </Heading>

              <AssetUploadForm
                activeAssetType={ASSET_TYPES[activeAssetType]}
                onUploadSuccess={() => {
                  fetchStorageStats();       // update storage stats
                  refreshAssets();           // refresh HomePage assets automatically
                }}
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
    </Flex>
  );
};

export default UploadPage;