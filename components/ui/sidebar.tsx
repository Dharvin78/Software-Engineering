'use client';

import React from 'react';
import { Box, VStack, Button, Heading } from '@chakra-ui/react';
import StorageProgressBar from '@/components/ui/StorageProgressBar';

interface SidebarProps {
  ASSET_TYPES?: any;
  activeAssetType?: any;
  setActiveAssetType?: (assetType: any) => void;
  storageStats?: {
    total_size_formatted: string;
    storage_limit_formatted: string;
    usage_percentage: number;
  };
}

const Sidebar: React.FC<SidebarProps> = ({ ASSET_TYPES, activeAssetType, setActiveAssetType, storageStats }) => {
  return (
    <Box 
      w="250px"
      bg="#E5E5E5" 
      color="gray.800" 
      p={6}
      pt={16}
      minH="100vh"
      position="relative"
    >
      <Heading as="h2" size="lg" mb={8} color="gray.800">
        Asset Manager
      </Heading>
      
      <VStack gap={3} alignItems="stretch">
        {ASSET_TYPES && Object.keys(ASSET_TYPES).map((key) => (
          <Button
            key={key}
            onClick={() => setActiveAssetType && setActiveAssetType(key)}
            bg={activeAssetType === key ? 'gray.700' : 'gray.400'}
            color="white"
            _hover={{ bg: 'gray.600' }}
            justifyContent="flex-start"
            fontWeight={activeAssetType === key ? 'bold' : 'normal'}
          >
            {ASSET_TYPES[key].title}
          </Button>
        ))}
      </VStack>

      {/* Storage Progress Bar */}
      {storageStats && (
        <Box mt={8}>
          <StorageProgressBar
            usedSize={storageStats.total_size_formatted}
            totalSize={storageStats.storage_limit_formatted}
            percentage={storageStats.usage_percentage}
          />
        </Box>
      )}
    </Box>
  );
};

export default Sidebar;