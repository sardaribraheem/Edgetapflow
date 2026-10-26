import {getSupabase} from './supabase';
import type {Profile} from './data/profile';
export type FreeProfileInput=Pick<Profile,'username'|'displayName'|'title'|'bio'|'location'|'avatar'|'links'>;
async function rpc<T>(name:string,args:Record<string,unknown>={}):Promise<T>{const {data,error}=await getSupabase().rpc(name,args);if(error)throw error;return data as T;}
export const getMyFreeProfile=()=>rpc<Profile|null>('get_my_free_website_profile');
export const createFreeProfile=(profile:FreeProfileInput,key:string)=>rpc<Profile>('create_free_website_profile',{p_profile:profile,p_request_key:key});
export const freeHandleAvailable=(username:string)=>rpc<boolean>('website_handle_available',{p_username:username});
export const listManagedProfiles=(query='')=>rpc<Profile[]>('list_managed_website_profiles',{p_query:query});
export const setProfileVisibility=(profile:Profile,active:boolean)=>rpc<Profile>('admin_set_profile_visibility',{p_id:profile.profileId,p_active:active,p_version:profile.version});
