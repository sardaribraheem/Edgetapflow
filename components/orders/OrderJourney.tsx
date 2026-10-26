import type {Order} from '@/lib/data/order';
export default function OrderJourney({order:o}:{order:Order}){
 const received=['delivered','picked_up','completed'].includes(o.fulfillment.status),tag=o.physicalFormat==='nfc_tag',digital=o.physicalFormat==='profile_only';
 const reviewDone=o.staffReviewComplete||o.applicationStatus==='accepted';
 const stages=[
  {label:'Your profile / link',done:!!o.nfcUrl,detail:o.nfcUrl?'Live and ready to share':'Not published yet'},
  {label:'Payment',done:o.payment.status==='paid',detail:o.payment.status==='paid'?'Verified':o.payment.status==='failed'?'Contact EdgeTap':'Awaiting verification'},
  {label:'Order review',done:reviewDone,detail:reviewDone?'Review complete':o.staffReviewStarted||o.applicationStatus==='under_review'?'Review started':'Not started (optional)'},
  {label:digital?'Digital profile':tag?'Your NFC tag':'Your card',done:digital?!!o.profileId:received,detail:digital?o.profileId?'Live':'Not published yet':received?'Received':o.fulfillment.status==='ready_for_pickup'?'Ready to collect':o.fulfillment.status==='shipped'?'On the way':tag?['nfc_programmed','qa_passed','ready_to_ship'].includes(o.fulfillment.status)?'Tag programmed':'Tag preparation':o.fulfillment.status==='printing'?'Printing':'Preparation'},
 ];
 return <ol className="order-journey" aria-label="Order stages">{stages.map(stage=><li key={stage.label} data-complete={stage.done}>{stage.label}<small>{stage.detail}</small></li>)}</ol>;
}
