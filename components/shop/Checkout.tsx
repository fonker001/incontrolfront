/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Smartphone, Wallet, CreditCard, ArrowLeft } from "lucide-react";

import { salesApi } from "@/lib/api/salesApi";
import { paymentsApi } from "@/lib/api/paymentsApi";

type PaymentMethod = "mpesa" | "cash" | "card";

export default function Checkout() {
  const router = useRouter();

  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    delivery_address: "",
    notes: "",
    payment_method: "mpesa" as PaymentMethod,
  });

  /* -------------------- LOAD CART -------------------- */
  useEffect(() => {
    const storedCart = salesApi.getCartFromStorage();
    setCart(storedCart);

    if (!storedCart || storedCart.length === 0) {
      toast.error("Your cart is empty");
      router.push("/cart");
    }
  }, [router]);

  const cartTotal = salesApi.calculateCartTotal(cart);

  /* -------------------- FORM HANDLING -------------------- */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* -------------------- SUBMIT -------------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    if (
      !formData.customer_name.trim() ||
      !formData.customer_phone.trim() ||
      !formData.delivery_address.trim()
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    if (formData.payment_method === "mpesa") {
      const phoneRegex = /^(07|01)\d{8}$/;
      if (!phoneRegex.test(formData.customer_phone)) {
        toast.error("Enter a valid Kenyan phone number (0712345678)");
        return;
      }
    }

    setLoading(true);

    try {
      /* ---------------- MPESA FLOW ---------------- */
      if (formData.payment_method === "mpesa") {
        // ✅ CORRECT: One API call that creates sale AND initiates payment
        const response = await paymentsApi.initiatePayment({
          phone_number: formData.customer_phone,
          shipping_address: formData.delivery_address,
          items: cart.map((item) => ({
            product: item.product_id,
            quantity: item.quantity,
            price_at_sale: item.unit_price,
          })),
        });

        toast.success("M-Pesa prompt sent. Check your phone and enter PIN.");
        
        // Clear cart and redirect
        salesApi.clearCart();
        router.push(`/order/${response.sale_id}?payment=pending`);
        return;
      }

      /* ---------------- CASH / OTHER FLOW ---------------- */
      // ✅ This will work once you add the cash sale endpoint
      if (formData.payment_method === "cash") {
        toast.error("Cash on delivery coming soon");
        return;
        
        // When implemented:
        // const sale = await salesApi.createCashSale({
        //   shipping_address: formData.delivery_address,
        //   items: cart.map((item) => ({
        //     product: item.product_id,
        //     quantity: item.quantity,
        //     price_at_sale: item.unit_price,
        //   })),
        // });
        // toast.success("Order placed successfully");
        // salesApi.clearCart();
        // router.push(`/order/${sale.id}?payment=cash`);
      }

      if (formData.payment_method === "card") {
        toast.error("Card payments coming soon");
        return;
      }
      
    } catch (error: any) {
      toast.error(error.message || "Checkout failed");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- UI -------------------- */
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => router.push("/cart")}
          className="flex items-center text-sm text-emerald-600 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Cart
        </button>

        <h1 className="text-2xl font-bold mb-6">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ---------------- FORM ---------------- */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-lg border">
              <h2 className="font-semibold mb-4">Customer Information</h2>

              <input
                type="text"
                name="customer_name"
                placeholder="Full Name"
                value={formData.customer_name}
                onChange={handleChange}
                className="input"
                required
              />

              <input
                type="email"
                name="customer_email"
                placeholder="Email (optional)"
                value={formData.customer_email}
                onChange={handleChange}
                className="input"
              />

              <input
                type="tel"
                name="customer_phone"
                placeholder="0712345678"
                value={formData.customer_phone}
                onChange={handleChange}
                className="input"
                required
              />

              <textarea
                name="delivery_address"
                placeholder="Delivery address"
                value={formData.delivery_address}
                onChange={handleChange}
                className="input"
                required
              />
            </div>

            <div className="bg-white p-6 rounded-lg border">
              <h2 className="font-semibold mb-4">Payment Method</h2>

              <label className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer bg-emerald-50 border-emerald-200">
                <input 
                  type="radio" 
                  name="payment_method"
                  value="mpesa" 
                  checked={formData.payment_method === "mpesa"} 
                  onChange={handleChange}
                  className="h-4 w-4 text-emerald-600" 
                />
                <Smartphone className="h-4 w-4 text-emerald-600" />
                <span className="flex-1">M-Pesa</span>
                <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded">Active</span>
              </label>

              <label className="flex items-center gap-2 p-2 border rounded-lg mt-2 opacity-60 cursor-not-allowed">
                <input 
                  type="radio" 
                  name="payment_method"
                  value="cash" 
                  checked={formData.payment_method === "cash"} 
                  onChange={handleChange}
                  disabled 
                  className="h-4 w-4" 
                />
                <Wallet className="h-4 w-4" />
                <span className="flex-1">Cash on Delivery</span>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Soon</span>
              </label>

              <label className="flex items-center gap-2 p-2 border rounded-lg mt-2 opacity-40 cursor-not-allowed">
                <input 
                  type="radio" 
                  name="payment_method"
                  value="card" 
                  checked={formData.payment_method === "card"} 
                  onChange={handleChange}
                  disabled 
                  className="h-4 w-4" 
                />
                <CreditCard className="h-4 w-4" />
                <span className="flex-1">Card Payment</span>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Soon</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || formData.payment_method !== "mpesa"}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? "Processing..."
                : `Pay with M-Pesa - KES ${cartTotal.toFixed(0)}`}
            </button>
          </form>

          {/* ---------------- SUMMARY ---------------- */}
          <div className="bg-white p-6 rounded-lg border h-fit sticky top-4">
            <h2 className="font-semibold mb-4">Order Summary</h2>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {cart.map((item) => (
                <div key={item.product_id} className="flex justify-between text-sm py-1">
                  <span className="truncate pr-2">
                    {item.product_name} × {item.quantity}
                  </span>
                  <span className="font-medium whitespace-nowrap">
                    KES {(item.quantity * item.unit_price).toFixed(0)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t mt-4 pt-4 flex justify-between font-bold">
              <span>Total</span>
              <span className="text-emerald-700">
                KES {cartTotal.toFixed(0)}
              </span>
            </div>

            <p className="text-xs text-gray-500 mt-4">
              You will receive an M-Pesa prompt on {formData.customer_phone || "your phone"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}