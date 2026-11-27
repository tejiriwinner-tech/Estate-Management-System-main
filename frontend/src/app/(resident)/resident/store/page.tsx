"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  ShoppingBag,
  Search,
  PackageCheck,
  MessageSquare,
  X,
  CheckCircle2,
  Store,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  MapPin,
  Truck,
  Sparkles,
} from "lucide-react";
import { readSession } from "@/components/auth/session";

interface ActiveStore {
  id: number;
  name: string;
  category: string;
  shop_unit: string;
  owner_name: string;
  owner_email: string;
  status: string;
  is_promoted?: boolean;
}

interface StoreProduct {
  id: number;
  store_id?: number;
  store_name?: string;
  shop_unit?: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  description?: string;
  image?: string;
  featured?: boolean;
  store_promoted?: boolean;
}

interface CartItem {
  product: StoreProduct;
  quantity: number;
}

interface ResidentOrder {
  id: number;
  order_no: string;
  product_name: string;
  quantity: number;
  total_naira: number;
  unit_number?: string;
  delivery_comment: string;
  status: string;
  created_at?: string;
}

const ORDER_STEPS = ["Pending", "Preparing", "Out for Delivery", "Delivered"] as const;

export default function ResidentMarketplacePage() {
  const session = readSession();
  const [stores, setStores] = useState<ActiveStore[]>([]);
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [orders, setOrders] = useState<ResidentOrder[]>([]);
  const [selectedStore, setSelectedStore] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  // Profile auto-fill for delivery
  const [residentName, setResidentName] = useState(session?.name || "Estate Resident");
  const [unit, setUnit] = useState((session as any)?.unit_number || (session as any)?.unit || "");

  // Payment Proof state (shared by Cart & Single-Item Checkout)
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");
  const [paymentRef, setPaymentRef] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const [proofName, setProofName] = useState("");
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handleProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      setPaymentError("Payment receipt file must be under 3MB.");
      return;
    }
    setPaymentError(null);
    setProofName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setProofUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Shopping Cart Drawer
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartComment, setCartComment] = useState("");

  // Quick Single-Item Order Modal
  const [selected, setSelected] = useState<StoreProduct | null>(null);
  const [qty, setQty] = useState(1);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Direct Shop Inquiry Modal
  const [inquiryProduct, setInquiryProduct] = useState<StoreProduct | null>(null);
  const [inquiryText, setInquiryText] = useState("");
  const [sendingInquiry, setSendingInquiry] = useState(false);

  const loadAll = useCallback(async () => {
    const email = session?.email || "";
    try {
      const [sRes, pRes, oRes, profRes] = await Promise.all([
        fetch("/api/v1/admin/stores", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/v1/store/products?activeOnly=true", { cache: "no-store" }).then((r) => r.json()),
        fetch(`/api/v1/store/orders${email ? `?email=${encodeURIComponent(email)}` : ""}`, {
          cache: "no-store",
        }).then((r) => r.json()),
        fetch("/api/v1/resident/profile", {
          headers: email ? { "x-user-email": email } : {},
          cache: "no-store",
        }).then((r) => r.json()),
      ]);
      const activeStores = (Array.isArray(sRes?.data) ? sRes.data : []).filter(
        (s: ActiveStore) => (s.status || "active") === "active"
      );
      setStores(activeStores);
      setProducts(Array.isArray(pRes?.data) ? pRes.data : []);
      setOrders(Array.isArray(oRes?.data) ? oRes.data : []);
      if (profRes?.data?.name) setResidentName(profRes.data.name);
      if (profRes?.data?.unit_number && !unit) setUnit(profRes.data.unit_number);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [session?.email, unit]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];
  const filtered = products.filter((p) => {
    const matchStore = selectedStore === "All" || (p.store_name || "Estate Store") === selectedStore;
    const matchCat = category === "All" || p.category === category;
    const q = search.trim().toLowerCase();
    const matchQ =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.store_name || "").toLowerCase().includes(q);
    return matchStore && matchCat && matchQ;
  });

  const addToCart = (product: StoreProduct) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: Math.min(product.stock, i.quantity + 1) }
            : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setToast(`Added "${product.name}" to your cart.`);
    setTimeout(() => setToast(null), 3000);
  };

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);

  const handleCartCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    if (!paymentRef.trim() || !proofUrl) {
      setPaymentError("Please enter your transaction reference AND upload proof of payment before checking out.");
      return;
    }
    setPaymentError(null);
    setSubmitting(true);
    try {
      for (const item of cart) {
        await fetch("/api/v1/store/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            product_id: item.product.id,
            product_name: item.product.name,
            quantity: item.quantity,
            unit_price: item.product.price,
            resident_name: residentName,
            resident_email: session?.email || "resident@lincolnestate.ng",
            unit_number: unit || "Estate Unit",
            delivery_comment: cartComment.trim(),
            payment_method: paymentMethod,
            payment_reference: paymentRef.trim(),
            payment_proof_url: proofUrl,
            payment_proof_name: proofName,
          }),
        });
      }
      setToast(`Placed ${cart.length} item order(s) with payment proof for delivery to ${unit || "your unit"}!`);
      setTimeout(() => setToast(null), 5000);
      setCart([]);
      setCartComment("");
      setPaymentRef("");
      setProofUrl("");
      setProofName("");
      setCartOpen(false);
      await loadAll();
    } finally {
      setSubmitting(false);
    }
  };

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    if (!paymentRef.trim() || !proofUrl) {
      setPaymentError("Please enter your transaction reference AND upload proof of payment before confirming your order.");
      return;
    }
    setPaymentError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/store/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: selected.id,
          product_name: selected.name,
          quantity: qty,
          unit_price: selected.price,
          resident_name: residentName,
          resident_email: session?.email || "resident@lincolnestate.ng",
          unit_number: unit || "Estate Unit",
          delivery_comment: comment.trim(),
          payment_method: paymentMethod,
          payment_reference: paymentRef.trim(),
          payment_proof_url: proofUrl,
          payment_proof_name: proofName,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setPaymentError(json?.message || "Order failed.");
        return;
      }
      setToast(json.message || "Order confirmed with payment proof!");
      setTimeout(() => setToast(null), 5000);
      setSelected(null);
      setQty(1);
      setComment("");
      setPaymentRef("");
      setProofUrl("");
      setProofName("");
      await loadAll();
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryProduct || !inquiryText.trim()) return;
    setSendingInquiry(true);
    try {
      await fetch("/api/v1/chat/rooms/1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender_name: `${residentName} (${unit || "Resident"})`,
          sender_role: "resident",
          body: `[Store Inquiry — ${inquiryProduct.store_name || "Store"} / ${inquiryProduct.name}]: ${inquiryText.trim()}`,
        }),
      });
      setToast(`Inquiry sent to ${inquiryProduct.store_name || "Shop Owner"}!`);
      setTimeout(() => setToast(null), 4000);
      setInquiryProduct(null);
      setInquiryText("");
    } finally {
      setSendingInquiry(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header + Cart Trigger */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#B22222]">
            Post Army Housing Estate Marketplace
          </p>
          <h1 className="text-2xl font-extrabold text-gray-900 mt-0.5">
            Estate Stores &amp; Delivery
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse verified estate shops, add items to your cart, message shop owners, and track deliveries.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products or shops..."
              className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-xs font-medium"
            />
          </div>

          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1A1A1A] hover:bg-slate-800 px-4 py-2 text-xs font-extrabold text-white shadow-xs cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4 text-[#C9A227]" />
            <span>Cart ({cartCount})</span>
            {cartTotal > 0 && <span className="text-[#C9A227]">• ₦{cartTotal.toLocaleString()}</span>}
          </button>
        </div>
      </div>

      {toast && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-800">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Active Estate Shops Directory Strip */}
      {stores.length > 0 && (
        <div className="space-y-2.5">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            Active Estate Shops ({stores.length})
          </p>
          <div className="flex gap-3 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setSelectedStore("All")}
              className={`shrink-0 rounded-xl border px-4 py-2.5 text-left transition-all cursor-pointer ${
                selectedStore === "All"
                  ? "border-[#B22222] bg-[#FEF2F2] text-[#B22222]"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <p className="text-xs font-extrabold">All Estate Shops</p>
              <p className="text-[10px] opacity-75">{products.length} products</p>
            </button>
            {stores.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedStore(s.name)}
                className={`shrink-0 rounded-xl border px-4 py-2.5 text-left transition-all cursor-pointer ${
                  selectedStore === s.name
                    ? "border-[#B22222] bg-[#FEF2F2] text-[#B22222]"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <p className="text-xs font-extrabold flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5" />
                  <span>{s.name}</span>
                  {s.is_promoted && (
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-extrabold text-amber-800 border border-amber-200">
                      <Sparkles className="w-2.5 h-2.5" /> Promoted
                    </span>
                  )}
                </p>
                <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-2.5 h-2.5" />
                  <span>{s.shop_unit} • {s.category}</span>
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
              category === c
                ? "bg-[#B22222] text-white"
                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* E-Commerce Product Grid */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading store products…</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center space-y-2">
          <Store className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-700">No store products available yet</p>
          <p className="text-xs text-slate-400">Products uploaded by active estate stores will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-2xs hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="h-44 bg-slate-100 relative overflow-hidden">
                {p.featured && (
                  <span className="absolute top-2.5 left-2.5 z-10 inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-extrabold text-white shadow-xs">
                    <Sparkles className="w-3 h-3" /> Featured
                  </span>
                )}
                {p.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <ShoppingBag className="w-10 h-10" />
                  </div>
                )}
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 text-[10px] font-extrabold text-slate-800">
                  {p.category}
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                <div>
                  {p.store_name && (
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#B22222] mb-0.5 truncate">
                      {p.store_name}{p.shop_unit ? ` • ${p.shop_unit}` : ""}
                    </p>
                  )}
                  <h3 className="text-sm font-extrabold text-gray-900 leading-snug">{p.name}</h3>
                  {p.description && <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{p.description}</p>}
                </div>

                <div className="space-y-2.5 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-black text-[#B22222]">₦{p.price.toLocaleString()}</span>
                    <span className={`text-[11px] font-bold ${p.stock > 0 ? "text-emerald-700" : "text-red-600"}`}>
                      {p.stock > 0 ? `${p.stock} available` : "Out of stock"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={p.stock <= 0}
                      onClick={() => addToCart(p)}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold disabled:opacity-50 cursor-pointer"
                    >
                      <ShoppingCart className="w-3.5 h-3.5 text-[#C9A227]" />
                      Add to Cart
                    </button>
                    <button
                      type="button"
                      disabled={p.stock <= 0}
                      onClick={() => {
                        setSelected(p);
                        setQty(1);
                      }}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#B22222] hover:bg-[#8F1A1A] text-white text-xs font-bold disabled:opacity-50 cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Order Now
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setInquiryProduct(p)}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-bold text-slate-500 hover:text-[#B22222] cursor-pointer"
                  >
                    <MessageSquare className="w-3 h-3" />
                    Ask Shop Owner about this item
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* My Store Orders with Live Fulfillment Timeline */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <PackageCheck className="w-4 h-4 text-[#B22222]" />
            <h2 className="text-sm font-extrabold text-gray-900">My Store Orders &amp; Delivery Tracking</h2>
          </div>
          <span className="text-xs font-bold text-slate-400">{orders.length} order(s)</span>
        </div>

        {orders.length === 0 ? (
          <p className="text-xs text-slate-400">You have not placed any store orders yet.</p>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => {
              const stepIdx = Math.max(0, ORDER_STEPS.indexOf(o.status as any));
              return (
                <div key={o.id} className="rounded-xl bg-slate-50 border border-slate-200/60 p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-extrabold text-gray-900">
                        <span className="font-mono text-[#B22222] mr-2">{o.order_no}</span>
                        {o.product_name} × {o.quantity}
                      </p>
                      {o.delivery_comment && (
                        <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                          <MessageSquare className="w-3 h-3 text-[#C9A227]" />
                          <span>Delivery note: {o.delivery_comment}</span>
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-black text-gray-900">₦{o.total_naira.toLocaleString()}</span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        <Truck className="w-3 h-3" />
                        {o.status}
                      </span>
                    </div>
                  </div>

                  {/* Step Tracker */}
                  <div className="grid grid-cols-4 gap-1.5 pt-1">
                    {ORDER_STEPS.map((st, idx) => (
                      <div key={st} className="space-y-1">
                        <div className={`h-1.5 rounded-full ${idx <= stepIdx ? "bg-[#B22222]" : "bg-slate-200"}`} />
                        <p className={`text-[10px] font-bold ${idx <= stepIdx ? "text-slate-800" : "text-slate-400"}`}>
                          {st}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Shopping Cart Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between p-6 overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-[#B22222]" />
                  <span>Shopping Cart ({cartCount})</span>
                </h3>
                <button type="button" onClick={() => setCartOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="py-16 text-center space-y-2">
                  <ShoppingCart className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-600">Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.product.id} className="rounded-xl border border-slate-200 p-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-extrabold text-slate-900 truncate">{item.product.name}</p>
                        <p className="text-[11px] text-[#B22222] font-bold">₦{item.product.price.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setCart((prev) =>
                              prev
                                .map((c) => (c.product.id === item.product.id ? { ...c, quantity: c.quantity - 1 } : c))
                                .filter((c) => c.quantity > 0)
                            )
                          }
                          className="p-1 rounded-lg border border-slate-200 hover:bg-slate-100 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold w-5 text-center">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setCart((prev) =>
                              prev.map((c) =>
                                c.product.id === item.product.id
                                  ? { ...c, quantity: Math.min(c.product.stock, c.quantity + 1) }
                                  : c
                              )
                            )
                          }
                          className="p-1 rounded-lg border border-slate-200 hover:bg-slate-100 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setCart((prev) => prev.filter((c) => c.product.id !== item.product.id))}
                          className="p-1 text-rose-500 hover:text-rose-700 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <form onSubmit={handleCartCheckout} className="pt-4 border-t border-slate-100 space-y-3 mt-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Delivery Unit / House No</label>
                  <input
                    required
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="e.g. Plot 12, Phase 1"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Delivery Instructions</label>
                  <textarea
                    rows={2}
                    value={cartComment}
                    onChange={(e) => setCartComment(e.target.value)}
                    placeholder="Gate instructions or phone number on arrival..."
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium"
                  />
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 space-y-2.5">
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-amber-900">
                    Required: Proof of Payment
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold"
                    >
                      <option>Bank Transfer</option>
                      <option>Paystack / Card</option>
                      <option>POS Receipt</option>
                    </select>
                    <input
                      required
                      value={paymentRef}
                      onChange={(e) => setPaymentRef(e.target.value)}
                      placeholder="Transaction Ref / Sender"
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-medium"
                    />
                  </div>
                  <label className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-amber-400 bg-white px-3 py-2 text-xs font-bold text-slate-700 cursor-pointer hover:bg-amber-50">
                    <span>{proofName ? `Receipt attached: ${proofName}` : "Upload Payment Receipt (Image / PDF)"}</span>
                    <input type="file" accept="image/*,.pdf" onChange={handleProofUpload} className="hidden" />
                  </label>
                  {paymentError && <p className="text-[11px] font-bold text-rose-600">{paymentError}</p>}
                </div>
                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                  <span className="text-xs font-bold text-slate-600">Total Amount</span>
                  <span className="text-lg font-black text-[#B22222]">₦{cartTotal.toLocaleString()}</span>
                </div>
                <button
                  type="submit"
                  disabled={submitting || !paymentRef.trim() || !proofUrl}
                  className="w-full rounded-xl bg-[#B22222] hover:bg-[#991b1b] py-3 text-xs font-extrabold text-white cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "Verifying & Placing Orders..." : "Confirm Payment & Place Order"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Single-Item Order Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-gray-900">Order {selected.name}</h3>
                <p className="text-[11px] text-slate-500">
                  {selected.store_name ? `${selected.store_name} • ` : ""}₦{selected.price.toLocaleString()} each
                </p>
              </div>
              <button type="button" onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleOrder} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Quantity</label>
                  <input
                    type="number"
                    min={1}
                    max={selected.stock}
                    value={qty}
                    onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Delivery Unit / Villa</label>
                  <input
                    required
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="e.g. Plot 12, Phase 1"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Delivery Comments / Instructions
                </label>
                <textarea
                  rows={2}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="e.g. Deliver to gate, call 0803... on arrival"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium"
                />
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 space-y-2.5">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-amber-900">
                  Required: Proof of Payment
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold"
                  >
                    <option>Bank Transfer</option>
                    <option>Paystack / Card</option>
                    <option>POS Receipt</option>
                  </select>
                  <input
                    required
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
                    placeholder="Transaction Ref / Sender"
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-medium"
                  />
                </div>
                <label className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-amber-400 bg-white px-3 py-2 text-xs font-bold text-slate-700 cursor-pointer hover:bg-amber-50">
                  <span>{proofName ? `Receipt attached: ${proofName}` : "Upload Payment Receipt (Image / PDF)"}</span>
                  <input type="file" accept="image/*,.pdf" onChange={handleProofUpload} className="hidden" />
                </label>
                {paymentError && <p className="text-[11px] font-bold text-rose-600">{paymentError}</p>}
              </div>
              <div className="rounded-xl bg-slate-50 p-3 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Total Amount</span>
                <span className="text-lg font-black text-[#B22222]">
                  ₦{(selected.price * qty).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !paymentRef.trim() || !proofUrl}
                  className="px-5 py-2 rounded-xl bg-[#B22222] text-white text-xs font-bold hover:bg-[#8F1A1A] disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? "Placing Order..." : "Confirm Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ask Shop Owner Modal */}
      {inquiryProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-gray-900">Message {inquiryProduct.store_name || "Shop Owner"}</h3>
                <p className="text-[11px] text-slate-500">Regarding: {inquiryProduct.name}</p>
              </div>
              <button type="button" onClick={() => setInquiryProduct(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSendInquiry} className="p-6 space-y-4">
              <textarea
                required
                rows={3}
                value={inquiryText}
                onChange={(e) => setInquiryText(e.target.value)}
                placeholder="Ask about product specs, warranty, bulk pricing, or delivery timing..."
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium"
              />
              <button
                type="submit"
                disabled={sendingInquiry}
                className="w-full rounded-xl bg-[#B22222] hover:bg-[#991b1b] py-2.5 text-xs font-extrabold text-white cursor-pointer disabled:opacity-60"
              >
                {sendingInquiry ? "Sending..." : "Send Inquiry to Shop Owner"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
