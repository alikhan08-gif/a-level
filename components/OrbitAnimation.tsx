"use client";

import { useEffect, useRef } from "react";
import type { Direction } from "@/lib/types";

const RING_DEG_PER_SEC = 360 / 28;
const RING_SLOW_DEG_PER_SEC = 360 / 280;
const GLOBE_DEG_PER_SEC = 360 / 90;
const GLOBE_SLOW_DEG_PER_SEC = 360 / 900;

export default function OrbitAnimation({
  nodes,
  labels,
}: {
  nodes: { direction: Direction; x: number; y: number }[];
  labels: Record<Direction, string>;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<SVGGElement>(null);
  const globeRef = useRef<SVGImageElement>(null);
  const nodeRefs = useRef<(SVGGElement | null)[]>([]);

  const hoveredRef = useRef(false);
  const ringAngle = useRef(0);
  const globeAngle = useRef(0);
  const ringSpeed = useRef(RING_DEG_PER_SEC);
  const globeSpeed = useRef(GLOBE_DEG_PER_SEC);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf: number;
    let last = performance.now();

    function tick(now: number) {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;

      const ringTarget = hoveredRef.current ? RING_SLOW_DEG_PER_SEC : RING_DEG_PER_SEC;
      const globeTarget = hoveredRef.current ? GLOBE_SLOW_DEG_PER_SEC : GLOBE_DEG_PER_SEC;
      const ease = 1 - Math.exp(-dt * 2);
      ringSpeed.current += (ringTarget - ringSpeed.current) * ease;
      globeSpeed.current += (globeTarget - globeSpeed.current) * ease;

      ringAngle.current = (ringAngle.current + ringSpeed.current * dt) % 360;
      globeAngle.current = (globeAngle.current + globeSpeed.current * dt) % 360;

      if (ringRef.current) ringRef.current.style.transform = `rotate(${ringAngle.current}deg)`;
      if (globeRef.current) globeRef.current.style.transform = `rotate(${globeAngle.current}deg)`;
      nodeRefs.current.forEach((el) => {
        if (el) el.style.transform = `rotate(${-ringAngle.current}deg)`;
      });

      raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => (hoveredRef.current = true)}
      onMouseLeave={() => (hoveredRef.current = false)}
      data-aos="zoom-in"
      className="relative mx-auto w-full max-w-2xl aspect-square px-4"
    >
      <svg viewBox="0 0 340 340" className="w-full h-full overflow-visible">
        <defs>
          <clipPath id="globeClip">
            <circle cx="170" cy="180" r="58" />
          </clipPath>
          <radialGradient id="globeShadow" cx="68%" cy="72%" r="60%">
            <stop offset="0%" stopColor="#000" stopOpacity="0" />
            <stop offset="100%" stopColor="#00111f" stopOpacity="0.4" />
          </radialGradient>
        </defs>
        <image
          ref={globeRef}
          href="/earth.svg"
          x="112"
          y="122"
          width="116"
          height="116"
          preserveAspectRatio="xMidYMid slice"
          clipPath="url(#globeClip)"
          style={{ transformBox: "view-box", transformOrigin: "170px 180px" }}
        />
        <circle cx="170" cy="180" r="58" fill="url(#globeShadow)" />
        <circle cx="170" cy="180" r="58" fill="none" stroke="#fff" strokeOpacity="0.25" strokeWidth="1" />

        <g ref={ringRef} style={{ transformBox: "view-box", transformOrigin: "170px 180px" }}>
          <circle cx="170" cy="180" r="150" fill="none" stroke="var(--brand-navy)" strokeOpacity="0.5" strokeWidth="1.5" />
          {nodes.map((node, i) => (
            <a key={node.direction} href={`/kurslar?direction=${node.direction}`}>
              <g transform={`translate(${node.x},${node.y})`}>
                <g
                  ref={(el) => {
                    nodeRefs.current[i] = el;
                  }}
                  style={{ transformBox: "fill-box", transformOrigin: "center" }}
                  className="cursor-pointer"
                >
                  <circle r="44" fill="white" stroke="var(--brand-navy)" strokeWidth="1.5" />
                  <text
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="10"
                    fontWeight="700"
                    fill="var(--brand-navy)"
                  >
                    {labels[node.direction]}
                  </text>
                </g>
              </g>
            </a>
          ))}
        </g>
      </svg>
    </div>
  );
}
