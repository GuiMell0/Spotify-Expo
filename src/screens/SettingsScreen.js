import React, { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import SafeAreaView from '../components/ScreenSafeArea';
import { useSession } from '../contexts/SessionContext';
import { useLocalData } from '../contexts/LocalDataContext';
import { saveLibraryPreference } from '../services/library.mjs';
import { clearSavedGroup, LOCAL_CLEAR_GROUPS } from '../services/localSettings.mjs';
import { colors, radius } from '../theme';
export default function SettingsScreen(){
 const router=useRouter(),{isDemo,signOut}=useSession(),{localData,state}=useLocalData();
 const [confirmation,setConfirmation]=useState(null),[message,setMessage]=useState(null),alive=useRef(true);
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;};},[]);
 const current=confirmation?.owner===localData?confirmation:null,ready=state.status==='ready',saving=state.status==='saving',canChange=ready&&!current;
 async function preference(key,value){
   if(localData.getSnapshot().status!=='ready'||current)return;
   setMessage(null);
   try{await saveLibraryPreference(localData,key,value);if(alive.current)setMessage({owner:localData,text:'Preferência salva'});}catch{/* Aviso global oferece nova leitura. */}
 }
 async function clear(){
   if(!current||localData.getSnapshot().status!=='ready')return;
   const selected=current;
   try{await clearSavedGroup(localData,selected.key);if(alive.current){setConfirmation(null);setMessage({owner:localData,text:'Limpeza concluída: '+selected.label});}}catch{/* Não mostrar sucesso antes da gravação. */}
 }
 function option(key,value,label){
   const selected=state.data.preferences[key]===value;
   return <Pressable key={value} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{selected,disabled:!canChange}} disabled={!canChange} onPress={()=>preference(key,value)} style={[styles.option,selected&&styles.selected,!canChange&&styles.disabled]}><Text style={styles.optionText}>{label}{selected?' ✓':''}</Text></Pressable>;
 }
 return <SafeAreaView style={styles.root} edges={['top','bottom']}><ScrollView keyboardDismissMode="on-drag" contentContainerStyle={styles.content}>
 <Pressable accessibilityRole="button" accessibilityLabel="Voltar ao perfil" onPress={()=>router.dismissTo('/profile')} style={styles.secondary}><Text style={styles.secondaryText}>Voltar ao perfil</Text></Pressable>
 <Text accessibilityRole="header" style={styles.title}>Configurações</Text><Text style={styles.description}>Preferências e dados locais desta conta neste aparelho. Estas ações não modificam sua conta Spotify.</Text>
 {isDemo?<Text style={styles.description}>Entre com Spotify para usar suas preferências pessoais.</Text>:state.data?<>
 <Text accessibilityRole="header" style={styles.sectionTitle}>Visualização da Biblioteca</Text><View style={styles.options}>{option('libraryView','grid','Grade')}{option('libraryView','list','Lista')}</View>
 <Text accessibilityRole="header" style={styles.sectionTitle}>Ordenação da Biblioteca</Text><View style={styles.options}>{option('librarySort','recent','Recentes')}{option('librarySort','title','Título')}</View>
 <Text style={styles.description}>Em Recentes, playlists Spotify mantêm a ordem original. Título ordena somente as playlists carregadas.</Text>
 <Text style={styles.description}>Apelido local: {state.data.preferences.displayName??'usando o nome do Spotify'}</Text>
 <Pressable accessibilityRole="button" accessibilityLabel="Editar apelido nas configurações" disabled={!canChange} onPress={()=>router.push('/profile/edit')} style={styles.secondary}><Text style={styles.secondaryText}>Editar apelido local</Text></Pressable>
 <Text accessibilityRole="header" style={styles.sectionTitle}>Limpeza seletiva</Text>
 <Text style={styles.description}>Escolha um grupo para remover. Os demais dados e a sessão serão mantidos.</Text>
 {current&&<View style={styles.confirmation}><Text accessibilityRole="header" style={styles.sectionTitle}>Limpar {current.label}?</Text><Text style={styles.description}>{current.key==='preferences'?'O apelido será removido e a Biblioteca voltará a Grade e Recentes.':'Este grupo será removido do aparelho para esta conta. Não será possível desfazer a limpeza pelo aplicativo.'}</Text><Pressable accessibilityRole="button" accessibilityLabel="Confirmar limpeza local" disabled={!ready} accessibilityState={{disabled:!ready}} onPress={clear} style={[styles.primary,!ready&&styles.disabled]}><Text style={styles.primaryText}>Confirmar limpeza</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel="Cancelar limpeza local" disabled={saving} onPress={()=>setConfirmation(null)} style={styles.secondary}><Text style={styles.secondaryText}>Cancelar</Text></Pressable></View>}
 {LOCAL_CLEAR_GROUPS.map(group=><Pressable key={group.key} accessibilityRole="button" accessibilityLabel={'Limpar '+group.label} disabled={!canChange} accessibilityState={{disabled:!canChange}} onPress={()=>{setMessage(null);setConfirmation({owner:localData,...group});}} style={[styles.secondary,!canChange&&styles.disabled]}><Text style={styles.secondaryText}>{'Limpar '+group.label}{group.key==='preferences'?'': ' ('+state.data[group.key].length+')'}</Text></Pressable>)}
 </>:<Text style={styles.description}>{state.status==='error'?'Não foi possível carregar seus dados. Use o aviso acima para tentar novamente.':'Carregando preferências…'}</Text>}
 {state.status==='error'&&state.data&&<Text style={styles.description}>Os dados confirmados foram mantidos. Carregue-os novamente pelo aviso acima antes de alterar.</Text>}
 {saving&&<Text accessibilityLiveRegion="polite" style={styles.description}>Salvando alteração…</Text>}
 {message?.owner===localData&&<Text accessibilityRole="alert" style={styles.description}>{message.text}</Text>}
 <Pressable accessibilityRole="button" accessibilityLabel={isDemo?'Sair da demonstração':'Sair da conta'} onPress={signOut} style={styles.secondary}><Text style={styles.secondaryText}>{isDemo?'Sair da demonstração':'Sair da conta'}</Text></Pressable>
 </ScrollView></SafeAreaView>;
}
const styles=StyleSheet.create({root:{flex:1,backgroundColor:colors.background},content:{flexGrow:1,padding:20,paddingBottom:32,gap:18},title:{color:colors.text,fontSize:29,fontWeight:'900',lineHeight:37},sectionTitle:{color:colors.text,fontSize:20,fontWeight:'800',lineHeight:27},description:{color:colors.muted,fontSize:14,lineHeight:22},options:{flexDirection:'row',flexWrap:'wrap',gap:10},option:{minHeight:48,padding:14,borderWidth:1,borderColor:colors.muted,borderRadius:radius.md,justifyContent:'center'},optionText:{color:colors.text,fontSize:14,fontWeight:'700'},selected:{borderColor:colors.green,backgroundColor:'#17452A'},disabled:{opacity:0.5},primary:{minHeight:48,padding:14,alignItems:'center',justifyContent:'center',backgroundColor:colors.green,borderRadius:radius.pill},primaryText:{color:colors.black,fontSize:14,fontWeight:'800'},secondary:{minHeight:48,padding:14,borderWidth:1,borderColor:colors.muted,borderRadius:radius.pill,justifyContent:'center'},secondaryText:{color:colors.text,fontSize:14,fontWeight:'700'},confirmation:{padding:16,gap:16,backgroundColor:colors.surface,borderRadius:radius.md}});
