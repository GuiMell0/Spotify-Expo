import React, { createContext, useContext, useEffect, useState } from 'react';
import { Keyboard } from 'react-native';

const LayoutContext = createContext(false);
export function LayoutProvider({ children }) {
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => { show.remove(); hide.remove(); };
  }, []);
  return <LayoutContext.Provider value={keyboardVisible}>{children}</LayoutContext.Provider>;
}
export const useKeyboardVisible = () => useContext(LayoutContext);
