import React from 'react';
import { Redirect } from 'expo-router';

// Entrada demonstrativa da P1; a sessão real será implementada na A04.
export default function Index() {
  return <Redirect href="/login" />;
}
