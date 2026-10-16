import type { WizardDraft } from '@/lib/application';
import { CARD_TEMPLATES, cardPrice, calculateSubtotal } from '@/lib/data/order';

export default function SelectedCard({draft}:{draft:WizardDraft}) {
  return <div className="selected-card-summary" aria-label="Selected card"><div><strong className="font-display">{CARD_TEMPLATES.find(card=>card.id===draft.cardTemplate)?.name||'Your card'}</strong><p className="text-xs">{draft.quantity} × Rs. {cardPrice(draft.product||'standard').toLocaleString()}</p><p className="mt-1 text-sm font-bold">Rs. {calculateSubtotal(draft.quantity,draft.product||'standard').toLocaleString()}</p></div></div>;
}
