// src/pages/index.tsx
import {
  Box,
  Heading,
  Input,
  Flex,
  SimpleGrid,
  Text,
  Spinner,
} from "@chakra-ui/react";
import type { NextPage } from "next";
import useSWR from "swr";
import AssetCard from "../components/AssetCard";
import { Asset } from "../lib/types";
import { useState } from "react";

const fetcher = (url: string) =>
  fetch(url).then(async (res) => {
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  });

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

const Home: NextPage = () => {
  const [search, setSearch] = useState("");
  const { data, error } = useSWR<Asset[]>(`${API_BASE}/api/assets/`, fetcher, {
    refreshInterval: 0,
  });

  const assets = data ?? [];

  const filtered = assets.filter((a) =>
    a.asset_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box p={8} maxW="1200px" mx="auto">
      <Heading mb={6} textAlign="center">
        📁 Digital Asset Management
      </Heading>

      <Flex mb={6} justify="center">
        <Input
          placeholder="Search assets..."
          width={["90%", "60%"]}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Flex>

      {error && (
        <Text color="red.500" textAlign="center">
          Failed to load assets: {String(error)}
        </Text>
      )}

      {!data && !error && (
        <Flex justify="center" mt={8}>
          <Spinner size="lg" />
        </Flex>
      )}

      {data && (
        <>
          <SimpleGrid columns={[1, 2, 3]} spacing={6}>
            {filtered.map((asset) => (
              <AssetCard key={asset.asset_id} asset={asset} />
            ))}
          </SimpleGrid>

          {filtered.length === 0 && (
            <Text mt={10} textAlign="center" color="gray.500">
              No assets found.
            </Text>
          )}
        </>
      )}
    </Box>
  );
};

export default Home;
