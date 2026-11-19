import React, { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { FlatList, Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSession } from '../contexts/SessionContext';
import { useSearch } from '../contexts/SearchContext';
import { createSpotifyPlaylist } from '../services/spotifyPlaylist.mjs';
import { isSpotifyId } from '../services/spotifyModels.mjs';
import ApiFeedback from '../components/ApiFeedback';
import BackButton from '../components/BackButton';
import LikeTrackButton from '../components/LikeTrackButton';
import AddToPlaylistButton from '../components/AddToPlaylistButton';
import DemoPlaylistScreen from './DemoPlaylistScreen';
import { colors, radius } from '../theme';
export default function PlaylistScreen() {
  const {isDemo}=useSession();
  return isDemo?<DemoPlaylistScreen/>:<RemotePlaylist/>;
}
function RemotePlaylist() {
  const {id:routeId}=useLocalSearchParams(),{catalog,session}=useSession(),{search}=useSearch(),router=useRouter();
  const id=typeof routeId==='string'?routeId:'',scope=session?.user.id;
  const controller=useMemo(()=>createSpotifyPlaylist(catalog,id,{scope}),[catalog,id,scope]);
  const state=useSyncExternalStore(controller.subscribe,controller.getSnapshot,controller.getSnapshot);
  const [openError,setOpenError]=useState(null);
  useEffect(()=>()=>controller.suspend(),[controller]);
  useFocusEffect(useCallback(()=>{controller.setActive(true);return()=>{controller.setActive(false);};},[controller]));
  const playlist=state.playlist,busy=state.status==='loading';
  async function spotify(){setOpenError(null);try{await Linking.openURL('https://open.spotify.com/playlist/'+id);}catch{setOpenError(controller);}}
  function open(track){search.rememberEntity(track);router.push(track.href);}
  return <SafeAreaView style={styles.root} edges={['top','bottom']}><FlatList data={state.tracks} keyExtractor={(item,index)=>item.id+':'+index} contentContainerStyle={styles.content}
    ListHeaderComponent={<View style={styles.header}><View style={styles.top}><BackButton style={styles.icon}/><MaterialCommunityIcons name="spotify" size={25} color={colors.green}/><Text style={styles.description}>Playlist no Spotify</Text><Pressable accessibilityRole="button" accessibilityLabel="Atualizar playlist Spotify" disabled={busy||state.loadingMore} onPress={controller.refresh} style={styles.icon}><MaterialCommunityIcons name="refresh" size={25} color={colors.text}/></Pressable></View>
      <ApiFeedback loading={busy} error={state.error} onRetry={controller.refresh} retryLabel="Tentar carregar playlist"/>
      {state.status==='paused'&&<ApiFeedback message="Carregamento interrompido." onRetry={controller.refresh}/>}
      {state.error?.status===403&&<Text style={styles.description}>O Spotify não liberou esta playlist para sua conta ou aplicativo. Confira as permissões e tente uma playlist acessível pela sua conta.</Text>}
      {playlist&&<>{playlist.image?<Image source={playlist.image} resizeMode="contain" style={styles.cover}/>:<View style={styles.placeholder}><MaterialCommunityIcons name="playlist-music" size={80} color={colors.muted}/></View>}<Text accessibilityRole="header" style={styles.title}>{playlist.title}</Text>{playlist.owner.name&&<Text style={styles.description}>Por {playlist.owner.name}</Text>}{playlist.description&&<Text style={styles.description}>{playlist.description.replace(/<[^>]*>/g,' ')}</Text>}{playlist.totalItems!==null&&<Text style={styles.description}>{playlist.totalItems} itens informados pelo Spotify</Text>}<Text style={styles.description}>{state.tracks.length} músicas carregadas</Text></>}
      {isSpotifyId(id)&&<Pressable accessibilityRole="link" accessibilityLabel="Abrir playlist no Spotify" onPress={spotify} style={styles.action}><Text style={styles.actionText}>Ver no Spotify</Text></Pressable>}
      {openError===controller&&<Text accessibilityRole="alert" style={styles.description}>Não foi possível abrir o Spotify. Tente novamente.</Text>}
      {state.error&&playlist&&<Text style={styles.description}>Os dados anteriores foram mantidos; não foi possível atualizar.</Text>}
      {state.skippedCount>0&&<Text style={styles.description}>{state.skippedCount} itens não foram disponibilizados como músicas pela API.</Text>}
    </View>}
    ListEmptyComponent={state.status==='ready'&&<Text style={styles.description}>{state.page?.next?'Nenhuma música disponível nesta página. Carregue a próxima.':'Nenhuma música disponível nesta playlist.'}</Text>}
    renderItem={({item,index})=><View style={styles.row}><Pressable accessibilityRole="button" accessibilityLabel={'Abrir faixa da playlist '+item.title} onPress={()=>open(item)} style={styles.open}><Text style={styles.description}>{index+1}</Text>{item.image&&<Image source={item.image} resizeMode="contain" style={styles.art}/>}<View style={styles.info}><Text style={styles.track} numberOfLines={2}>{item.title}</Text><Text style={styles.description} numberOfLines={2}>{item.artist}</Text>{item.isPlayable===false&&<Text style={styles.description}>Indisponível nesta conta</Text>}</View></Pressable><LikeTrackButton track={item}/><AddToPlaylistButton track={item}/></View>}
    ListFooterComponent={<View style={styles.header}><ApiFeedback loading={state.loadingMore} error={state.moreError} onRetry={controller.loadMore} retryLabel="Tentar carregar mais músicas"/>{state.status==='ready'&&state.page?.next&&!state.moreError&&!state.loadingMore&&!busy&&<Pressable accessibilityRole="button" accessibilityLabel="Carregar mais músicas da playlist" onPress={controller.loadMore} style={styles.action}><Text style={styles.actionText}>Carregar mais músicas</Text></Pressable>}</View>}
  /></SafeAreaView>;
}
const styles=StyleSheet.create({root:{flex:1,backgroundColor:colors.background},content:{flexGrow:1,padding:18,paddingBottom:32},header:{gap:16,paddingBottom:20},top:{flexDirection:'row',alignItems:'center',gap:8},icon:{width:44,height:44,alignItems:'center',justifyContent:'center'},description:{color:colors.muted,fontSize:13,lineHeight:21,flexShrink:1},title:{color:colors.text,fontSize:29,fontWeight:'900',lineHeight:37},cover:{width:200,height:200,alignSelf:'center',backgroundColor:colors.surface},placeholder:{width:200,height:200,alignSelf:'center',backgroundColor:colors.surface,alignItems:'center',justifyContent:'center'},action:{minHeight:48,paddingHorizontal:20,paddingVertical:12,justifyContent:'center',backgroundColor:colors.green,borderRadius:radius.pill,alignSelf:'flex-start'},actionText:{color:colors.black,fontWeight:'800'},row:{flexDirection:'row',alignItems:'center',gap:4},open:{flex:1,minHeight:84,flexDirection:'row',alignItems:'center',gap:10,paddingVertical:12},art:{width:44,height:44},info:{flex:1,gap:4},track:{color:colors.text,fontSize:15,lineHeight:21,fontWeight:'700'}});
