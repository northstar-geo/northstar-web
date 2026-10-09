"use client";
import { useEffect, useRef } from "react";
export default function ThemeControl() {
  const select = useRef<HTMLSelectElement>(null);
  useEffect(() => {
    try {
      const current = localStorage.getItem("okelom-theme");
      const t = current ?? localStorage.getItem("zipora-theme");
      if (t && ["light", "dark", "system"].includes(t)) {
        document.documentElement.dataset.theme = t;
        if (select.current) select.current.value = t;
        if (current === null) localStorage.setItem("okelom-theme", t);
      }
    } catch {}
  }, []);
  return (
    <label className="theme-control">
      <span className="sr-only">Color theme</span>
      <select
        ref={select}
        defaultValue="system"
        onChange={(event) => {
          const value = event.target.value;
          document.documentElement.dataset.theme = value;
          try {
            localStorage.setItem("okelom-theme", value);
          } catch {}
        }}
      >
        <option value="system">◐ System</option>
        <option value="light">☀ Light</option>
        <option value="dark">☾ Dark</option>
      </select>
    </label>
  );
}
