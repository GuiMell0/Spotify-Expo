import React from 'react';
import { useRouter } from 'expo-router';
import IconButton from './IconButton';

export default function BackButton({ name = 'arrow-left', accessibilityLabel = 'Voltar', ...props }) {
  const router = useRouter();

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/home');
    }
  };

  return <IconButton {...props} name={name} accessibilityLabel={accessibilityLabel} onPress={goBack} />;
}
