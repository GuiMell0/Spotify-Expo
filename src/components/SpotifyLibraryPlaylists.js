import React, { useCallback, useSyncExternalStore } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSearch } from '../contexts/SearchContext';
import ApiFeedback from './ApiFeedback';
import { colors, radius } from '../theme';
export default function SpotifyLibraryPlaylists({visible,view,sort,controller}) {
 const {search}=useSearch(),router=useRouter();
 const state=useSyncExternalStore(controller.subscribe,controller.getSnapshot,controller.getSnapshot);
 useFocusEffect(useCallback(()=>{controller.setActive(visible);return()=>controller.setActive(false);},[controller,visible]));
 if(!visible)return null;
 const items=sort==='title'?[...state.items].sort((a,b)=>a.title.localeCompare(b.title,'pt-BR',{sensitivity:'base'})):state.items;
 return <View style={styles.section}><View style={styles.heading}><MaterialCommunityIcons name="spotify" size={24} color={colors.green}/><Text accessibilityRole="header" style={styles.title}>Playlists da conta Spotify</Text></View><Text style={styles.description}>{sort==='title'?'Títulos das playlists carregadas':'Na ordem fornecida pelo Spotify'} · requer conexão</Text><Pressable accessibilityRole="button" accessibilityLabel="Atualizar playlists da conta" disabled={state.status==='loading'||state.loadingMore} onPress={controller.refresh} style={styles.button}><Text style={styles.buttonText}>Atualizar playlists</Text></Pressable>
 <ApiFeedback loading={state.status==='loading'} error={state.error} onRetry={controller.refresh} retryLabel="Tentar carregar playlists da conta"/>
 {state.status==='paused'&&<ApiFeedback message="Carregamento interrompido." onRetry={controller.refresh}/>}
 {state.error&&state.items.length>0&&<Text style={styles.description}>Estas são as playlists carregadas anteriormente. Não foi possível atualizar.</Text>}
 {state.status==='ready'&&!state.items.length&&<Text style={styles.description}>{state.page?.next?'Nenhuma playlist disponível nesta página. Você pode carregar a próxima.':'Nenhuma playlist retornada para esta conta.'}</Text>}
 <View style={[styles.items,view==='grid'&&styles.grid]}>{items.map(item=><Pressable key={item.id} accessibilityRole="button" accessibilityLabel={'Abrir playlist Spotify '+item.title} onPress={()=>{search.rememberEntity(item);router.push(item.href);}} style={[styles.card,view==='grid'?styles.gridCard:styles.listCard]}>{item.image?<Image source={item.image} resizeMode="contain" style={styles.art}/>:<View style={styles.placeholder}><MaterialCommunityIcons name="spotify" size={30} color={colors.green}/></View>}<View style={styles.info}><Text numberOfLines={2} style={styles.name}>{item.title}</Text><Text numberOfLines={2} style={styles.description}>Spotify{item.owner.name?' · '+item.owner.name:''}</Text></View></Pressable>)}</View>
 <ApiFeedback loading={state.loadingMore} error={state.moreError} onRetry={controller.loadMore} retryLabel="Tentar carregar mais playlists"/>
 {state.status==='ready'&&state.page?.next&&!state.loadingMore&&!state.moreError&&<Pressable accessibilityRole="button" accessibilityLabel="Carregar mais playlists Spotify" onPress={controller.loadMore} style={styles.button}><Text style={styles.buttonText}>Carregar mais playlists</Text></Pressable>}
 </View>;
}
const styles=StyleSheet.create({section:{gap:16,paddingTop:24,paddingBottom:16},heading:{flexDirection:'row',alignItems:'center',gap:8},title:{flex:1,color:colors.text,fontSize:21,fontWeight:'800'},description:{color:colors.muted,fontSize:13,lineHeight:21},button:{minHeight:48,padding:14,justifyContent:'center',backgroundColor:colors.surface,borderRadius:radius.md,alignSelf:'flex-start'},buttonText:{color:colors.text,fontWeight:'700'},items:{gap:12},grid:{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between',columnGap:0,rowGap:12},card:{gap:12,padding:12,backgroundColor:colors.backgroundSoft,borderRadius:radius.md},gridCard:{width:'48.5%',minHeight:176},listCard:{flexDirection:'row',alignItems:'center',minHeight:84},art:{width:56,height:56},placeholder:{width:56,height:56,alignItems:'center',justifyContent:'center',backgroundColor:colors.surface},info:{flex:1,gap:5},name:{color:colors.text,fontSize:15,fontWeight:'700',lineHeight:21}});
