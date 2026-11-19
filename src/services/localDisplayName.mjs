import { LocalDataError } from '../storage/localDataErrors.mjs';
export function normalizeLocalDisplayName(value) {
 if(typeof value!=='string'||/[\u0000-\u0008\u000E-\u001F\u007F]/.test(value))throw new LocalDataError('invalid_display_name');
 const name=value.trim().replace(/\s+/g,' ');
 if(!name||name.length>80)throw new LocalDataError('invalid_display_name');
 return name;
}
export function changeLocalDisplayName(data,value) {
 const name=value===null?null:normalizeLocalDisplayName(value);
 return data.preferences.displayName===name?data:{...data,preferences:{...data.preferences,displayName:name}};
}
export const saveLocalDisplayName=(localData,value)=>localData.update(current=>changeLocalDisplayName(current,value));
export const displayNameForAccount=(data,fallback)=>data?.preferences.displayName||fallback;
