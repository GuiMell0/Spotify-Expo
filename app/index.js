import React from 'react';
import { Redirect } from 'expo-router';
import { useSession } from '../src/contexts/SessionContext';

export default function Index() {
  const { canAccess } = useSession();
  return <Redirect href={canAccess ? '/home' : '/login'} />;
}
