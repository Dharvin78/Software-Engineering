"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  Spinner,
  Container,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Divider,
  useColorModeValue,
} from "@chakra-ui/react";

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  description: string;
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const bgColor = useColorModeValue("gray.50", "gray.800");

  useEffect(() => {
    // Update this URL to your Django backend endpoint
    fetch("http://127.0.0.1:8000/api/products/")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Box h="100vh" display="flex" justifyContent="center" alignItems="center">
        <Spinner size="xl" color="blue.500" />
      </Box>
    );
  }

  return (
    <Container maxW="6xl" py={10}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading as="h1" size="xl" mb={2}>
            Asset Dashboard
          </Heading>
        </Box>

        <Divider />

        <TableContainer bg={bgColor} p={5} rounded="lg" shadow="md">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>ID</Th>
                <Th>Name</Th>
                <Th>Category</Th>
                <Th>Size</Th>
                <Th>Timespam</Th>
                <Th>Description</Th>
                <Th>Uploder Id</Th>
                <Th>Is Deleted</Th>
                <Th>Storage Path</Th>
              </Tr>
            </Thead>
            <Tbody>
              {products.length > 0 ? (
                products.map((product) => (
                  <Tr key={product.id}>
                    <Td>{product.id}</Td>
                    <Td>{product.name}</Td>
                    <Td>{product.category}</Td>
                    <Td>${product.price}</Td>
                    <Td>{product.stock}</Td>
                    <Td>{product.description}</Td>
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td colSpan={10} textAlign="center">
                    No Assets found.
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </TableContainer>
      </VStack>
    </Container>
  );
}
