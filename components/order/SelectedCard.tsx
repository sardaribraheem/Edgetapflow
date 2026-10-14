import type { WizardDraft } from '@/lib/application';
import { CARD_TEMPLATES, calculateSubtotal } from '@/lib/data/order';
import Icon from '@/components/ui/Icon';

export default function SelectedCard({draft}:{draft:WizardDraft}) {
  return <div className="selected-card-summary" aria-label="Selected card"><span className="selected-card-mini"><Icon name="card" size={28}/><strong>EdgeTap</strong></span><div><strong className="font-display">{CARD_TEMPLATES.find(card=>card.id===draft.cardTemplate)?.name||'Your card'}</strong><p className="text-xs">{draft.quantity} × Rs. 999</p><p className="mt-1 text-sm font-bold">Rs. {calculateSubtotal(draft.quantity).toLocaleString()}</p></div></div>;
}
