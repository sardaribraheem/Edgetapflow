import {getSupabase} from './supabase';
import type {Review} from './models';
export type ReviewCursor={rating:number;createdAt:string;id:string};
export type ReviewPage={reviews:Review[];hasMore:boolean;nextCursor:ReviewCursor|null};
export async function listWebsiteReviews(cursor:ReviewCursor|null=null):Promise<ReviewPage>{
 const {data,error}=await getSupabase().rpc('list_website_reviews',{p_limit:8,p_after_rating:cursor?.rating??null,p_after_created_at:cursor?.createdAt??null,p_after_id:cursor?.id??null});
 if(error)throw error;return data as ReviewPage;
}
export async function submitWebsiteReview(authorName:string,text:string,rating:number):Promise<void>{
 const {error}=await getSupabase().rpc('submit_website_review',{p_author_name:authorName.trim(),p_text:text.trim(),p_rating:rating});if(error)throw error;
}
