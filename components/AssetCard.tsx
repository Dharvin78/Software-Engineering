// src/components/AssetCard.tsx
import {
  Box,
  Heading,
  Text,
  Stack,
  Divider,
  Tag,
  TagLabel,
  Badge,
  Flex,
  useColorModeValue,
} from "@chakra-ui/react";
import React from "react";
import { Asset } from "../lib/types";

type Props = { asset: Asset };

export default function AssetCard({ asset }: Props) {
  const cardBg = useColorModeValue("gray.50", "gray.700");

  return (
    <Box
      bg={cardBg}
      p={5}
      borderRadius="xl"
      boxShadow="md"
      _hover={{ boxShadow: "lg", transform: "scale(1.02)" }}
      transition="0.2s"
    >
      <Stack spacing={2}>
        <Heading size="md">{asset.asset_name}</Heading>
        <Text fontSize="sm" color="gray.500">
          {asset.file_type.toUpperCase()} ({asset.file_extension})
        </Text>
        <Divider />
        <Text>{asset.description}</Text>

        <Text fontSize="sm" mt={2}>
          <strong>Category:</strong> {asset.category?.category_name ?? "—"}
        </Text>

        <Text fontSize="sm">
          <strong>File Size:</strong>{" "}
          {(asset.file_size_bytes / 1024 / 1024).toFixed(2)} MB
        </Text>

        <Text fontSize="sm">
          <strong>Uploaded:</strong>{" "}
          {new Date(asset.upload_date).toLocaleString()}
        </Text>

        <Text fontSize="sm">
          <strong>Uploader ID:</strong> {asset.uploader_id}
        </Text>

        <Flex wrap="wrap" gap={2} mt={2}>
          {asset.tags.map((tag) => (
            <Tag
              key={tag.tag_id}
              colorScheme={
                tag.tag_name === "Approved"
                  ? "green"
                  : tag.tag_name === "Confidential"
                  ? "red"
                  : "blue"
              }
              borderRadius="full"
            >
              <TagLabel>{tag.tag_name}</TagLabel>
            </Tag>
          ))}
        </Flex>

        {asset.is_deleted && (
          <Badge colorScheme="red" mt={2}>
            Deleted
          </Badge>
        )}
      </Stack>
    </Box>
  );
}
