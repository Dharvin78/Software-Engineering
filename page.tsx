"use client";

import { useState, useEffect } from "react";
import { Box, Heading, Flex, Text, Button, VStack } from "@chakra-ui/react";

interface Asset {
  name: string;
  file_type: string;
  uploaded_by: string;
  tags: string[];
  uploaded_at: string;
  preview?: string;
}

export default function AssetPreviewPage() {
  const currentUser = { username: "alice", role: "user" }; // or "admin"
  const [assets, setAssets] = useState<Asset[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("uploaded_assets");
    if (stored) {
      const parsed: Asset[] = JSON.parse(stored);
      if (currentUser.role === "admin") setAssets(parsed);
      else setAssets(parsed.filter((a) => a.uploaded_by === currentUser.username));
    }
  }, []);

  const saveAssets = (updatedAssets: Asset[]) => {
    setAssets(updatedAssets);
    localStorage.setItem("uploaded_assets", JSON.stringify(updatedAssets));
  };

  const handleDelete = (idx: number) => {
    if (!confirm("Delete this asset?")) return;
    const updated = assets.filter((_, i) => i !== idx);
    saveAssets(updated);
  };

  const handleDownload = (asset: Asset) => {
    if (!asset.preview) return;
    const link = document.createElement("a");
    link.href = asset.preview;
    link.download = asset.name;
    link.click();
  };

  return (
    <Box p={8}>
      <Heading mb={4}>My Asset Previews</Heading>

      <Flex wrap="wrap" gap="1rem">
        {assets.length > 0 ? (
          assets.map((asset, idx) => (
            <Box
              key={idx}
              border="1px solid #ccc"
              borderRadius="md"
              p={4}
              width="200px"
              textAlign="center"
            >
              <strong>{asset.name}</strong>
              <p>Type: {asset.file_type}</p>
              <p>Uploaded by: {asset.uploaded_by}</p>
              <p>Uploaded at: {new Date(asset.uploaded_at).toLocaleDateString()}</p>

              {asset.file_type === "image" && asset.preview && (
                <img src={asset.preview} alt={asset.name} style={{ width: "100%", marginTop: "0.5rem" }} />
              )}

              {asset.file_type === "video" && asset.preview && (
                <video src={asset.preview} controls style={{ width: "100%", marginTop: "0.5rem" }} />
              )}

              {!asset.preview && (
                <Text mt={2} fontSize="sm" color="gray.500">
                  No preview available
                </Text>
              )}

              <VStack mt={2} gap={1}>
                <Button size="sm" colorScheme="blue" onClick={() => handleDownload(asset)}>
                  Download
                </Button>
                <Button size="sm" colorScheme="red" onClick={() => handleDelete(idx)}>
                  Delete
                </Button>
              </VStack>
            </Box>
          ))
        ) : (
          <Text>No assets found</Text>
        )}
      </Flex>
    </Box>
  );
}
