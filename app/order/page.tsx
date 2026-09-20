import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OrderWizard from "@/components/order/OrderWizard";

export const metadata = {
  title: "Build your EdgeTap",
  description:
    "Choose your card, build your profile, add links, and order your EdgeTap NFC card. One tap. Infinite possibilities.",
};

export default function OrderPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[--cream]">
      <Navbar />
      <main className="flex-1">
        <OrderWizard />
      </main>
      <Footer />
    </div>
  );
}