import { snapshotArtist, LOCAL_DATA_LIMITS } from '../storage/localDataSchema.mjs';
import { LocalDataError } from '../storage/localDataErrors.mjs';
export function changeFollowedArtist(data,value,followed,now=Date.now()) {
 if(typeof followed!=='boolean')throw new LocalDataError('invalid_data');
 const artist=snapshotArtist(value),exists=data.followedArtists.some(item=>item.artist.id===artist.id);
 if(exists===followed)return data;
 if(!followed)return {...data,followedArtists:data.followedArtists.filter(item=>item.artist.id!==artist.id)};
 if(data.followedArtists.length>=LOCAL_DATA_LIMITS.followedArtists)throw new LocalDataError('too_large');
 if(!Number.isSafeInteger(now)||now<0)throw new LocalDataError('invalid_data');
 return {...data,followedArtists:[{artist,savedAt:now},...data.followedArtists]};
}
export const saveFollowedArtist=(localData,artist,followed)=>localData.update(current=>changeFollowedArtist(current,artist,followed));
