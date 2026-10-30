import {boundedRpcRead} from './rpc-read';
export type ProfilePlan={status:'legacy'|'trial'|'annual'|'expired';legacyRights:boolean;trialUntil?:string|null;paidUntil?:string|null};
export type ProfilePlanPolicy={trialDays:number;accountKnown:boolean;newAccountTrial:boolean;futureAccountTrial:boolean;annualPrice:number;annualAvailable:boolean};
export async function getProfilePlanPolicy():Promise<ProfilePlanPolicy>{try{return await boundedRpcRead('get_profile_plan_policy');}catch{throw new Error('Profile terms could not be checked. Reload before publishing.');}}
export async function getPublicProfileStatus(username:string):Promise<string>{return boundedRpcRead('get_public_profile_status',{p_username:username},3000);}
