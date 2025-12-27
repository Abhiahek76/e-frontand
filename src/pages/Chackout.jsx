// src/pages/CheckoutPage.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard, Truck, Check, ShieldCheck } from "lucide-react";
import MainLayout from "../components/layout/MainLayout";
import { toast } from "react-hot-toast";
import { cn } from "../lib/util";

import { useDispatch, useSelector } from "react-redux";
import { fetchCart, clearCart } from "../store/cartSlice";

import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  selectCreatingOrder,
  selectVerifying,
  selectPaymentError,
} from "../store/paymentSlice";

const paymentMethods = [
  { id: "card", label: "Online Payment (Razorpay)", icon: CreditCard },
  { id: "cod", label: "Cash on Delivery", icon: Truck },
];

const btnBase =
  "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
const btnLg = "h-12 px-5";
const btnPrimary = "bg-primary text-primary-foreground hover:opacity-90";

function formatMoney(amount, currency = "INR", locale = "en-IN") {
  const n = Number(amount || 0);
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `${currency} ${n.toFixed(2)}`;
  }
}

function safeImg(url) {
  return url || "https://via.placeholder.com/600x800?text=No+Image";
}

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const cart = useSelector((s) => s.cart?.cart);
  const loading = useSelector((s) => s.cart?.loading);

  const creatingOrder = useSelector(selectCreatingOrder);
  const verifying = useSelector(selectVerifying);
  const paymentError = useSelector(selectPaymentError);

  useEffect(() => {
    if (!cart) dispatch(fetchCart());
  }, [dispatch, cart]);
  const items = cart?.items || [];

  const currency =
    cart?.computed?.currency ||
    items?.[0]?.unitPrice?.currency ||
    items?.[0]?.variantId?.price?.currency ||
    "INR";

  const subtotal = useMemo(() => {
    return (
      cart?.computed?.subtotal ??
      items.reduce((sum, it) => {
        const unit = it?.unitPrice?.amount ?? it?.variantId?.price?.amount ?? 0;
        return sum + unit * (it.quantity || 0);
      }, 0)
    );
  }, [cart, items]);

  const totalItems = useMemo(
    () => items.reduce((sum, it) => sum + (it.quantity || 0), 0),
    [items]
  );

  const FREE_SHIPPING_THRESHOLD = 999;
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 79;
  const tax = 0;
  const orderTotal = subtotal + shipping + tax;

  const freeLeft = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freePct = Math.min(
    100,
    Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100)
  );

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "IN", // backend schema country "IN"
    zipCode: "",
    state: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateForm = () => {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return false;
    }
    const required = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "address",
      "city",
      "zipCode",
    ];
    const missing = required.filter((k) => !String(formData[k] || "").trim());
    if (missing.length) {
      toast.error("Please fill all required fields");
      return false;
    }
    return true;
  };

  const payWithRazorpay = async () => {
    const ok = await loadRazorpayScript();
    if (!ok) {
      toast.error("Razorpay SDK load হয়নি (adblock / internet check করো)");
      return { ok: false };
    }

    // RUPEES -> PAISE total paise
    const amountPaise = Math.round(Number(orderTotal || 0) * 100);

    // Shipping address snapshot (backend schema match)
    const shippingAddress = {
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      phone: formData.phone,
      line1: formData.address,
      line2: "",
      city: formData.city,
      state: formData.state || "",
      postalCode: formData.zipCode,
      country: formData.country || "IN",
    };

    // Create order via thunk + axios
    const data = await dispatch(
      createRazorpayOrder({
        amount: amountPaise,
        currency,
        receipt: `rcpt_${Date.now()}`,
        notes: {
          email: formData.email,
          phone: formData.phone,
        },
        shippingAddress,
      })
    ).unwrap();

    // Open Razorpay popup
    return await new Promise((resolve) => {
      const options = {
        key: data.key,
        order_id: data.order.id,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "Lumière",
        description: "Order payment",
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          contact: formData.phone,
        },
        handler: async (response) => {
          try {
            //  Verify via thunk + axios
            await dispatch(
              verifyRazorpayPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              })
            ).unwrap();

            toast.success("Payment successful");
            await dispatch(clearCart()).unwrap();
            navigate("/");
            resolve({ ok: true });
          } catch (e) {
            toast.error(String(e) || "Payment verification failed");
            resolve({ ok: false });
          }
        },
        modal: {
          ondismiss: () => {
            toast("Payment cancelled");
            resolve({ ok: false });
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (paymentMethod === "cod") {
        // COD - এখানে চাইলে backend order create API thunk বানাতে পারো
        await new Promise((r) => setTimeout(r, 600));
        toast.success("Order placed ");
        await dispatch(clearCart()).unwrap();
        navigate("/");
        return;
      }

      await payWithRazorpay();
    } catch (err) {
      toast.error(err?.message || String(err) || "Failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (paymentError) toast.error(paymentError);
  }, [paymentError]);

  if (!loading && items.length === 0) {
    return (
      <MainLayout>
        <div className="container-custom py-16 text-center">
          <h1 className="text-2xl font-semibold mb-4">Your cart is empty</h1>
          <Link to="/shop" className="text-primary hover:underline">
            Continue Shopping
          </Link>
        </div>
      </MainLayout>
    );
  }

  const submitDisabled = loading || isSubmitting || creatingOrder || verifying;

  return (
    <MainLayout>
      <div className="container-custom py-8 lg:py-12">
        <Link
          to="/cart"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Cart
        </Link>

        <div className="flex items-end justify-between gap-4 mb-8">
          <h1 className="text-3xl lg:text-4xl font-serif font-semibold text-foreground">
            Checkout
          </h1>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Items</div>
            <div className="font-semibold text-foreground">{totalItems}</div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left */}
            <div className="space-y-6">
              {/* Free shipping hint */}
              <div className="rounded-2xl bg-muted/50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm text-foreground">
                    {shipping === 0 ? (
                      <span className="font-medium">
                        Free shipping unlocked
                      </span>
                    ) : (
                      <>
                        Add{" "}
                        <span className="font-semibold">
                          {formatMoney(freeLeft, currency)}
                        </span>{" "}
                        more for free shipping
                      </>
                    )}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {freePct}%
                  </span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${freePct}%` }}
                  />
                </div>
              </div>

              {/* Shipping Information */}
              <div className="bg-card rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-foreground mb-5">
                  Shipping information
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      First name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="input-field"
                      placeholder="Rahul"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Last name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="input-field"
                      placeholder="Sharma"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="input-field"
                      placeholder="you@example.com"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="input-field"
                      placeholder="+91 98765 43210"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      className="input-field"
                      placeholder="House no, Street, Area"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="input-field"
                      placeholder="Mumbai"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="Maharashtra"
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      PIN code *
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      required
                      className="input-field"
                      placeholder="400001"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-card rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-foreground mb-5">
                  Payment method
                </h2>

                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id)}
                      className={cn(
                        "w-full flex items-center justify-between gap-4 p-4 rounded-2xl transition-all",
                        paymentMethod === method.id
                          ? "bg-primary/10 ring-2 ring-primary"
                          : "bg-muted/40 hover:bg-muted/60"
                      )}
                      aria-pressed={paymentMethod === method.id}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-9 h-9 rounded-xl flex items-center justify-center",
                            paymentMethod === method.id
                              ? "bg-primary text-primary-foreground"
                              : "bg-background text-muted-foreground"
                          )}
                        >
                          <method.icon className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-foreground">
                            {method.label}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {method.id === "cod"
                              ? "Pay when you receive the order"
                              : "UPI / Card / Netbanking via Razorpay"}
                          </div>
                        </div>
                      </div>

                      {paymentMethod === method.id ? (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-4 h-4 text-primary-foreground" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-background" />
                      )}
                    </button>
                  ))}
                </div>

                {paymentMethod === "card" && (
                  <div className="mt-6 text-sm text-muted-foreground">
                    You will be redirected to Razorpay secure checkout to
                    complete payment.
                    <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                      <ShieldCheck className="w-4 h-4 text-primary" />
                      Payments are secured & encrypted
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right */}
            <div>
              <div className="bg-card rounded-2xl shadow-sm p-6 sticky top-24">
                <h2 className="text-lg font-semibold text-foreground mb-5">
                  Order summary
                </h2>

                <div className="space-y-4 mb-6">
                  {items.map((it) => {
                    const variant = it?.variantId;
                    const prod = variant?.productId;

                    const title =
                      prod?.name || it?.title || variant?.title || "Product";
                    const img =
                      prod?.images?.[0]?.url || variant?.images?.[0]?.url || "";

                    const unit =
                      it?.unitPrice?.amount ?? variant?.price?.amount ?? 0;
                    const cur =
                      it?.unitPrice?.currency ??
                      variant?.price?.currency ??
                      currency;
                    const lineTotal = unit * (it.quantity || 0);

                    return (
                      <div key={it._id} className="flex gap-4">
                        <div className="w-16 rounded-xl overflow-hidden bg-muted shrink-0 aspect-[4/5]">
                          <img
                            src={safeImg(img)}
                            alt={title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src =
                                "https://via.placeholder.com/600x800?text=No+Image";
                            }}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground text-sm line-clamp-1">
                            {title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Qty: {it.quantity || 0}
                          </p>
                        </div>

                        <p className="font-semibold text-foreground text-sm">
                          {formatMoney(lineTotal, cur)}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-3 pt-4 border-t border-border">
                  <Row
                    label="Subtotal"
                    value={formatMoney(subtotal, currency)}
                  />
                  <Row
                    label="Shipping"
                    value={
                      shipping === 0 ? "Free" : formatMoney(shipping, currency)
                    }
                  />
                  <Row
                    label="Tax"
                    value={tax === 0 ? "—" : formatMoney(tax, currency)}
                  />

                  <div className="pt-3 border-t border-border">
                    <div className="flex justify-between">
                      <span className="font-semibold text-foreground">
                        Total
                      </span>
                      <span className="font-semibold text-foreground">
                        {formatMoney(orderTotal, currency)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className={`${btnBase} ${btnLg} ${btnPrimary} w-full mt-6`}
                  disabled={submitDisabled}
                >
                  {submitDisabled ? (
                    "Processing..."
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      {paymentMethod === "cod"
                        ? "Place order"
                        : "Pay with Razorpay"}
                    </>
                  )}
                </button>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  By placing this order, you agree to our Terms & Privacy
                  Policy.
                </p>

                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  Secure checkout
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}
