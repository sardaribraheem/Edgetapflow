import type { Order } from '@/lib/data/order';

export default function OrderJourney({order}:{order:Order}) {
  const closed=['cancelled','rejected'].includes(order.applicationStatus||'');
  const received=['delivered','picked_up','completed'].includes(order.fulfillment.status);
  const designApproved=['approved','approved_no_response','not_required'].includes(order.designProofStatus||'');
  const stages=[
    {label:'Payment verification',done:order.payment.status==='paid',detail:order.payment.status==='paid'?'Verified':order.payment.status==='failed'?'New payment proof needed':'Verification pending'},
    {label:'Order review',done:order.applicationStatus==='accepted',detail:order.applicationStatus==='accepted'?'Order approved':order.applicationStatus==='changes_required'?'Changes needed':closed?'Order closed':'Approval pending'},
    {label:'Design approval',done:designApproved,detail:order.designProofStatus==='not_required'?'Not required for this order':designApproved?'Design approved':order.designProofStatus==='awaiting_response'?'Your approval needed':order.designProofStatus==='changes_requested'?'Design changes requested':'Not approved yet'},
    {label:'Your card',done:received,detail:received?'Received':order.fulfillment.status==='printing'?'Printing':order.fulfillment.status==='ready_for_pickup'?'Ready to collect':order.fulfillment.status==='shipped'?'On the way':'Not ready yet'},
  ];
  const current=closed?-1:stages.findIndex(stage=>!stage.done);
  return <ol className="order-journey" aria-label="Order stages">{stages.map((stage,index)=><li key={stage.label} data-complete={stage.done} aria-current={index===current?'step':undefined}>{stage.label}<small>{stage.detail}</small></li>)}</ol>;
}
