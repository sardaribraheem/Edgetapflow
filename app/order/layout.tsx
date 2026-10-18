import OrderDoodles from '@/components/order/OrderDoodles';
export const metadata = { robots: { index: false, follow: false } };
export default function PrivateLayout({ children }: { children: React.ReactNode }) { return <div className="order-page-shell"><OrderDoodles />{children}</div>; }
