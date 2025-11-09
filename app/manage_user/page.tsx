"use client";

import { useEffect, useState } from "react";
import api, { setAuthToken } from "@/lib/api";
import {
  Box,
  Button,
  Stack,
  Heading,
  Text,
  Spinner,
} from "@chakra-ui/react";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/ui/navbar";

const dummyUser = { username: "admin1", role: "admin" };

interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  is_superuser: boolean;
}

export default function ManageUsersPage() {
  const { token, user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
  setLoading(true);

  const timer = setTimeout(() => {
    setUsers([
      { id: 1, username: "admin1", email: "admin@example.com", is_active: true, is_superuser: true },
      { id: 2, username: "john_doe", email: "john@example.com", is_active: true, is_superuser: false },
      { id: 3, username: "jane_doe", email: "jane@example.com", is_active: false, is_superuser: false },
    ]);
    setLoading(false);
  }, 1000);

  return () => clearTimeout(timer);
}, []); 

  const toggleActive = (user: User) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === user.id ? { ...u, is_active: !u.is_active } : u
      )
    );
  };

  // ✅ Delete locally
  const deleteUser = (id: number) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };


    // const fetchUsers = async () => {
      //try {
        //const resp = await api.get("/users/");
        //setUsers(resp.data);
     // } catch (err) {
       // console.error(err);
    //  } finally {
       // setLoading(false);
    //  }
   // };

    //fetchUsers();
 // }, [token]);

  //const toggleActive = async (user: User) => {
    //try {
     // if (user.is_active) {
       // await api.post(`/users/${user.id}/deactivate/`);
    //  } else {
        //await api.post(`/users/${user.id}/activate/`);
    //  }
      //setUsers((prev) =>
        //prev.map((u) => (u.id === user.id ? { ...u, is_active: !u.is_active } : u))
    //  );
   // } catch (err) {
   //   console.error(err);
   // }
 // };

  //const deleteUser = async (id: number) => {
    //try {
     // await api.delete(`/users/${id}/`);
      //setUsers((prev) => prev.filter((u) => u.id !== id));
  //  } catch (err) {
    //  console.error(err);
  //  }
 // };

  return (
    <>
      {/* Navbar always shows */}
      <Navbar user={user || dummyUser} />

      <Box p={8}>
        <Stack gap={4}>
          <Heading>Manage Users</Heading>

          {loading && <Spinner size="xl" />}

          {!loading && users.length === 0 && (
            <Text>No users found.</Text>
          )}

          {users.map((user) => (
            <Box
              key={user.id}
              p={4}
              borderWidth={1}
              borderRadius="md"
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box>
                <Text><strong>ID:</strong> {user.id}</Text>
                <Text><strong>Username:</strong> {user.username}</Text>
                <Text><strong>Email:</strong> {user.email}</Text>
                <Text><strong>Active:</strong> {user.is_active ? "Yes" : "No"}</Text>
                <Text><strong>Superuser:</strong> {user.is_superuser ? "Yes" : "No"}</Text>
              </Box>
              <Stack direction="row" gap={2}>
                <Button size="sm" onClick={() => toggleActive(user)}>
                  {user.is_active ? "Deactivate" : "Activate"}
                </Button>
                {!user.is_superuser && (
                  <Button size="sm" colorScheme="red" onClick={() => deleteUser(user.id)}>
                    Delete
                  </Button>
                )}
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>
    </>
  );
}
