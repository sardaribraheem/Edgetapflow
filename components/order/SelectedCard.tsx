import type { WizardDraft } from '@/lib/application';
import { CARD_TEMPLATES, calculateSubtotal } from '@/lib/data/order';

export default function SelectedCard({draft}:{draft:WizardDraft}) {
  return <div className="selected-card-summary" aria-label="Selected card"><div><strong className="font-display">{CARD_TEMPLATES.find(card=>card.id===draft.cardTemplate)?.name||'Your card'}</strong><p className="text-xs">{draft.quantity} card{draft.quantity===1?'':'s'}{draft.offer?' · Bundle offer':''}</p><p className="mt-1 text-sm font-bold">Rs. {calculateSubtotal(draft.quantity,draft.product||'standard',draft.links.length,draft).toLocaleString("en",{useGrouping:false})}</p></div></div>;
}
