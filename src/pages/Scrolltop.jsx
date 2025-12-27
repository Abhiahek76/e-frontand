import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    const container = document.getElementById("app-scroll");

    if (container) {
      container.scrollTo({ top: 0, left: 0, behavior: "auto" });
    } else {
      // fallback (if container not found)
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, [pathname, search]);

  return null;
}
