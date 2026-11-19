import React, { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View, Linking } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSession } from '../contexts/SessionContext';
import { useSearch } from '../contexts/SearchContext';
import { useLocalData } from '../contexts/LocalDataContext';
import { createSpotifyTrack, findSavedTrack, openSpotifyTrack } from '../services/spotifyTrack.mjs';
import ApiFeedback from '../components/ApiFeedback';
import BackButton from '../components/BackButton';
import LikeTrackButton from '../components/LikeTrackButton';
import AddToPlaylistButton from '../components/AddToPlaylistButton';
import DemoPlayerScreen from './DemoPlayerScreen';
import { colors, radius } from '../theme';
export default function PlayerScreen(){const {isDemo}=useSession();return isDemo?<DemoPlayerScreen/>:<RealTrackPlayer/>;}
function RealTrackPlayer(){
 const {trackId:routeTrackId}=useLocalSearchParams();
 const trackId=typeof routeTrackId==='string'?routeTrackId:routeTrackId==null?undefined:'invalid';
 const {catalog,session}=useSession(),{search}=useSearch(),{state:localState}=useLocalData(),router=useRouter();
 const scope=session?.user.id;
 const cached=findSavedTrack(search,localState.data,trackId);
 const controller=useMemo(()=>createSpotifyTrack(catalog,trackId,{scope}),[catalog,trackId,scope]);
 const state=useSyncExternalStore(controller.subscribe,controller.getSnapshot,controller.getSnapshot);
 const [openFailure,setOpenFailure]=useState(null),[opening,setOpening]=useState(null);
 useEffect(()=>{controller.provideCached(cached);},[controller,cached]);
 useEffect(()=>()=>controller.suspend(),[controller]);
 useFocusEffect(useCallback(()=>{controller.setActive(true);return()=>controller.setActive(false);},[controller]));
 const track=state.track;
 async function open(){
   if(!track||opening===controller)return;
   const owner=controller;setOpening(owner);setOpenFailure(null);
   try{await openSpotifyTrack(track,url=>Linking.openURL(url));}catch{setOpenFailure(owner);}finally{setOpening(current=>current===owner?null:current);}
 }
 const artists=[...new Map((track?.artists??[]).filter(artist=>artist.id).map(artist=>[artist.id,artist])).values()];
 return <View style={styles.root}><LinearGradient colors={['#224B38',colors.background]} style={StyleSheet.absoluteFill}/><SafeAreaView style={styles.safe} edges={['top','bottom']}><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
 <View style={styles.top}><BackButton name="chevron-down" accessibilityLabel="Voltar" style={styles.icon}/><MaterialCommunityIcons name="spotify" size={25} color={colors.green}/><Text style={styles.description}>Faixa selecionada</Text><Pressable accessibilityRole="button" accessibilityLabel="Atualizar faixa" disabled={state.status==='loading'||!trackId} onPress={controller.refresh} style={styles.icon}><MaterialCommunityIcons name="refresh" size={25} color={colors.text}/></Pressable></View>
 {!trackId?<View style={styles.section}><Text accessibilityRole="header" style={styles.title}>Escolha uma música</Text><Text style={styles.description}>Abra uma faixa pela busca, álbum ou Biblioteca.</Text></View>:<ApiFeedback loading={state.status==='loading'} error={state.error} onRetry={controller.refresh} retryLabel="Tentar carregar faixa"/>}
 {state.status==='paused'&&<ApiFeedback message="Carregamento interrompido." onRetry={controller.refresh}/>}
 {track&&<>{track.image?<Image source={track.image} resizeMode="contain" style={styles.cover}/>:<View style={styles.placeholder}><MaterialCommunityIcons name="music-note" size={86} color={colors.muted}/></View>}<Text accessibilityRole="header" style={styles.title}>{track.title}</Text><Text style={styles.artist}>{track.artist}</Text>{track.duration&&<Text style={styles.description}>Duração: {track.duration}</Text>}{track.isPlayable===false&&<Text style={styles.description}>A API informa indisponibilidade para esta conta. A disponibilidade ao abrir depende do Spotify.</Text>}
 <View style={styles.actions}><LikeTrackButton track={track} showLabel/><AddToPlaylistButton track={track}/></View>
 <Pressable accessibilityRole="link" accessibilityLabel={'Ver '+track.title+' no Spotify'} accessibilityState={{disabled:opening===controller}} disabled={opening===controller} onPress={open} style={styles.open}><MaterialCommunityIcons name="spotify" size={25} color={colors.black}/><Text style={styles.openText}>{opening===controller?'Abrindo…':'Ouvir no Spotify'}</Text></Pressable>
 <Text style={styles.description}>A reprodução acontece no Spotify. Este aplicativo mostra os dados da faixa e suas opções locais.</Text>
 {openFailure===controller&&<Text accessibilityRole="alert" style={styles.description}>Não foi possível abrir o Spotify. Tente novamente pelo botão acima.</Text>}
 {state.error&&<Text style={styles.description}>Os metadados já carregados foram mantidos.</Text>}
 {track.album?.id&&<Pressable accessibilityRole="button" accessibilityLabel={'Ver álbum: '+track.album.title} onPress={()=>{search.rememberEntity(track.album);router.push(track.album.href);}} style={styles.secondary}><Text style={styles.secondaryText}>Ver álbum: {track.album.title}</Text></Pressable>}
 {artists.map(artist=><Pressable key={artist.id} accessibilityRole="button" accessibilityLabel={'Ver artista: '+artist.title} onPress={()=>{search.rememberEntity(artist);router.push(artist.href);}} style={styles.secondary}><Text style={styles.secondaryText}>Ver artista: {artist.title}</Text></Pressable>)}
 </>}
 {!track&&<Pressable accessibilityRole="button" onPress={()=>router.dismissTo('/search')} style={styles.secondary}><Text style={styles.secondaryText}>Buscar músicas</Text></Pressable>}
 </ScrollView></SafeAreaView></View>;
}
const styles=StyleSheet.create({root:{flex:1,backgroundColor:colors.background},safe:{flex:1},content:{flexGrow:1,padding:20,paddingBottom:32,gap:18},top:{flexDirection:'row',alignItems:'center',gap:10},icon:{width:44,height:44,alignItems:'center',justifyContent:'center'},description:{color:colors.muted,fontSize:14,lineHeight:22,flexShrink:1},section:{gap:16,paddingVertical:20},cover:{width:'100%',maxWidth:340,aspectRatio:1,alignSelf:'center',backgroundColor:colors.surface},placeholder:{width:'100%',maxWidth:340,aspectRatio:1,alignSelf:'center',backgroundColor:colors.surface,alignItems:'center',justifyContent:'center'},title:{color:colors.text,fontSize:29,fontWeight:'900',lineHeight:37},artist:{color:colors.muted,fontSize:17,lineHeight:25},actions:{flexDirection:'row',flexWrap:'wrap',gap:12,alignItems:'center'},open:{minHeight:54,flexDirection:'row',gap:10,padding:16,alignItems:'center',justifyContent:'center',backgroundColor:colors.green,borderRadius:radius.pill},openText:{color:colors.black,fontSize:15,fontWeight:'800'},secondary:{minHeight:48,padding:14,justifyContent:'center',borderWidth:1,borderColor:colors.muted,borderRadius:radius.pill},secondaryText:{color:colors.text,fontSize:14,fontWeight:'700'}});
