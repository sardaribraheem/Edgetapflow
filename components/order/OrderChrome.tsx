"use client";

import type { ComponentProps, ReactNode } from "react";
import Link from "next/link";
import Icon, { type IconName } from "@/components/ui/Icon";
import InfoHelp from "@/components/ui/InfoHelp";

const icons: Record<string, IconName> = { Card: "card", Profile: "user", Links: "link", Preview: "eye", Fulfillment: "truck", "Save profile": "save", JazzCash: "receipt", Submit: "check" };
const stepIcon = (label: string): IconName => icons[label] || "card";

export function OrderProgress({ steps, step, cardSelected = true }: { steps: string[]; step: number; cardSelected?: boolean }) {
  const weights:Record<string,number>={Card:cardSelected?40:0,Profile:50,Links:60,Preview:70,Fulfillment:78,'Save profile':82,JazzCash:88,Submit:94};
  const progress=weights[steps[step]]??0;
  return <div className="builder-progress"><div role="progressbar" aria-label="Card setup progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} className="builder-progress-track"><span style={{transform:`scaleX(${progress/100})`}}/></div><ol aria-label="Application progress" className="order-progress">{steps.map((label, index) => <li key={label} aria-current={step === index ? "step" : undefined} aria-label={`${index + 1}. ${label}${index < step ? ", completed" : ""}`} className={`${index === step ? "is-current" : ""} ${index < step ? "is-complete" : ""}`}>
    <span className="order-step-icon"><Icon name={index < step ? "check" : stepIcon(label)} size={20} /></span><span className="order-step-label">{label}</span>
  </li>)}</ol></div>;
}

export function DraftStatus({ status, onSave, onClear, disabled, children }: { status: string; onSave: () => void; onClear?: () => void; disabled: boolean; children: ReactNode }) {
  return <div className="draft-status">
    <Icon name={status==='Saved'?'check':'save'} size={18} /><p role="status" className={['Saved','Ready'].includes(status)?'sr-only':''}>{status}</p>
    <div className="draft-actions">
      <button type="button" aria-label="Save draft now" title="Save draft now" disabled={disabled} className="icon-button" onClick={onSave}><Icon name="save" size={18} /></button>
      {onClear && <button type="button" aria-label="Clear device draft" title="Clear device draft" disabled={disabled} className="icon-button" onClick={onClear}><Icon name="trash" size={18} /></button>}
      <InfoHelp title="Your saved draft">{children}</InfoHelp>
    </div>
  </div>;
}

export function OrderNotes({ guest = false, onTermsNavigate }: { guest?: boolean; onTermsNavigate?: ComponentProps<typeof Link>["onNavigate"] }) {
  return <div className="order-notes">
    <InfoHelp title="Final-design review" label="Design review">
      <p>{guest ? "Every personalized card receives a final-design email before printing. Reply within 10 hours of sending to confirm or request changes. With no timely reply, staff checks the inbox and confirms the design after the window." : "Every personalized card requires a final-design email before printing. Reply within 10 hours of sending to confirm or request changes. If there is no timely reply, staff checks the inbox and confirms the design after the window. The timer starts only after the email is actually sent."}</p>
    </InfoHelp>
    <InfoHelp title="Personalized-card terms" label="Card terms">
      <p>{guest ? "Personalized cards are non-returnable/non-refundable once production starts, except where applicable law requires otherwise. Contact EdgeTap about damage, defects or EdgeTap errors." : "Personalized cards are non-returnable and non-refundable once production starts, except where applicable law requires otherwise. Contact EdgeTap about damage, defects, EdgeTap printing errors or a wrongly supplied card. Check your supplied details before approving production."}</p>
      <Link href="/terms" onNavigate={onTermsNavigate} className="font-bold underline">Read the personalized-card terms</Link>
    </InfoHelp>
  </div>;
}
