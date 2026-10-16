/**
 * components/ui/lightbox.tsx — Full-screen image lightbox component.
 *
 * Displays an image in a full-screen overlay with:
 * - Dark semi-transparent background with backdrop blur
 * - Close button (X icon) in top-right corner
 * - Click outside image or press Escape to close
 * - Body scroll lock while open (prevents background scrolling)
 * - Fade-in animation on open
 *
 * Props:
 *   src: image URL (null closes the lightbox)
 *   alt: alt text for accessibility
 *   onClose: callback to close the lightbox
 */
import { useEffect, useCallback } from "react";
import { X } from "lucide-react";

interface LightboxProps {
  src: string | null;
  alt: string;
  onClose: () => void;
}

export function Lightbox({ src, alt, onClose }: LightboxProps) {
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    // Lock body scroll while lightbox is open to prevent background scrolling
    if (!src) return;
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [src, handleKey]);

  if (!src) return null;

  return (
    <div
      className="lightbox-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={alt}
    >
      <button className="lightbox-close" onClick={onClose} aria-label="Close">
        <X size={24} />
      </button>
      <img className="lightbox-img" src={src} alt={alt} onClick={(e) => e.stopPropagation()} />
    </div>
  );
}
