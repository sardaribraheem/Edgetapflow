"use client";

import type { ComponentProps, ReactNode } from "react";
import Link from "next/link";
import Icon, { type IconName } from "@/components/ui/Icon";
import InfoHelp from "@/components/ui/InfoHelp";

const icons: Record<string, IconName> = { Card: "card", Profile: "user", Links: "link", Preview: "eye", Fulfillment: "truck", "Save profile": "save", JazzCash: "receipt", Submit: "check" };
const stepIcon = (label: string): IconName => icons[label] || "card";

export function OrderProgress({ steps, step }: { steps: string[]; step: number }) {
  return <ol aria-label="Application progress" className="order-progress">{steps.map((label, index) => <li key={label} aria-current={step === index ? "step" : undefined} aria-label={`${index + 1}. ${label}${index < step ? ", completed" : ""}`} className={`${index === step ? "is-current" : ""} ${index < step ? "is-complete" : ""}`}>
    <span className="order-step-icon"><Icon name={index < step ? "check" : stepIcon(label)} size={20} /></span><span className="order-step-label">{label}</span>
  </li>)}</ol>;
}

export function DraftStatus({ status, onSave, onClear, disabled, children }: { status: string; onSave: () => void; onClear?: () => void; disabled: boolean; children: ReactNode }) {
  return <div className="draft-status">
    <Icon name="save" size={18} /><p role="status">{status}</p>
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
    <a className="icon-attribution" href="/icons/streamline/LICENSE.txt" aria-label="Streamline icon credits">Icons by Streamline</a>
  </div>;
}
