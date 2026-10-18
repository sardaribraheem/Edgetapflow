import { NfcWaves, QrDoodle, StarDoodle, SparkleDoodle, ChainLink } from '@/components/doodles';

export default function OrderDoodles() {
  return <div className="order-floating-icons" aria-hidden="true">
    <NfcWaves /><StarDoodle /><ChainLink /><QrDoodle /><SparkleDoodle />
  </div>;
}
