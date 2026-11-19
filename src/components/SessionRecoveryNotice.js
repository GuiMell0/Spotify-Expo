
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSession } from '../contexts/SessionContext';
import { colors, radius } from '../theme';

export default function SessionRecoveryNotice() {
  const { session, sessionRecovery, isRefreshing, retrySession } = useSession();
  if (!session || !sessionRecovery) return null;
  return <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}><View style={styles.notice}>
    <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.text}>Sem acesso ao Spotify no momento. Sua Biblioteca local continua disponível.</Text>
    <Pressable accessibilityRole="button" accessibilityLabel="Tentar reconectar ao Spotify" disabled={isRefreshing} accessibilityState={{disabled:isRefreshing,busy:isRefreshing}} onPress={retrySession} style={[styles.retry,isRefreshing&&styles.disabled]}><Text style={styles.label}>{isRefreshing?'Reconectando…':'Tentar reconectar ao Spotify'}</Text></Pressable>
  </View></SafeAreaView>;
}
const styles=StyleSheet.create({
 safe:{backgroundColor:colors.surface},notice:{padding:12,gap:8},text:{color:colors.text,fontSize:13,lineHeight:20},
 retry:{alignSelf:'flex-start',minHeight:44,paddingHorizontal:14,justifyContent:'center',borderRadius:radius.pill,backgroundColor:colors.green},
 label:{color:colors.black,fontSize:13,fontWeight:'700'},disabled:{opacity:0.5},
});
