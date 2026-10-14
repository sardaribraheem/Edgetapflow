import type { Order } from '@/lib/data/order';

export default function OrderJourney({order}:{order:Order}) {
  const stages:Record<string,number>={new:94,paid:96,profile_created:97,production_ready:97,printing:98,ready_for_nfc:98,nfc_programmed:99,qa_passed:99,ready_to_ship:99,ready_for_pickup:99,shipped:99,delivered:100,picked_up:100,completed:100};
  const progress=['cancelled','rejected'].includes(order.applicationStatus||'')?0:stages[order.fulfillment.status]||94;
  return <div role="progressbar" aria-label="Order progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} className="builder-progress-track"><span style={{transform:`scaleX(${progress/100})`}}/></div>;
}
