import { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Flex,
  Text,
  Button,
  VStack,
  Spinner, // For loading state
} from "@chakra-ui/react";
import FilterBar from "../components/ui/FilterBar"; // Make sure this path is correct
import { useAuth } from "../contexts/AuthContext"; // Import the useAuth hook
import { useRouter } from "next/router";

// --- Interfaces (from your original file) ---
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

// --- Mock Data (for testing) ---
// Since we haven't built the asset API backend, 
// we'll use mock data in localStorage.
const MOCK_ASSETS: Asset[] = [
  {
    name: "AdminReport.pdf",
    file_type: "pdf",
    uploaded_by: "admin", // Use the username of your superuser
    tags: ["admin", "report"],
    uploaded_at: "2025-11-01T10:00:00Z",
  },
  {
    name: "UserImage.jpg",
    file_type: "image",
    uploaded_by: "testuser", // A regular user
    tags: ["photo", "test"],
    uploaded_at: "2025-11-03T14:30:00Z",
    preview: "https://via.placeholder.com/150",
  },
  {
    name: "SharedVideo.mp4",
    file_type: "video",
    uploaded_by: "admin",
    tags: ["video", "promo"],
    uploaded_at: "2025-11-04T09:15:00Z",
    preview: "https://www.w3schools.com/html/mov_bbb.mp4",
  },
];

// --- The Page Component ---
export default function AssetPreviewPage() {
  // 1. Get auth state
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  // 2. Component State
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filters, setFilters] = useState<Filters>({
    file_type: "",
    uploaded_by: "", // Will be set by auth
    start_date: "",
    end_date: "",
    tag: "",
  });

  // 3. Auth & Data Loading Effect
  useEffect(() => {
    // If auth is not loading and there's no user, redirect to login
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    // If the user is loaded
    if (user) {
      // Set the default filter state based on the user's role
      setFilters((prev) => ({
        ...prev,
        uploaded_by: user.role === "admin" ? "" : user.username,
      }));

      // --- TODO: Fetch assets from your Django API ---
      // In a real app, you would make an API call here.
      // For now, we'll load mock data from localStorage.
      
      const stored = localStorage.getItem("uploaded_assets");
      if (!stored) {
        // If no assets, load the mock ones
        localStorage.setItem("uploaded_assets", JSON.stringify(MOCK_ASSETS));
      }
      
      const allAssets: Asset[] = JSON.parse(localStorage.getItem("uploaded_assets") || "[]");

      // Filter assets based on role
      if (user.role === "admin") {
        setAssets(allAssets); // Admin sees all
      } else {
        setAssets(allAssets.filter((a) => a.uploaded_by === user.username)); // User sees only their own
      }
    }
  }, [user, loading, router]); // Re-run when auth state changes

  
  // --- Asset & Filter Functions (from your original file) ---
  
  // Gets all assets from storage
  const getStorageAssets = () => {
    const stored = localStorage.getItem("uploaded_assets");
    return stored ? (JSON.parse(stored) as Asset[]) : [];
  };

  // Saves assets to storage (used by delete)
  const saveAssetsToStorage = (updatedAssets: Asset[]) => {
    // This is a simplified global save.
    localStorage.setItem("uploaded_assets", JSON.stringify(updatedAssets));
  };

  const applyFilters = () => {
    if (!user) return; // Should never happen if auth guard works
    
    let allAssets = getStorageAssets();

    // 1. Apply role-based filter
    if (user.role !== "admin") {
      allAssets = allAssets.filter((a) => a.uploaded_by === user.username);
    } else if (filters.uploaded_by) {
      // Admin is filtering by a specific user
      allAssets = allAssets.filter((a) =>
        a.uploaded_by.toLowerCase().includes(filters.uploaded_by.toLowerCase())
      );
    }

    // 2. Apply other filters
    if (filters.file_type) {
      allAssets = allAssets.filter((a) => a.file_type === filters.file_type);
    }
    if (filters.tag) {
      allAssets = allAssets.filter((a) =>
        a.tags.some(t => t.toLowerCase().includes(filters.tag.toLowerCase()))
      );
    }
    if (filters.start_date) {
      allAssets = allAssets.filter(
        (a) => new Date(a.uploaded_at) >= new Date(filters.start_date)
      );
    }
    if (filters.end_date) {
      allAssets = allAssets.filter(
        (a) => new Date(a.uploaded_at) <= new Date(filters.end_date)
      );
    }

    setAssets(allAssets);
  };

  const clearFilters = () => {
    if (!user) return;
    
    setFilters({
      file_type: "",
      uploaded_by: user.role === "admin" ? "" : user.username,
      start_date: "",
      end_date: "",
      tag: "",
    });

    // Reset view to all assets (respecting role)
    const allAssets = getStorageAssets();
    if (user.role === "admin") {
      setAssets(allAssets);
    } else {
      setAssets(allAssets.filter((a) => a.uploaded_by === user.username));
    }
  };

  const handleDelete = (assetToDel: Asset) => {
    // Note: This deletes from the *global* list in localStorage
    const allAssets = getStorageAssets();
    const updatedGlobalAssets = allAssets.filter(
      (a) => a.name !== assetToDel.name || a.uploaded_at !== assetToDel.uploaded_at
    );
    saveAssetsToStorage(updatedGlobalAssets);
    
    // Update the local state
    setAssets(prevAssets => 
      prevAssets.filter(a => a.name !== assetToDel.name || a.uploaded_at !== assetToDel.uploaded_at)
    );
  };

  const handleDownload = (asset: Asset) => {
    if (!asset.preview) return;
    const link = document.createElement("a");
    link.href = asset.preview;
    link.download = asset.name;
    link.click();
  };

  // 4. Handle Loading and Unauthenticated State
  if (loading || !user) {
    return (
      <Box
        display="flex"
        minH="100vh"
        alignItems="center"
        justifyContent="center"
      >
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="blue.500"
          size="xl"
        />
      </Box>
    );
  }

  // 5. Render the Page (User is authenticated)
  return (
    <Box p={8}>
      <Flex justify="space-between" align="center" mb={6}>
        <Box>
          <Heading mb={1}>My Assets</Heading>
          <Text>
            Logged in as: <strong>{user.username}</strong> ({user.role})
          </Text>
        </Box>
        <Button colorScheme="red" onClick={logout}>
          Logout
        </Button>
      </Flex>

      <FilterBar
        filters={filters}
        setFilters={setFilters}
        onApply={applyFilters}
        onClear={clearFilters}
        showUploadedBy={user.role === "admin"} // <-- Role auth in action!
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
              boxShadow="sm"
            >
              <Heading size="sm" noOfLines={1}>{asset.name}</Heading>
              <Text fontSize="sm">Type: {asset.file_type}</Text>
              <Text fontSize="sm">By: {asset.uploaded_by}</Text>
              <Text fontSize="sm">
                Date: {new Date(asset.uploaded_at).toLocaleDateString()}
              </Text>
              <Text fontSize="sm">Tags: {asset.tags.join(", ")}</Text>

              {/* Asset Previews */}
              <Box h="100px" my={2} display="flex" alignItems="center" justifyContent="center">
                {asset.file_type === "image" && asset.preview && (
                  <img
                    src={asset.preview}
                    alt={asset.name}
                    style={{ maxHeight: "100px", maxWidth: "100%", borderRadius: "4px" }}
                  />
                )}
                {asset.file_type === "video" && asset.preview && (
                  <video
                    src={asset.preview}
                    controls
                    style={{ maxHeight: "100px", maxWidth: "100%", borderRadius: "4px" }}
                  />
                )}
                {asset.file_type === "pdf" && (
                   <Text color="gray.500">(No Preview)</Text>
                )}
              </Box>

              <VStack mt={2} gap={1}>
                <Button
                  size="sm"
                  colorScheme="blue"
                  onClick={() => handleDownload(asset)}
                  isDisabled={!asset.preview}
                >
                  Download
                </Button>
                <Button
                  size="sm"
                  colorScheme="red"
                  variant="outline"
                  onClick={() => handleDelete(asset)}
                >
                  Delete
                </Button>
              </VStack>
            </Box>
          ))
        ) : (
          <Text>No assets found matching your filters.</Text>
        )}
      </Flex>
    </Box>
  );
}