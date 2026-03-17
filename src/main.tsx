import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Apply the persisted theme (if any) before React hydrates to avoid flashes.
if (typeof window !== "undefined") {
  const stored = window.localStorage.getItem("healthguard-theme");
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  const isDark = stored === "dark" || (!stored && prefersDark);
  document.documentElement.classList.toggle("dark", isDark);
}

createRoot(document.getElementById("root")!).render(<App />);
