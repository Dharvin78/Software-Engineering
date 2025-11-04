"use client";

import { Box, Flex, Input, Button, chakra } from "@chakra-ui/react";

// Use chakra factory to create a select component
const ChakraSelect = chakra("select");

interface Filters {
  file_type: string;
  uploaded_by: string;
  start_date: string;
  end_date: string;
  tag: string;
}

interface FilterBarProps {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  onApply: () => void;
  onClear: () => void;
  showUploadedBy?: boolean; // This prop is controlled by the user's role
}

export default function FilterBar({
  filters,
  setFilters,
  onApply,
  onClear,
  showUploadedBy = false,
}: FilterBarProps) {
  return (
    <Box mb={6}>
      <Flex gap={4} wrap="wrap" align="center">
        {/* File Type Select */}
        <ChakraSelect
          value={filters.file_type}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setFilters({ ...filters, file_type: e.target.value })
          }
          borderRadius="md"
          borderWidth="1px"
          borderColor="gray.200"
          p={2}
          bg="white"
          _focus={{ borderColor: "blue.500", boxShadow: "outline" }}
        >
          <option value="">Filter by File Type</option>
          <option value="image">Image</option>
          <option value="pdf">PDF</option>
          <option value="video">Video</option>
        </ChakraSelect>

        {/* Tag Input */}
        <Input
          placeholder="Tag..."
          value={filters.tag}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFilters((prev) => ({ ...prev, tag: e.target.value }))
          }
          bg="white"
        />

        {/* Uploaded By Input (Conditional) */}
        {showUploadedBy && (
          <Input
            placeholder="Uploaded By..."
            value={filters.uploaded_by}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFilters((prev) => ({ ...prev, uploaded_by: e.target.value }))
            }
            bg="white"
          />
        )}

        {/* Date Inputs */}
        <Input
          type="date"
          value={filters.start_date}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFilters({ ...filters, start_date: e.target.value })
          }
          bg="white"
          width="auto"
        />
        <Input
          type="date"
          value={filters.end_date}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFilters({ ...filters, end_date: e.target.value })
          }
          bg="white"
          width="auto"
        />

        {/* Action Buttons */}
        <Button colorScheme="blue" onClick={onApply}>
          Apply Filters
        </Button>
        <Button variant="outline" onClick={onClear} bg="white">
          Clear
        </Button>
      </Flex>
    </Box>
  );
}