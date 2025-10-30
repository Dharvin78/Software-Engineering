"use client";

import { Box, Flex, Input, Button, chakra } from "@chakra-ui/react";

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
  showUploadedBy?: boolean; // new prop
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
      <Flex gap={4} wrap="wrap">
        <ChakraSelect
          value={filters.file_type}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setFilters({ ...filters, file_type: e.target.value })
          }
          borderRadius="md"
          p={2}
        >
          <option value="">Filter by File Type</option>
          <option value="image">Image</option>
          <option value="pdf">PDF</option>
          <option value="video">Video</option>
        </ChakraSelect>

        <Input
          placeholder="Tag ..."
          value={filters.tag}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFilters((prev) => ({ ...prev, tag: e.target.value }))
          }
        />

        {showUploadedBy && (
          <Input
            placeholder="Uploaded By ..."
            value={filters.uploaded_by}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFilters((prev) => ({ ...prev, uploaded_by: e.target.value }))
            }
          />
        )}

        <Input
          type="date"
          value={filters.start_date}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFilters({ ...filters, start_date: e.target.value })
          }
        />
        <Input
          type="date"
          value={filters.end_date}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFilters({ ...filters, end_date: e.target.value })
          }
        />

        <Button colorScheme="blue" onClick={onApply}>
          Apply Filters
        </Button>
        <Button variant="outline" onClick={onClear}>
          Clear
        </Button>
      </Flex>
    </Box>
  );
}
