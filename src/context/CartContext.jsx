import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import { formatPrice, parsePrice } from "../utils/price";

const CartContext = createContext(null);
const CART_STORAGE_KEY = "lumina-beauty-cart";

function getInitialState() {
  if (typeof window === "undefined") {
    return { items: [] };
  }

  try {
    const storedCart = window.localStorage.getItem(CART_STORAGE_KEY);

    if (!storedCart) {
      return { items: [] };
    }

    const parsedCart = JSON.parse(storedCart);

    if (!Array.isArray(parsedCart.items)) {
      return { items: [] };
    }

    return { items: parsedCart.items };
  } catch {
    return { items: [] };
  }
}

function cartReducer(state, action) {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItem = state.items.find((item) => item.id === action.payload.id);

      if (existingItem) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.id === action.payload.id ? { ...item, quantity: item.quantity + 1 } : item,
          ),
        };
      }

      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }],
      };
    }
    case "INCREASE_ITEM":
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload ? { ...item, quantity: item.quantity + 1 } : item,
        ),
      };
    case "DECREASE_ITEM":
      return {
        ...state,
        items: state.items
          .map((item) =>
            item.id === action.payload ? { ...item, quantity: item.quantity - 1 } : item,
          )
          .filter((item) => item.quantity > 0),
      };
    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      };
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, undefined, getInitialState);

  useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const value = useMemo(() => {
    const itemCount = state.items.reduce((total, item) => total + item.quantity, 0);
    const subtotalAmount = state.items.reduce(
      (total, item) => total + parsePrice(item.price) * item.quantity,
      0,
    );
    const totalAmount = subtotalAmount;

    return {
      items: state.items,
      itemCount,
      subtotalAmount,
      totalAmount,
      subtotalLabel: formatPrice(subtotalAmount),
      totalLabel: formatPrice(totalAmount),
      addItem: (product) => dispatch({ type: "ADD_ITEM", payload: product }),
      increaseItem: (id) => dispatch({ type: "INCREASE_ITEM", payload: id }),
      decreaseItem: (id) => dispatch({ type: "DECREASE_ITEM", payload: id }),
      removeItem: (id) => dispatch({ type: "REMOVE_ITEM", payload: id }),
    };
  }, [state.items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
}
