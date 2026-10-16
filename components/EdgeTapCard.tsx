import Image from 'next/image';
type Props={username?:string;className?:string;rotate?:boolean};
export default function EdgeTapCard({className='',rotate=false}:Props){return <div className={`relative w-full select-none ${rotate?'animate-wobble':''} ${className}`}><Image src="/card-designs/maincard.png" alt="EdgeTap physical card" width={1332} height={768} className="block h-auto w-full rounded-lg shadow-[var(--shadow-card)]"/></div>;}
