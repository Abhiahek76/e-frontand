import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { X, Plus, Minus, ShoppingBag } from "lucide-react";

export default function CartDrawer({ isOpen, onClose }) {
  const [items, setItems] = useState([
    {
      key: "1-M-Black",
      product: {
        id: 1,
        name: "Premium Cotton T-Shirt",
        price: 49.99,
        images: [
          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop",
        ],
      },
      selectedSize: "M",
      selectedColor: "Black",
      quantity: 1,
    },
    {
      key: "4-NA-Cognac",
      product: {
        id: 4,
        name: "Leather Crossbody Bag",
        price: 159.0,
        images: [
          "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=800&fit=crop",
        ],
      },
      selectedSize: null,
      selectedColor: "Cognac",
      quantity: 1,
    },
  ]);

  const { totalItems, totalPrice } = useMemo(() => {
    const totalItems = items.reduce((sum, it) => sum + it.quantity, 0);
    const totalPrice = items.reduce(
      (sum, it) => sum + it.quantity * it.product.price,
      0
    );
    return { totalItems, totalPrice };
  }, [items]);

  const removeItem = (key) => {
    setItems((prev) => prev.filter((it) => it.key !== key));
  };

  const updateQuantity = (key, nextQty) => {
    setItems((prev) =>
      prev
        .map((it) => (it.key === key ? { ...it, quantity: nextQty } : it))
        .filter((it) => it.quantity > 0)
    );
  };

  const backdropClass =
    "fixed inset-0 bg-black/30 backdrop-blur-sm z-50 transition-opacity duration-300 " +
    (isOpen ? "opacity-100" : "opacity-0 pointer-events-none");

  const drawerClass =
    "fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300 ease-out " +
    (isOpen ? "translate-x-0" : "translate-x-full");

  return (
    <>
      {/* Backdrop */}
      <div className={backdropClass} onClick={onClose} />

      {/* Drawer */}
      <div className={drawerClass}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Your Cart ({totalItems})</h2>
            <button
              onClick={onClose}
              className="p-2 -mr-2 text-gray-500 hover:text-gray-900 transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-6">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingBag className="w-16 h-16 text-gray-400/70 mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Your cart is empty
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  Looks like you haven't added anything yet.
                </p>
                <Link
                  to="/shop"
                  onClick={onClose}
                  className="px-6 py-3 bg-black text-white rounded-md font-medium hover:opacity-90 transition"
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              <ul className="space-y-4">
                {items.map((item) => (
                  <li key={item.key} className="flex gap-4">
                    <Link
                      to={`/product/${item.product.id}`}
                      onClick={onClose}
                      className="w-20 h-24 flex-shrink-0 rounded-md overflow-hidden bg-gray-100"
                    >
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </Link>

                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/product/${item.product.id}`}
                        onClick={onClose}
                        className="font-medium text-gray-900 hover:underline line-clamp-1"
                      >
                        {item.product.name}
                      </Link>

                      <p className="text-sm text-gray-500 mt-0.5">
                        {item.selectedSize && `Size: ${item.selectedSize}`}
                        {item.selectedSize && item.selectedColor && " • "}
                        {item.selectedColor && `Color: ${item.selectedColor}`}
                      </p>

                      <p className="font-medium text-gray-900 mt-1">
                        ${item.product.price.toFixed(2)}
                      </p>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateQuantity(item.key, item.quantity - 1)
                            }
                            className="p-1 rounded-md border border-gray-200 hover:bg-gray-50 transition"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-4 h-4" />
                          </button>

                          <span className="w-8 text-center text-sm font-medium">
                            {item.quantity}
                          </span>

                          <button
                            onClick={() =>
                              updateQuantity(item.key, item.quantity + 1)
                            }
                            className="p-1 rounded-md border border-gray-200 hover:bg-gray-50 transition"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.key)}
                          className="text-sm text-gray-500 hover:text-red-600 transition"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-4 lg:p-6 border-t border-gray-200 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-lg font-semibold">
                  ${totalPrice.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Shipping and taxes calculated at checkout.
              </p>
              <div className="grid gap-3">
                <Link
                  to="/checkout"
                  onClick={onClose}
                  className="w-full py-3 bg-black text-white rounded-md font-medium text-center hover:opacity-90 transition"
                >
                  Checkout
                </Link>
                <Link
                  to="/cart"
                  onClick={onClose}
                  className="w-full py-3 bg-gray-100 text-gray-900 rounded-md font-medium text-center hover:bg-gray-200 transition"
                >
                  View Cart
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
