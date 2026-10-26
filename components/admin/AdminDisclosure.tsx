"use client";

import {useId,useState,type ReactNode} from 'react';

export default function AdminDisclosure({title,children,defaultOpen=false}:{title:string;children:ReactNode;defaultOpen?:boolean}) {
  const id=useId();
  const [expanded,setExpanded]=useState(defaultOpen);
  const [mounted,setMounted]=useState(defaultOpen);
  return <details className="staff-section admin-disclosure" open={expanded} onToggle={event=>{
    const open=event.currentTarget.open;
    setExpanded(open);
    if(open)setMounted(true);
  }}>
    <summary aria-controls={id} aria-expanded={expanded}>
      <span className="font-display text-xl">{title}</span>
      <span className="admin-disclosure-toggle" aria-hidden="true">{expanded?'Collapse −':'Expand +'}</span>
    </summary>
    {mounted&&<div id={id} className="mt-4">{children}</div>}
  </details>;
}
