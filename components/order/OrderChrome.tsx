"use client";

import type { ComponentProps, ReactNode } from "react";
import Link from "next/link";
import Icon, { type IconName } from "@/components/ui/Icon";
import { OrderHelp as InfoHelp } from "./OrderInformation";

const icons: Record<string, IconName> = { Review:'eye','Profile preview':'eye',Details:'user',Link:'link', 'Save order':'save', Card: "card", Profile: "user", Links: "link", Preview: "eye", Fulfillment: "truck", "Save profile": "save", Payment: "receipt",JazzCash: "receipt", Submit: "check" };
const stepLabel = (label:string) => label==='Fulfillment'?'Delivery / pickup':label==='Save profile'||label==='Save order'?'Save to account':label;
const stepIcon = (label: string): IconName => icons[label] || "card";

export function OrderProgress({ steps, step, cardSelected = true }: { steps: string[]; step: number; cardSelected?: boolean }) {
  const weights:Record<string,number>={Details:50,Review:70,'Profile preview':70,Link:10,'Save order':82,Card:cardSelected?40:0,Profile:50,Links:60,Preview:70,Fulfillment:78,'Save profile':82,Payment:88,JazzCash:88,Submit:94};
  const progress=weights[steps[step]]??0;
  return <div className="builder-progress"><div role="progressbar" aria-label="Card setup progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} className="builder-progress-track"><span style={{transform:`scaleX(${progress/100})`}}/></div><ol aria-label="Application progress" className="order-progress">{steps.map((label, index) => <li key={label} aria-current={step === index ? "step" : undefined} aria-label={`${index + 1}. ${label}${index < step ? ", completed" : ""}`} className={`${index === step ? "is-current" : ""} ${index < step ? "is-complete" : ""}`}>
    <span className="order-step-icon"><Icon name={index < step ? "check" : stepIcon(label)} size={20} /></span><span className="order-step-label">{stepLabel(label)}</span>
  </li>)}</ol></div>;
}

export function DraftStatus({ onClear, disabled }: { status: string; onSave: () => void; onClear?: () => void; disabled: boolean; children: ReactNode }) {
  return onClear ? <div className="draft-tools"><button type="button" aria-label="Clear device draft" disabled={disabled} className="btn btn-ghost px-4 py-2 text-sm" onClick={()=>{if(window.confirm('Clear this card draft from this device? This cannot be undone.'))onClear();}}><Icon name="trash" size={18}/>Clear draft</button></div> : null;
}

export function OrderNotes({ guest = false, onTermsNavigate }: { guest?: boolean; onTermsNavigate?: ComponentProps<typeof Link>["onNavigate"] }) {
  return <div className="order-notes"><p className="mb-3 text-xs">Personalized cards can only be returned for defects, damage on arrival or an EdgeTap error. Record an unboxing video as proof. <Link href="/terms" onNavigate={onTermsNavigate} className="underline">Read the card policy</Link>.</p>
    <InfoHelp title="Saving your work"><p>Your draft saves automatically. Guest drafts stay on this device for up to seven days; clearing browser data removes them. After sign-in, saved applications are private to your account. If saving fails, keep the page open and retry.</p></InfoHelp>
    <InfoHelp title="Final-design review" label="Design review">
      <p>EdgeTap prepares the card proof after accepting your order. Review both sides in My orders. One revision request is included: put all changes in one note. Further edits need an agreed extra payment. Contact a professional graphic designer for a substantial redesign.</p>
      <p>Check both sides in My orders. The ten-hour review window starts only after the proof email is actually sent. Approve or request changes in My orders during that window; without a response there, the proof is approved for printing. Sharing or queueing alone never starts the timer.</p>
    </InfoHelp>
    <InfoHelp title="Personalized-card terms" label="Card terms">
      <p>{guest ? "Personalized cards are non-returnable/non-refundable once production starts, except where applicable law requires otherwise. Contact EdgeTap about damage, defects or EdgeTap errors." : "Personalized cards are non-returnable and non-refundable once production starts, except where applicable law requires otherwise. Contact EdgeTap about damage, defects, EdgeTap printing errors or a wrongly supplied card. Check your supplied details before approving production."}</p>
      <p>Record a clear video while opening your package. Keep it as proof if your card arrives damaged or defective. Damage caused after opening does not qualify.</p>
      <Link href="/terms" onNavigate={onTermsNavigate} className="font-bold underline">Read the personalized-card terms</Link>
    </InfoHelp>
  </div>;
}
