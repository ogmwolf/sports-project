"use client";
import { useApp } from "@/context/AppContext";

export default function ToastContainer() {
  const { toasts } = useApp();
  return (
    <>
      {toasts.map(t => (
        <div key={t.id} className="toast">{t.message}</div>
      ))}
    </>
  );
}
