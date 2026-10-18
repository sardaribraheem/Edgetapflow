"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import Icon from "./Icon";

export default function InfoHelp({ title, label, children }: { title: string; label?: string; children: ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const previousOverflow = useRef("");
  const opened = useRef(false);
  const id = useId();
  const [expanded,setExpanded]=useState(false);
  useEffect(() => () => { if (opened.current) document.body.style.overflow = previousOverflow.current; }, []);
  const open = () => {
    if (!dialog.current || dialog.current.open) return;
    previousOverflow.current = document.body.style.overflow;
    dialog.current.showModal();
    opened.current = true; setExpanded(true);
    document.body.style.overflow = "hidden";
  };
  const closed = () => {
    if (opened.current) document.body.style.overflow = previousOverflow.current;
    opened.current = false; setExpanded(false);
    trigger.current?.focus();
  };
  const close = () => { dialog.current?.close(); closed(); };
  return <>
    <button ref={trigger} type="button" className={label ? "info-help info-help-label" : "info-help"} aria-label={label || `About ${title.toLowerCase()}`} aria-haspopup="dialog" aria-expanded={expanded} onClick={open}>
      <Icon name="info" size={18} />{label && <span>{label}</span>}
    </button>
    <dialog ref={dialog} aria-labelledby={id} className="help-dialog" onClose={closed} onCancel={event => { event.stopPropagation(); event.preventDefault(); close(); }} onClick={event => { if (event.target === event.currentTarget) close(); }} onKeyDown={event => {
      if (event.key !== "Tab") return;
      const elements = event.currentTarget.querySelectorAll<HTMLElement>('a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]');
      const first = elements[0], last = elements[elements.length - 1];
      if (!first) { event.preventDefault(); return; }
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }}>
      <div className="help-dialog-content">
        <header><h2 id={id} className="font-display">{title}</h2><button type="button" aria-label="Close information" className="icon-button" onClick={close}><Icon name="close" /></button></header>
        <div className="help-dialog-copy">{children}</div>
      </div>
    </dialog>
  </>;
}
