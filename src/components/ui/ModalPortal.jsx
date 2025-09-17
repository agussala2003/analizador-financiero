// Simple portal to body to avoid clipping/stacking issues
import { createPortal } from "react-dom";

export default function ModalPortal({ children }) {
  if (typeof document === "undefined") return null;
  return createPortal(children, document.body);
}
