'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { clearCartAction } from '@/actions/cart-actions';
import { createOrderAction } from '@/actions/order-actions';
import { Cart } from '@/types/cart';
import { Address } from '@/types/order';

interface Props {
  cart: Cart;
  addresses: Address[];
}

export function CheckoutClient({ cart, addresses }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0] ?? null;

  const [form, setForm] = useState({
    shippingCity: defaultAddress?.city ?? '',
    shippingStreet: defaultAddress?.street ?? '',
    shippingHouseNumber: defaultAddress?.houseNumber ?? '',
    shippingApartment: defaultAddress?.apartment ?? '',
  });

  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    defaultAddress?.id ?? null,
  );

  function handleAddressSelect(address: Address) {
    setSelectedAddressId(address.id);
    setForm({
      shippingCity: address.city,
      shippingStreet: address.street,
      shippingHouseNumber: address.houseNumber,
      shippingApartment: address.apartment ?? '',
    });
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSelectedAddressId(null);
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit() {
    setError(null);

    if (!form.shippingCity || !form.shippingStreet || !form.shippingHouseNumber) {
      setError('Please fill in all required address fields');
      return;
    }

    startTransition(async () => {
      const res = await createOrderAction({
        shippingCity: form.shippingCity,
        shippingStreet: form.shippingStreet,
        shippingHouseNumber: form.shippingHouseNumber,
        shippingApartment: form.shippingApartment || undefined,
        items: cart.items.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
        })),
      });

      if (!res.success) {
        setError(res.error ?? 'Something went wrong');
        return;
      }

      await clearCartAction();
      router.push(`/user/orders/${res.order!.id}?success=1`);
    });
  }

  const total = cart.items.reduce((sum, item) => {
    const price = Number(item.variant.salePrice ?? item.variant.price);
    return sum + price * item.quantity;
  }, 0);

  return (
    <div className="flex flex-col lg:flex-row gap-10">
      <div className="flex-1 space-y-8">
        {addresses.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-widest">Saved addresses</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {addresses.map((address) => (
                <button
                  key={address.id}
                  type="button"
                  onClick={() => handleAddressSelect(address)}
                  className={`text-left p-4 border transition-all ${
                    selectedAddressId === address.id
                      ? 'border-black'
                      : 'border-zinc-200 hover:border-zinc-400'
                  }`}
                >
                  {address.title && (
                    <p className="text-xs font-semibold uppercase tracking-wide mb-1">
                      {address.title}
                    </p>
                  )}
                  <p className="text-sm text-zinc-700">{address.city}</p>
                  <p className="text-sm text-zinc-500">
                    {address.street}, {address.houseNumber}
                    {address.apartment && `, apt. ${address.apartment}`}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-widest">Delivery address</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs text-zinc-500 mb-1">
                City <span className="text-red-500">*</span>
              </label>
              <input
                name="shippingCity"
                value={form.shippingCity}
                onChange={handleChange}
                placeholder="Kyiv"
                className="w-full border border-zinc-200 px-3 py-2.5 text-sm focus:outline-none focus:border-black transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-500 mb-1">
                Street <span className="text-red-500">*</span>
              </label>
              <input
                name="shippingStreet"
                value={form.shippingStreet}
                onChange={handleChange}
                placeholder="Khreshchatyk St."
                className="w-full border border-zinc-200 px-3 py-2.5 text-sm focus:outline-none focus:border-black transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-500 mb-1">
                House number <span className="text-red-500">*</span>
              </label>
              <input
                name="shippingHouseNumber"
                value={form.shippingHouseNumber}
                onChange={handleChange}
                placeholder="1A"
                className="w-full border border-zinc-200 px-3 py-2.5 text-sm focus:outline-none focus:border-black transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-500 mb-1">Apartment</label>
              <input
                name="shippingApartment"
                value={form.shippingApartment}
                onChange={handleChange}
                placeholder="42"
                className="w-full border border-zinc-200 px-3 py-2.5 text-sm focus:outline-none focus:border-black transition-colors"
              />
            </div>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-500 border border-red-200 bg-red-50 px-4 py-3">{error}</p>
        )}
      </div>

      <div className="lg:w-80 shrink-0">
        <div className="border border-zinc-200 p-6 space-y-6 sticky top-24">
          <h2 className="text-sm font-semibold uppercase tracking-widest">Order summary</h2>

          <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
            {cart.items.map((item) => {
              const price = Number(item.variant.salePrice ?? item.variant.price);
              const image =
                item.variant.images?.[0]?.image?.url ?? item.variant.product.images?.[0]?.url;

              return (
                <div key={item.id} className="flex gap-3">
                  <div className="relative w-14 h-18 shrink-0 bg-zinc-100 overflow-hidden">
                    {image ? (
                      <Image
                        src={image}
                        alt={item.variant.product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-zinc-200" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold uppercase truncate">
                      {item.variant.product.name}
                    </p>
                    <div className="text-xs text-zinc-400 space-y-0.5 mt-0.5">
                      {item.variant.color && <p>Color: {item.variant.color.name}</p>}
                      {item.variant.size && <p>Size: {item.variant.size}</p>}
                      <p>Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="text-xs font-semibold shrink-0">
                    {(price * item.quantity).toFixed(2)} $
                  </p>
                </div>
              );
            })}
          </div>

          <div className="border-t pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-zinc-500">
              <span>Subtotal</span>
              <span>{total.toFixed(2)} $</span>
            </div>
            <div className="flex justify-between text-zinc-500">
              <span>Shipping</span>
              <span>—</span>
            </div>
            <div className="flex justify-between font-semibold pt-2 border-t">
              <span>Total</span>
              <span>{total.toFixed(2)} $</span>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="w-full py-4 bg-black text-white text-sm font-semibold uppercase tracking-widest hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Placing order...' : 'Place order'}
          </button>
        </div>
      </div>
    </div>
  );
}
