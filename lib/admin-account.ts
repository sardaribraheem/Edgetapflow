export type StaffAccount = {
  customerId: string;
  userId: string | null;
  email: string | null;
  kind: 'login' | 'staff_managed';
};

// A submitted contact email is not a customer/account identifier.
export function orderCustomerKey(order: {account?: StaffAccount | null; id?: string; orderNumber: string}) {
  return order.account?.customerId || `order:${order.id || order.orderNumber}`;
}
