import Image from 'next/image';
import Icon from './ui/Icon';

export default function EdgeTapCardBack({ className = '' }: { className?: string }) {
  return <div className={`edgetap-card-back ${className}`}>
    <span className="font-display font-semibold">One tap. Stay connected.</span>
    <Image src="/brand-profile-qr.png" alt="Scan to open Ibraheem's EdgeTap profile" width={100} height={100} draggable={false}/>
    <span className="card-back-caption"><Icon name="qr" size={14}/> Scan to connect</span>
  </div>;
}
