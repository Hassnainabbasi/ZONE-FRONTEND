import { useRef, useState } from "react";
import { motion } from "motion/react";
import { Activity, Trophy, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

function MagneticButton({ onClick }: { onClick: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;
        setOffset({
          x: ((e.clientX - (rect.left + rect.width / 2)) / rect.width) * 26,
          y: ((e.clientY - (rect.top + rect.height / 2)) / rect.height) * 18,
        });
      }}
      onMouseLeave={() => setOffset({ x: 0, y: 0 })}
      className="inline-block"
    >
      <motion.div
        animate={{ x: offset.x, y: offset.y }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
      >
        <Button variant="hero" size="xl" onClick={onClick}>
          Book Your Slot Now
          <ArrowRight className="size-4" />
        </Button>
      </motion.div>
    </div>
  );
}

const statusCards = [
  {
    icon: Activity,
    label: "Live Occupancy",
    value: "32/40 PCs Occupied",
    accent: "text-neon-green",
  },
  {
    icon: Trophy,
    label: "Current Tournament",
    value: "Valorant 5v5 — Live",
    accent: "text-neon-cyan",
  },
  {
    icon: Zap,
    label: "Fastest Rig Online",
    value: "APEX-01 · RTX 4090",
    accent: "text-secondary-foreground",
  },
];

export function Hero() {
  const go = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <section className="hero-glow relative overflow-hidden pt-32 pb-20 sm:pt-40 lg:pt-48 lg:pb-28">
      <div className="cyber-grid grid-drift absolute inset-0" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl"
        >
          <span className="glass-static inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-display text-[10px] tracking-[0.3em] uppercase">
            <span className="live-dot size-1.5 rounded-full bg-neon-green" />
            Arena Online · Karachi
          </span>

          <h1 className="mt-6 text-4xl leading-[1.05] font-black uppercase sm:text-6xl lg:text-7xl">
            Next-Level <span className="text-gradient">Gaming</span> Experience
          </h1>

          <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            40 flagship battlestations, PS5 Pro lounges and full-motion racing simulators under one
            neon roof. Reserve your seat, join a tournament, dominate the leaderboard.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <MagneticButton onClick={() => go("booking")} />
            <Button variant="glass" size="xl" onClick={() => go("tournaments")}>
              View Tournaments
            </Button>
          </div>
        </motion.div>

        <div className="mt-14 grid gap-4 sm:grid-cols-3">
          {statusCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 40, rotateX: 12 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 0.8, delay: 0.25 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -8, rotateX: -4, rotateY: 4 }}
              style={{ transformPerspective: 900 }}
              className="glass float-slow rounded-2xl p-5"
            >
              <card.icon className={`size-5 ${card.accent}`} />
              <p className="mt-4 font-display text-[10px] tracking-[0.28em] text-muted-foreground uppercase">
                {card.label}
              </p>
              <p className="mt-1.5 font-display text-lg font-bold">{card.value}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
