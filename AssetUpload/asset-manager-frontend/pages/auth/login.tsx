// Login Page - Redirect to Upload
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const router = useRouter();

  useEffect(() => {
    router.push('/upload');
  }, [router]);

  return null;
}
