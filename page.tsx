"use client";

import { useState, useEffect } from "react";
import { Box, Heading, Flex, Text, Button, VStack } from "@chakra-ui/react";
import FilterBar from "@/components/ui/FilterBar";

interface Filters {
  file_type: string;
  uploaded_by: string;
  start_date: string;
  end_date: string;
  tag: string;
}

interface Asset {
  name: string;
  file_type: string;
  uploaded_by: string;
  tags: string[];
  uploaded_at: string;
  preview?: string;
}

export default function AssetPreviewPage() {
  // Simulate logged-in user
  const currentUser = { username: "alice", role: "user" }; 
  // For admin, set role: "admin"

  const [assets, setAssets] = useState<Asset[]>([]);
  const [filters, setFilters] = useState<Filters>({
    file_type: "",
    uploaded_by: currentUser.role === "admin" ? "" : currentUser.username,
    start_date: "",
    end_date: "",
    tag: "",
  });

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

  const applyFilters = () => {
    const stored = localStorage.getItem("uploaded_assets");
    if (!stored) return;
    let allAssets: Asset[] = JSON.parse(stored);

    if (currentUser.role !== "admin") {
      allAssets = allAssets.filter((a) => a.uploaded_by === currentUser.username);
    } else if (filters.uploaded_by) {
      allAssets = allAssets.filter((a) => a.uploaded_by === filters.uploaded_by);
    }

    if (filters.file_type) allAssets = allAssets.filter((a) => a.file_type === filters.file_type);
    if (filters.tag) allAssets = allAssets.filter((a) => a.tags.includes(filters.tag));
    if (filters.start_date)
      allAssets = allAssets.filter((a) => new Date(a.uploaded_at) >= new Date(filters.start_date));
    if (filters.end_date)
      allAssets = allAssets.filter((a) => new Date(a.uploaded_at) <= new Date(filters.end_date));

    setAssets(allAssets);
  };

  const clearFilters = () => {
    setFilters({
      file_type: "",
      uploaded_by: currentUser.role === "admin" ? "" : currentUser.username,
      start_date: "",
      end_date: "",
      tag: "",
    });

    const stored = localStorage.getItem("uploaded_assets");
    if (!stored) return;
    const allAssets: Asset[] = JSON.parse(stored);
    if (currentUser.role === "admin") setAssets(allAssets);
    else setAssets(allAssets.filter((a) => a.uploaded_by === currentUser.username));
  };

  const handleDelete = (idx: number) => {
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
      <Heading mb={4}>My Assets Preview</Heading>

      <FilterBar
        filters={filters}
        setFilters={setFilters}
        onApply={applyFilters}
        onClear={clearFilters}
        showUploadedBy={currentUser.role === "admin"} // only admin can filter by uploaded_by
      />

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
                <img
                  src={asset.preview}
                  alt={asset.name}
                  style={{ width: "100%", marginTop: "0.5rem" }}
                />
              )}
              {asset.file_type === "video" && asset.preview && (
                <video
                  src={asset.preview}
                  controls
                  style={{ width: "100%", marginTop: "0.5rem" }}
                />
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
