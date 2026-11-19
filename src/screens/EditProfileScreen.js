import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSession } from '../contexts/SessionContext';
import { useLocalData } from '../contexts/LocalDataContext';
import { normalizeLocalDisplayName, saveLocalDisplayName } from '../services/localDisplayName.mjs';
import { colors, radius } from '../theme';
export default function EditProfileScreen() {
 const {isDemo}=useSession(),{state}=useLocalData(),router=useRouter();
 if(isDemo||!state.data)return <SafeAreaView style={styles.root}><ScrollView contentContainerStyle={styles.content}><Text accessibilityRole="header" style={styles.title}>Editar apelido local</Text><Text style={styles.description}>{isDemo?'Entre com Spotify para editar seu apelido neste aparelho.':state.status==='error'?'Não foi possível carregar seus dados. Use o aviso acima para tentar novamente.':'Carregando preferências…'}</Text><Pressable accessibilityRole="button" onPress={()=>router.dismissTo('/profile')} style={styles.secondary}><Text style={styles.secondaryText}>Voltar ao perfil</Text></Pressable></ScrollView></SafeAreaView>;
 return <EditForm key={state.accountId}/>;
}
function EditForm() {
 const {localData,state}=useLocalData(),router=useRouter();
 const [name,setName]=useState(state.data.preferences.displayName??''),[error,setError]=useState(null),alive=useRef(true);
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;};},[]);
 const ready=state.status==='ready',saving=state.status==='saving';
 async function save(reset=false) {
   if(localData.getSnapshot().status!=='ready')return;
   let value=null;
   if(!reset){try{value=normalizeLocalDisplayName(name);}catch(failure){setError(failure.message);return;}}
   setError(null);
   try{await saveLocalDisplayName(localData,value);if(alive.current)router.dismissTo('/profile');}catch{/* O aviso global preserva dados e permite recuperação. */}
 }
 return <SafeAreaView style={styles.root} edges={['top','bottom']}><KeyboardAvoidingView style={styles.root} behavior={Platform.OS==='ios'?'padding':undefined}><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
 <Pressable accessibilityRole="button" accessibilityLabel="Cancelar edição de apelido" disabled={saving} onPress={()=>router.dismissTo('/profile')} style={styles.secondary}><Text style={styles.secondaryText}>Voltar ao perfil</Text></Pressable>
 <Text accessibilityRole="header" style={styles.title}>Editar apelido local</Text><Text style={styles.description}>Este nome aparece neste aplicativo e fica salvo neste aparelho para sua conta. Não altera seu nome no Spotify.</Text>
 <Text style={styles.label}>Apelido</Text><TextInput accessibilityLabel="Apelido local" value={name} onChangeText={value=>{setName(value);setError(null);}} editable={ready} maxLength={80} onSubmitEditing={()=>save()} returnKeyType="done" placeholder="Como você quer aparecer?" placeholderTextColor={colors.subtle} selectionColor={colors.green} style={styles.input}/>
 <Text style={styles.description}>{name.length}/80</Text>{error&&<Text accessibilityRole="alert" style={styles.description}>{error}</Text>}
 {state.status==='error'&&<Text style={styles.description}>Não foi possível confirmar a alteração. Use Tentar novamente no aviso acima.</Text>}
 {saving&&<Text accessibilityLiveRegion="polite" style={styles.description}>Salvando apelido…</Text>}
 <Pressable accessibilityRole="button" accessibilityLabel="Salvar apelido local" accessibilityState={{disabled:!ready}} disabled={!ready} onPress={()=>save()} style={[styles.primary,!ready&&styles.disabled]}><Text style={styles.primaryText}>Salvar apelido</Text></Pressable>
 <Pressable accessibilityRole="button" accessibilityLabel="Usar nome do Spotify" accessibilityState={{disabled:!ready}} disabled={!ready} onPress={()=>save(true)} style={[styles.secondary,!ready&&styles.disabled]}><Text style={styles.secondaryText}>Usar nome do Spotify</Text></Pressable>
 </ScrollView></KeyboardAvoidingView></SafeAreaView>;
}
const styles=StyleSheet.create({root:{flex:1,backgroundColor:colors.background},content:{flexGrow:1,padding:20,paddingBottom:32,gap:18},title:{color:colors.text,fontSize:28,fontWeight:'900',lineHeight:36},description:{color:colors.muted,fontSize:14,lineHeight:22},label:{color:colors.text,fontSize:16,fontWeight:'700'},input:{minHeight:54,padding:14,backgroundColor:colors.surface,borderRadius:radius.md,color:colors.text,fontSize:18},primary:{minHeight:48,padding:14,backgroundColor:colors.green,borderRadius:radius.pill,alignItems:'center',justifyContent:'center'},primaryText:{color:colors.black,fontSize:14,fontWeight:'800'},secondary:{minHeight:48,padding:14,borderWidth:1,borderColor:colors.muted,borderRadius:radius.pill,alignItems:'center',justifyContent:'center'},secondaryText:{color:colors.text,fontSize:14,fontWeight:'700'},disabled:{opacity:0.5}});
