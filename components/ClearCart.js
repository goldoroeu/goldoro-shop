"use client";

import { useEffect } from "react";

export default function ClearCart() {
  useEffect(() => {
    try {
      localStorage.removeItem("goldoro_cart_v1");
    } catch {
      /* ignore */
    }
  }, []);
  return null;
}
