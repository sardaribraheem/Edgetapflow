import OrderWizard from "@/components/order/OrderWizard";

export const metadata = {
  title: "Build your EdgeTap",
  description:
    "Choose your card, build your profile, add links, and order your EdgeTap NFC card. One tap. Infinite possibilities.",
};

export default function OrderPage() {
  return <OrderWizard />;
}