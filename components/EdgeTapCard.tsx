import Image from 'next/image';
type Props={username?:string;className?:string;rotate?:boolean;highPriority?:boolean};
export default function EdgeTapCard({className='',rotate=false,highPriority=false}:Props){return <div className={`relative w-full select-none ${rotate?'animate-wobble':''} ${className}`}><Image src="/card-designs/maincard-v2.webp" alt="EdgeTap NFC business card" draggable={false} loading={highPriority?'eager':'lazy'} fetchPriority={highPriority?'high':undefined} width={1872} height={1064} className="block h-auto w-full rounded-lg shadow-[var(--shadow-card)]"/></div>;}
