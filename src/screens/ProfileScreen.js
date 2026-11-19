import { useLocalData } from '../contexts/LocalDataContext';
import { displayNameForAccount } from '../services/localDisplayName.mjs';
import React, { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSession } from '../contexts/SessionContext';
import { createSpotifyProfile, sessionProfile } from '../services/spotifyProfile.mjs';
import { createSpotifyLibrary } from '../services/spotifyLibrary.mjs';
import SpotifyLibraryPlaylists from '../components/SpotifyLibraryPlaylists';
import ApiFeedback from '../components/ApiFeedback';
import BackButton from '../components/BackButton';
import DemoProfileScreen from './DemoProfileScreen';
import { colors, radius } from '../theme';
export default function ProfileScreen(){const {isDemo}=useSession();return isDemo?<DemoProfileScreen/>:<AccountProfile/>;}
function AccountProfile(){
 const {session,api,catalog,signOut}=useSession(),user=session.user,id=user.id;
 const {state:localState}=useLocalData(),router=useRouter();
 const controller=useMemo(()=>createSpotifyProfile(api,id),[api,id]);
 const playlists=useMemo(()=>createSpotifyLibrary(catalog,{scope:id}),[catalog,id]);
 const state=useSyncExternalStore(controller.subscribe,controller.getSnapshot,controller.getSnapshot);
 const [failedImage,setFailedImage]=useState(null),[linkError,setLinkError]=useState(null);
 useEffect(()=>()=>{controller.suspend();playlists.suspend();},[controller,playlists]);
 useFocusEffect(useCallback(()=>{controller.setActive(true);return()=>controller.setActive(false);},[controller]));
 const profile=state.profile??sessionProfile(user),name=displayNameForAccount(localState.data,profile.name),initial=Array.from(name)[0]?.toLocaleUpperCase()||'♪';
 function refresh(){setFailedImage(null);controller.refresh();}
 async function open(){setLinkError(null);try{await Linking.openURL(profile.spotifyUrl);}catch{setLinkError(controller);}}
 return <SafeAreaView style={styles.root} edges={['top','bottom']}><ScrollView contentContainerStyle={styles.content}>
 <View style={styles.top}><BackButton style={styles.icon}/><MaterialCommunityIcons name="spotify" size={26} color={colors.green}/><Text style={styles.description}>Sua conta Spotify</Text><Pressable accessibilityRole="button" accessibilityLabel="Atualizar perfil Spotify" disabled={state.status==='loading'} onPress={refresh} style={styles.icon}><MaterialCommunityIcons name="refresh" size={25} color={colors.text}/></Pressable></View>
 <ApiFeedback loading={state.status==='loading'} error={state.error} onRetry={refresh} retryLabel="Tentar carregar perfil"/>
 {state.status==='paused'&&<ApiFeedback message="Atualização interrompida." onRetry={refresh}/>}
 <View style={styles.identity}>{profile.image&&failedImage!==profile.image.uri?<Image accessibilityLabel="Foto da conta Spotify" source={profile.image} onError={()=>setFailedImage(profile.image.uri)} style={styles.avatar}/>:<View accessibilityLabel="Perfil sem foto disponível" style={styles.placeholder}><Text style={styles.initial}>{initial}</Text></View>}<Text accessibilityRole="header" style={styles.name}>{name}</Text></View>
 {localState.data?.preferences.displayName&&<Text style={styles.description}>Apelido local · Nome no Spotify: {profile.name}</Text>}
 <Pressable accessibilityRole="button" accessibilityLabel="Editar apelido local" disabled={localState.status!=='ready'} onPress={()=>router.push('/profile/edit')} style={styles.secondary}><Text style={styles.secondaryText}>Editar apelido local</Text></Pressable>
 <Pressable accessibilityRole="button" accessibilityLabel="Abrir configurações" onPress={()=>router.push('/settings')} style={styles.secondary}><Text style={styles.secondaryText}>Configurações</Text></Pressable>
 <Text style={styles.description}>Identificador Spotify: {profile.id}</Text>
 {profile.followers!==null&&<Text style={styles.description}>{profile.followers} {profile.followers===1?'seguidor':'seguidores'}</Text>}
 {state.error&&<Text style={styles.description}>{state.profile?'Os dados anteriores foram mantidos. Não foi possível atualizar o perfil.':'A identificação exibida vem da sessão. Não foi possível atualizar o perfil.'}</Text>}
 <Pressable accessibilityRole="link" accessibilityLabel="Ver perfil no Spotify" onPress={open} style={styles.action}><Text style={styles.actionText}>Ver perfil no Spotify</Text></Pressable>
 {linkError===controller&&<Text accessibilityRole="alert" style={styles.description}>Não foi possível abrir o Spotify. Tente novamente.</Text>}
 <Pressable accessibilityRole="button" accessibilityLabel="Sair da conta" onPress={signOut} style={styles.secondary}><Text style={styles.secondaryText}>Sair da conta</Text></Pressable>
 <SpotifyLibraryPlaylists visible view="list" sort="recent" controller={playlists}/>
 </ScrollView></SafeAreaView>;
}
const styles=StyleSheet.create({root:{flex:1,backgroundColor:colors.background},content:{flexGrow:1,padding:20,paddingBottom:32,gap:18},top:{flexDirection:'row',alignItems:'center',gap:10},icon:{width:44,height:44,alignItems:'center',justifyContent:'center'},description:{color:colors.muted,fontSize:14,lineHeight:22,flexShrink:1},identity:{alignItems:'center',gap:20,paddingVertical:12},avatar:{width:130,height:130,borderRadius:65},placeholder:{width:130,height:130,borderRadius:65,backgroundColor:colors.green,alignItems:'center',justifyContent:'center'},initial:{fontSize:48,color:colors.black,fontWeight:'800'},name:{color:colors.text,fontSize:30,lineHeight:39,fontWeight:'900',textAlign:'center'},action:{minHeight:48,padding:14,justifyContent:'center',alignItems:'center',backgroundColor:colors.green,borderRadius:radius.pill},actionText:{color:colors.black,fontSize:14,fontWeight:'800'},secondary:{minHeight:48,padding:14,borderWidth:1,borderColor:colors.muted,justifyContent:'center',alignItems:'center',borderRadius:radius.pill},secondaryText:{color:colors.text,fontWeight:'700',fontSize:14}});
