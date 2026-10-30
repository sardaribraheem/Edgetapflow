import {getSupabase} from './supabase';
// Bound visible catalog/terms loading even if Auth token refresh or transport stalls.
export async function boundedRpcRead<T>(name:string,args:Record<string,unknown>={},timeoutMs=10000):Promise<T>{
 const controller=new AbortController();let timer:ReturnType<typeof setTimeout>|undefined;
 try{
  const deadline=new Promise<never>((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(new Error('This read timed out. Please retry.'));},timeoutMs);});
  const request=Promise.resolve(getSupabase().rpc(name,args).abortSignal(controller.signal));
  const {data,error}=await Promise.race([request,deadline]);if(error)throw error;return data as T;
 }finally{clearTimeout(timer);}
}
