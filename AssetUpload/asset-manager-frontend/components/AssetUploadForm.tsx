import { Box, Button, Text, Input, Flex } from '@chakra-ui/react';
import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface ActiveAssetType {
  defaultCategory?: string;
  mime?: string;
}

interface AssetUploadFormProps {
  activeAssetType?: ActiveAssetType;
  onUploadSuccess?: () => void;
}

const AssetUploadForm: React.FC<AssetUploadFormProps> = ({ activeAssetType, onUploadSuccess }) => {
  const { authApi } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [assetName, setAssetName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(activeAssetType?.defaultCategory || '');
  const [tags, setTags] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Update category when activeAssetType changes
  useEffect(() => {
    setCategory(activeAssetType?.defaultCategory || '');
  }, [activeAssetType]);

  // Example: validate file type (customize as needed)
  const isFileTypeValid = (file: File) => true;
  const formatBytes = (bytes: number) => `${(bytes / 1024).toFixed(2)} KB`;
  
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file && isFileTypeValid(file)) setSelectedFile(file);
  };

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (isFileTypeValid(file)) {
        setSelectedFile(file);
      }
    }
  };

  const showToast = (message: string) => {
    // lightweight fallback if Chakra useToast is not available in this build
    // replace with useToast() if you add the proper Chakra types
    // eslint-disable-next-line no-alert
    alert(message);
  };

  const handleUpload = async () => {
    setIsLoading(true);
    if (!selectedFile || !assetName) {
      showToast('Please select a file and enter a name.');
      setIsLoading(false);
      return;
    }
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('name', assetName);
    formData.append('category', category);
    formData.append('description', description);
    formData.append('tags', tags);
    try {
            await authApi.post('/assets/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showToast('Upload successful!');
      setSelectedFile(null);
      setAssetName('');
      setDescription('');
      setTags('');
      
      // Call the callback to refresh storage stats
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error) {
      showToast('Upload failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      {/* File Upload Area with Drag and Drop */}
      <Box
        p={10}
        border="2px"
        borderStyle="dashed"
        borderRadius="xl"
        textAlign="center"
        borderColor={isDragging ? 'blue.400' : selectedFile ? 'green.300' : 'gray.300'}
        bg={isDragging ? 'blue.50' : selectedFile ? 'green.50' : 'gray.50'}
        transition="all 0.2s ease"
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        cursor="pointer"
      >
        <input id="file-input-hidden" type="file" onChange={onFileChange} style={{ display: 'none' }} />
        {selectedFile ? (
          <Box>
            <Text id="file-name" mt={2} fontWeight="medium">{selectedFile.name}</Text>
            <Text id="file-size" fontSize="sm" color="gray.500">{formatBytes(selectedFile.size)}</Text>
          </Box>
        ) : (
          <Box>
            <Text color="gray.500" fontWeight="medium">
              {isDragging ? 'Drop file here...' : 'Drag & drop a file here or click Browse'}
            </Text>
          </Box>
        )}
        <Button
          mt={4}
          onClick={() => document.getElementById('file-input-hidden')?.click()}
          size="sm"
        >
          Browse Files
        </Button>
      </Box>

      {/* Metadata Form */}
      <Box mt={8}>
        <Text fontWeight="bold">Asset Name</Text>
        <Input placeholder="Enter a descriptive name" value={assetName} onChange={(e) => setAssetName(e.target.value)} />
      </Box>
      <Box mt={4}>
        <Text fontWeight="bold">Description</Text>
        <Input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
      </Box>
      <Box mt={4}>
        <Text fontWeight="bold">Category</Text>
        <select 
          value={category} 
          onChange={(e) => setCategory(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            borderRadius: '6px',
            border: '1px solid #CBD5E0',
            fontSize: '16px'
          }}
        >
          <option value="Image">Image</option>
          <option value="PDF">PDF</option>
          <option value="Video">Video</option>
          <option value="Document">Document</option>
        </select>
      </Box>
      <Box mt={4}>
        <Text fontWeight="bold">Tags</Text>
        <Input placeholder="Enter tags (comma-separated)" value={tags} onChange={(e) => setTags(e.target.value)} />
      </Box>

      <Flex justify="flex-end" pt={8} gap={4}>
        <Button variant="ghost" onClick={() => setSelectedFile(null)}>Cancel</Button>
        <Button
          bg="blue.500"
          color="white"
          _hover={{ bg: 'blue.700' }}
          onClick={handleUpload}
          disabled={isLoading || !selectedFile || !assetName}
        >
          {isLoading ? 'Uploading...' : 'Upload'}
        </Button>
      </Flex>
    </Box>
  );
};

export default AssetUploadForm;
