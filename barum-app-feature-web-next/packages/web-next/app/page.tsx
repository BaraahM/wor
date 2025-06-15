'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '../context/AuthContextProvider';
import '@mantine/core/styles.css';
export default function HomePage() {
  //TODO - Adding in authentication before user login/signup eg.perform action before login
  const { isAuthenticated, isLoading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    router.push('/home');
  }, [router]);

  return null;
}