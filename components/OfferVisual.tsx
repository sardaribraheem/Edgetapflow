import Image from 'next/image';
import CardStack from './CardStack';
import PhoneProfile from './PhoneProfile';
import { InstagramIcon, WhatsAppIcon, LinkedInIcon } from './doodles';

export default function OfferVisual({ kind }: { kind: string }) {
  if (kind === '02') return <div className="offer-profile-visual"><PhoneProfile/></div>;
  if (kind === '03') return <div className="offer-qr-visual"><CardStack/></div>;
  return <div className="offer-card-gallery">
    <Image src="/card-designs/maincard-v2.webp" alt="EdgeTap main card" width={300} height={171}/>
    {[{ label: 'Instagram', icon: InstagramIcon, color: '#a73566' }, { label: 'WhatsApp', icon: WhatsAppIcon, color: '#176343' }, { label: 'LinkedIn', icon: LinkedInIcon, color: '#135b8e' }].map(({ label, icon: Mark, color }) => <div key={label} className="social-card-example" style={{ background: color }}><Mark className="h-7 w-7"/><span>{label}</span><span className="text-[9px]">Tap to connect</span></div>)}
  </div>;
}
