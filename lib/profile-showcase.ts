import {boundedRpcRead} from './rpc-read';
import {getSupabase} from './supabase';
import {compressPublicImage} from './image-upload';
export const SHOWCASE_SECTIONS=['media','services','hours','review'] as const;
export type ShowcaseSection=typeof SHOWCASE_SECTIONS[number];
export const SHOWCASE_LABELS:Record<ShowcaseSection,string>={media:'Photos & videos',services:'Services',hours:'Business hours',review:'Google review link'};
export type ShowcasePhoto={id:string;path:string;alt:string;caption:string;visible:boolean};
export type ShowcaseVideo={id:string;url:string;title:string;visible:boolean};
export type ProfileShowcase={order:ShowcaseSection[];visible:Record<ShowcaseSection,boolean>;photos:ShowcasePhoto[];videos:ShowcaseVideo[]};
export type ShowcaseLimits={photos:number;videos:number;expanded:boolean;until:string|null;storedPhotos:number;uploadSlots:number};
export type ShowcaseState={capacityVersion:number;version:number;data:ProfileShowcase;limits:ShowcaseLimits;assets:{path:string}[]};
export type MediaPolicy={version:number;freePhotos:number;freeVideos:number;premiumPhotos:number;premiumVideos:number;premiumPrice:number;premiumPurchasable:false;maxInputMb:number;maxPhotoBytes:number};
export const emptyShowcase=():ProfileShowcase=>({order:[...SHOWCASE_SECTIONS],visible:{media:true,services:true,hours:true,review:true},photos:[],videos:[]});
export function normaliseVideoUrl(value:string):string|null{
 try{const u=new URL(value.trim());if(u.protocol!=='https:'||u.port||u.username||u.password)return null;const host=u.hostname.toLowerCase();let id='';
  if(host==='youtu.be')id=u.pathname.slice(1);
  else if(['youtube.com','www.youtube.com','m.youtube.com'].includes(host))id=u.pathname==='/watch'?u.searchParams.get('v')||'':/^\/(shorts|embed)\/([\w-]+)$/.exec(u.pathname)?.[2]||'';
  if(/^[\w-]{11}$/.test(id))return 'https://www.youtube.com/watch?v='+id;
  if(['vimeo.com','www.vimeo.com'].includes(host)&&/^\/[0-9]{6,12}$/.test(u.pathname))return 'https://vimeo.com'+u.pathname;
 }catch{}return null;
}
export function videoEmbedUrl(value:string):string|null{const url=normaliseVideoUrl(value);if(!url)return null;return url.includes('youtube.com')?'https://www.youtube-nocookie.com/embed/'+new URL(url).searchParams.get('v')+'?rel=0':'https://player.vimeo.com/video/'+new URL(url).pathname.slice(1)+'?dnt=1';}
export function showcasePhotoUrl(path:string):string|null{if(!/^[a-f0-9-]{36}\/[a-f0-9-]{36}\.(webp|png|jpg)$/.test(path))return null;return getSupabase().storage.from('profile-media').getPublicUrl(path).data.publicUrl;}
export async function getShowcase(id:string):Promise<ShowcaseState>{return boundedRpcRead('get_my_profile_showcase',{p_id:id});}
export async function getMediaPolicy():Promise<MediaPolicy>{return boundedRpcRead('get_profile_media_policy');}
export async function saveShowcase(id:string,data:ProfileShowcase,version:number):Promise<ShowcaseState>{const {data:saved,error}=await getSupabase().rpc('save_my_profile_showcase',{p_id:id,p_data:data,p_version:version});if(error)throw new Error(error.code==='40001'?'Your page changed in another tab. Reload your saved layout before retrying.':'Check your media allowance, photo descriptions, video links and section order, then retry.');return saved;}
export async function uploadShowcasePhoto(id:string,file:File):Promise<ShowcasePhoto>{const photo=await compressPublicImage(file,'gallery'),assetId=crypto.randomUUID(),ext=photo.type==='image/webp'?'webp':photo.type==='image/png'?'png':'jpg',path=id+'/'+assetId+'.'+ext;const {error}=await getSupabase().storage.from('profile-media').upload(path,photo,{contentType:photo.type,upsert:false});if(error)throw new Error('Photo upload could not be confirmed. Check your saved media and unused uploads before retrying; your allowance may be full.');return {id:assetId,path,alt:'',caption:'',visible:true};}
export async function deleteUnusedShowcasePhoto(path:string):Promise<void>{const {error}=await getSupabase().storage.from('profile-media').remove([path]);if(error)throw new Error('The unused file could not be deleted. Reload saved media and retry; files still used on the saved page are protected.');}
export async function grantMediaCapacity(id:string,until:string|null,reason:string,version:number):Promise<ShowcaseState>{const {data,error}=await getSupabase().rpc('admin_set_profile_media_capacity',{p_id:id,p_until:until,p_reason:reason,p_version:version});if(error)throw new Error('Capacity could not be confirmed. Use a future date within one year, a reason and the latest saved version.');return data;}
