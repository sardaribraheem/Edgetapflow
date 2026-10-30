import Link from 'next/link';
import type {Profile} from '@/lib/data/profile';
export default function ProfilePlanNotice({profile,allowRenew=true}:{profile:Profile;allowRenew?:boolean}){
 const p=profile.plan;if(!p||p.status==='legacy')return null;
 const until=p.paidUntil&&(!p.trialUntil||new Date(p.paidUntil)>=new Date(p.trialUntil))?p.paidUntil:p.trialUntil;
 return <aside className="my-5 rounded-xl border border-[var(--ink-wash)] bg-[var(--yellow-soft)] p-4 text-sm" aria-label="Profile service period"><p className="font-bold">{p.status==='trial'?'Your 14-day profile trial':p.status==='annual'?'Your annual profile service':'Your trial or annual service has ended'}</p>{until&&<p className="mt-2">{p.status==='expired'?'Ended':'Available until'} {new Date(until).toLocaleString()}.</p>}<p className="mt-2">{p.status==='expired'?'Your draft and handle are kept. Renew this same profile to make an expired service available again.':'Renewal keeps this profile and URL. Hardware is a separate one-time purchase.'} Staff visibility restrictions remain separate.</p>{allowRenew&&<Link href={'/order?item=profile-annual&profileId='+encodeURIComponent(profile.profileId||'')} className="mt-3 inline-block font-bold underline">{p.status==='expired'?'Renew this profile':'Review annual service'}</Link>}</aside>;
}
