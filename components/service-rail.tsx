"use client";
import { useRef, useState, useEffect, type ReactNode } from "react";

export function ServiceRail({ children }: { children: ReactNode }) {
  const rail = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });
  useEffect(() => {
    const element = rail.current;
    if (!element) return;
    const update = () =>
      setEdges({
        start: element.scrollLeft < 2,
        end:
          element.scrollLeft + element.clientWidth >= element.scrollWidth - 2,
      });
    update();
    element.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => {
      element.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, []);
  function move(direction: number) {
    const element = rail.current;
    if (!element) return;
    const card = element.firstElementChild as HTMLElement | null;
    const distance =
      (card?.getBoundingClientRect().width || element.clientWidth) + 24;
    element.scrollBy({
      left: direction * distance,
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }
  return (
    <div className="service-carousel">
      <div className="service-rail-toolbar">
        <p id="services-scroll-help">
          Explore our services. Swipe or use the controls.
        </p>
        <div className="service-rail-controls">
          <button
            type="button"
            onClick={() => move(-1)}
            disabled={edges.start}
            aria-controls="services-rail"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => move(1)}
            disabled={edges.end}
            aria-controls="services-rail"
          >
            Next
          </button>
        </div>
      </div>
      <div
        className="service-grid"
        id="services-rail"
        ref={rail}
        role="region"
        aria-label="Our services"
        aria-describedby="services-scroll-help"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return;
          if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
            event.preventDefault();
            move(event.key === "ArrowRight" ? 1 : -1);
          }
        }}
      >
        {children}
      </div>
    </div>
  );
}
