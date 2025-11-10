'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Button,
  Container,
  Heading,
  Input,
  Stack,
  Text,
} from '@chakra-ui/react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const uidb64 = useMemo(() => searchParams.get('uidb64') || '', [searchParams]);
  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  const invalidLink = !uidb64 || !token;

   if (invalidLink) {
    return (
      <div style={{ textAlign: 'center', marginTop: '2rem', color: 'red' }}>
        Invalid or expired password reset link.
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (password !== password2) {
      setMessage('❌ Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:8000/api/password-reset-confirm/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uidb64, token, password }),
      });
      const text = await res.text();

      // Try parsing JSON safely
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.error('Response is not JSON:', text);
        throw new Error('Invalid response from server');
      }


      if (!res.ok) {
        throw new Error(data?.error || 'Failed to reset password');
      }

      setMessage('✅ Password successfully reset! Redirecting to login...');
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: any) {
      setMessage(err?.message || '❌ Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  if (invalidLink) {
    return (
      <Container minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <Box p={8} bg="red.100" color="red.700" rounded="md">
          Invalid or expired password reset link.
        </Box>
      </Container>
    );
  }

  return (
    <Container minH="100vh" display="flex" alignItems="center" justifyContent="center">
      <Stack gap={8} w="full" maxW="md" bg="white" p={8} rounded="lg" boxShadow="lg">
        <Heading textAlign="center" fontSize="2xl">Reset Password</Heading>

        {message && (
          <Box
            p={2}
            bg={message.startsWith('✅') ? 'green.100' : 'red.100'}
            color={message.startsWith('✅') ? 'green.700' : 'red.700'}
            borderRadius="md"
          >
            {message}
          </Box>
        )}

        <form onSubmit={handleSubmit}>
          <Stack gap={4}>
            <Box>
              <Text mb={1}>New Password</Text>
              <Input
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Box>

            <Box>
              <Text mb={1}>Confirm Password</Text>
              <Input
                type="password"
                placeholder="Confirm new password"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                required
              />
            </Box>

            <Button type="submit" colorScheme="blue" loading={loading}>
              Reset Password
            </Button>
          </Stack>
        </form>
      </Stack>
    </Container>
  );
}
