import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useLocalData } from '../contexts/LocalDataContext';
import { saveFollowedArtist } from '../services/followedArtists.mjs';
import { colors, radius } from '../theme';
export default function FollowArtistButton({artist}) {
 const {localData,state}=useLocalData(),followed=!!state.data?.followedArtists.some(item=>item.artist.id===artist.id),disabled=state.status!=='ready';
 function press(){if(localData.getSnapshot().status!=='ready')return;saveFollowedArtist(localData,artist,!followed).catch(()=>{/* Aviso global oferece recuperação. */});}
 return <Pressable accessibilityRole="button" accessibilityLabel={(followed?'Deixar de acompanhar localmente ':'Acompanhar localmente ')+artist.title} accessibilityState={{selected:followed,disabled}} disabled={disabled} onPress={press} style={[styles.button,disabled&&styles.disabled]}><Text style={styles.text}>{followed?'Acompanhando neste aparelho':'Acompanhar neste aparelho'}</Text></Pressable>;
}
const styles=StyleSheet.create({button:{minHeight:48,paddingHorizontal:18,paddingVertical:12,justifyContent:'center',borderRadius:radius.pill,borderWidth:1,borderColor:colors.green,alignSelf:'flex-start'},text:{color:colors.green,fontSize:14,fontWeight:'700'},disabled:{opacity:0.5}});
