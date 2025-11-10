"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  Spinner,
  Container,
  SimpleGrid,
  Input,
  Button,
} from "@chakra-ui/react";
import Navbar from "@/components/ui/navbar";
import { useAuth } from "@/contexts/AuthContext";
import { useAssets } from "@/contexts/AssetsContext";
import { useRouter } from "next/navigation";

interface Asset {
  id: number;
  name: string;
  category: string;
  file_size: string;
  uploaded_at: string;
  description: string;
  file: string;
}

export default function HomePage() {
  const { user, token } = useAuth();
  const { refreshAssets,assetVersion } = useAssets();
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchAssets = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/products/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAssets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchAssets(); 
  }, [token, assetVersion]);

  const handleChange = (id: number, field: keyof Asset, value: string) => {
    setAssets((prev) =>
      prev.map((asset) =>
        asset.id === id ? { ...asset, [field]: value } : asset
      )
    );
  };

  // Update asset locally after editing
const handleSave = async (asset: Asset) => {
  if (!asset || !token) return;
  try {
    const res = await fetch(`http://127.0.0.1:8000/api/products/${asset.id}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: asset.name,
        category: asset.category,
        description: asset.description,
      }),
    });
    if (!res.ok) throw new Error("Update failed");
    const updatedAsset = await res.json();

    setAssets((prev) =>
      prev.map((a) => (a.id === updatedAsset.id ? updatedAsset : a))
    );

    refreshAssets(); 
    setEditingId(null);
  } catch (err) {
    console.error(err);
    alert('Error updating asset.');
  }
};

// Remove asset locally after deletion
const handleDelete = async (id: number) => {
  if (!token) return;
  const confirmed = window.confirm("Are you sure you want to delete this asset?");
  if (!confirmed) return;

  try {
    const res = await fetch(`http://127.0.0.1:8000/api/products/${id}/`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Delete failed");

    // Update local state immediately
    setAssets((prev) => prev.filter((a) => a.id !== id));
    refreshAssets(); 
  } catch (err) {
    console.error(err);
    alert("Error deleting asset.");
  }
};

  if (!user) {
    return (
      <Box h="100vh" display="flex" justifyContent="center" alignItems="center">
        <Spinner size="xl" />
      </Box>
    );
  }

  if (user.role === "viewer" || user.role === "user") {
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

  if (loading) {
    return (
      <Box h="100vh" display="flex" justifyContent="center" alignItems="center">
        <Spinner size="xl" color="blue.500" />
      </Box>
    );
  }

  return (
    <Box minH="100vh">
      <Navbar />
      <Container maxW="6xl" py={10}>
        <VStack gap={6} align="stretch">
          <Box textAlign="center">
            <Heading as="h1" size="xl" mb={2}>
              Asset Dashboard
            </Heading>
          </Box>

          {/* Table Header */}
          <SimpleGrid
            columns={8}
            bg="gray.300"
            p={3}
            rounded="lg"
            fontWeight="bold"
            textAlign="center"
          >
            <Text>ID</Text>
            <Text>Name</Text>
            <Text>Category</Text>
            <Text>Size(Bytes)</Text>
            <Text>Timestamp</Text>
            <Text>Description</Text>
            <Text>Storage Path</Text>
            <Text>Actions</Text>
          </SimpleGrid>

          {/* Asset Rows */}
          <VStack gap={2} align="stretch">
            {assets.length > 0 ? (
              assets.map((asset, index) => (
                <SimpleGrid
                  key={asset.id}
                  columns={8}
                  bg={index % 2 === 0 ? "gray.100" : "gray.200"}
                  p={3}
                  rounded="md"
                  shadow="sm"
                  textAlign="center"
                  alignItems="center"
                >
                  <Text>{asset.id}</Text>

                  {/* Editable Name */}
                  {editingId === asset.id ? (
                    <Input
                      value={asset.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleChange(asset.id, "name", e.target.value)
                      }
                      size="sm"
                    />
                  ) : (
                    <Text>{asset.name}</Text>
                  )}

                  {/* Editable Category */}
                  {editingId === asset.id ? (
                    <select
                      value={asset.category}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        handleChange(asset.id, "category", e.target.value)
                      }
                    >
                      <option value="Image">Image</option>
                      <option value="Video">Video</option>
                      <option value="Document">Document</option>
                    </select>
                  ) : (
                    <Text>{asset.category}</Text>
                  )}

                  <Text>{asset.file_size}</Text>
                  <Text>{new Date(asset.uploaded_at).toLocaleString()}</Text>

                  {/* Editable Description */}
                  {editingId === asset.id ? (
                    <Input
                      value={asset.description}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleChange(asset.id, "description", e.target.value)
                      }
                      size="sm"
                    />
                  ) : (
                    <Text>{asset.description}</Text>
                  )}
                    <Text wordBreak="break-all" maxWidth="100%">
                      {asset.file}
                    </Text>

                    {/* Actions column */}
                  <Box>
                    {user.role === "admin" || user.role === "editor" ? (
                      editingId !== asset.id ? (
                        <Button size="xs" onClick={() => setEditingId(asset.id)}>
                          ⋮
                        </Button>
                      ) : (
                        <VStack gap={1}>
                          <Button
                            size="xs"
                            colorScheme="blue"
                            onClick={() => { handleSave(asset); setEditingId(null); }}
                          >
                            Save
                          </Button>
                          <Button
                            size="xs"
                            colorScheme="red"
                            onClick={() => handleDelete(asset.id)}
                          >
                            Delete
                          </Button>
                          <Button size="xs" onClick={() => setEditingId(null)}>
                            Cancel
                          </Button>
                        </VStack>
                      )
                    ) : null}
                  </Box>

                  </SimpleGrid>
              ))
            ) : (
              <Box textAlign="center" p={4}>
                No Assets found.
              </Box>
            )}
          </VStack>
        </VStack>
      </Container>
    </Box>
  );
}
