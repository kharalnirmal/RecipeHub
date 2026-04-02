"use client";

import { useRef, useEffect } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { gsap } from "gsap";

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);
  const firedRef = useRef(false);

  useEffect(() => {
    // ── 1. counter tween ──────────────────────────────────────────
    const c = { v: 0 };
    const counter = gsap.to(c, {
      v: 100,
      duration: 4.5,
      ease: "power1.inOut",
      onUpdate() {
        if (pctRef.current) pctRef.current.textContent = Math.floor(c.v) + "%";
      },
      onComplete() {
        if (pctRef.current) pctRef.current.textContent = "100%";

        // fade out loading, fade in button
        gsap.to(loadingRef.current, {
          opacity: 0,
          y: -16,
          duration: 0.4,
          ease: "power2.in",
          onComplete() {
            if (loadingRef.current) loadingRef.current.style.display = "none";
            if (buttonRef.current) {
              buttonRef.current.style.display = "block";
              gsap.fromTo(
                buttonRef.current,
                { opacity: 0, y: 16 },
                { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" },
              );
            }
          },
        });
      },
    });

    // ── 2. button click — native, self-removing ───────────────────
    const btn = buttonRef.current;
    const handleClick = () => {
      if (firedRef.current) return;
      firedRef.current = true;

      gsap.to(containerRef.current, {
        yPercent: -110,
        duration: 0.95,
        ease: "power3.inOut",
        overwrite: "auto",
        onComplete: onComplete,
      });
    };

    btn?.addEventListener("click", handleClick, { once: true }); // `once:true` — browser removes it after first fire

    return () => {
      counter.kill();
      btn?.removeEventListener("click", handleClick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // empty — runs once on mount, never again

  return (
    <div
      ref={containerRef}
      className="z-50 fixed inset-0 bg-background"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Loading */}
      <div
        ref={loadingRef}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "24px",
          marginBottom: "80px",
        }}
      >
        <div style={{ width: "280px", height: "280px", flexShrink: 0 }}>
          <DotLottieReact
            src="/PAN.lottie"
            loop
            autoplay
            backgroundColor="#00000000"
            style={{ width: "280px", height: "280px", display: "block" }}
          />
        </div>
        <p className="font-light text-[20px] text-text-primary tracking-[0.5px]">
          <span className="mr-1 font-(--font-display) text-[24px] italic">
            Cooking
          </span>{" "}
          what you have...{" "}
          <span ref={pctRef} className="opacity-90 text-text-secondary">
            0%
          </span>
        </p>
      </div>

      {/* Button */}
      <button
        ref={buttonRef}
        type="button"
        style={{
          display: "none",
          opacity: 0,
          position: "absolute", // doesn't shift layout when it appears
        }}
        className="font-(--font-display) border border-border bg-transparent px-16 py-4 text-xl text-text-primary tracking-[2px] uppercase cursor-pointer hover:scale-[1.03] transition-transform duration-300"
      >
        START
      </button>
    </div>
  );
}
