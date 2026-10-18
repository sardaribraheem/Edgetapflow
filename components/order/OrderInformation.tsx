"use client";
import { createContext, useContext, useState, type ComponentProps, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import InfoHelp from '@/components/ui/InfoHelp';

const InformationTarget = createContext<HTMLElement | null | undefined>(undefined);
export function OrderInformation({ children }: { children: ReactNode }) {
  const [target, setTarget] = useState<HTMLDivElement | null>(null);
  return <InformationTarget.Provider value={target}>{children}<div className="order-information"><InfoHelp title="Information" label="Information"><div ref={setTarget}/></InfoHelp></div></InformationTarget.Provider>;
}
export function OrderHelp(props: ComponentProps<typeof InfoHelp>) {
  const target = useContext(InformationTarget);
  if (target === undefined) return <InfoHelp {...props}/>;
  return target ? createPortal(<section className="order-information-topic"><h3 className="font-display text-lg font-semibold">{props.title}</h3>{props.children}</section>, target) : null;
}
