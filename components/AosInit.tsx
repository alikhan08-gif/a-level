"use client";

import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

export default function AosInit() {
  useEffect(() => {
    AOS.init({ duration: 400, once: true, offset: 40 });

    // Images (e.g. book covers) load asynchronously and change the page's
    // height after AOS already calculated each element's scroll-trigger
    // offset, which can leave later sections un-revealed. A single refresh
    // once things have settled fixes that — but refreshing continuously
    // (e.g. via ResizeObserver + refreshHard) causes AOS to reset and
    // re-trigger elements mid-transition, leaving them stuck invisible.
    const timeout = setTimeout(() => AOS.refresh(), 1200);
    window.addEventListener("load", () => AOS.refresh());

    return () => clearTimeout(timeout);
  }, []);

  return null;
}
