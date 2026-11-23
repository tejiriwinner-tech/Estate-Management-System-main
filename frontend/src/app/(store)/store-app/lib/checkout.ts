export const checkoutCustomerStorageKey = "store-app-checkout-customer";

export const checkoutItems = [
  {
    name: "Lekki Phase 1 Estate Plan",
    detail: "Property Management Suite",
    price: 245000,
    image: "/assets/products/checkout-1.jpeg",
  },
  {
    name: "Estate Manager Pro",
    detail: "12 Months Subscription",
    price: 59900,
    image: "/assets/products/checkout-2.jpeg",
  },
];

export const checkoutPlatformFee = 1250;
export const checkoutDiscount = 25000;

export const checkoutSubtotal = checkoutItems.reduce(
  (sum, item) => sum + item.price,
  0,
);

export const checkoutTotal =
  checkoutSubtotal + checkoutPlatformFee - checkoutDiscount;

export function formatNaira(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);
}
