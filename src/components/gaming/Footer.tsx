import { Gamepad2, Instagram, Twitch, Youtube, MapPin, Clock } from "lucide-react";
import { Reveal } from "./Reveal";

export function Footer() {
  return (
    <footer className="relative overflow-hidden pt-16 pb-28 lg:pb-16">
      <div className="neon-divider" />
      <div className="mx-auto max-w-6xl px-4 pt-14 sm:px-6">
        <Reveal className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-xl bg-primary/15 text-primary">
                <Gamepad2 className="size-5" />
              </span>
              <span className="font-display text-sm font-bold tracking-[0.2em] uppercase">
                Cyber<span className="text-neon-cyan">Xtream</span>
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Pakistan's flagship esports arena. Built for competitors, tuned for spectators.
            </p>
          </div>

          <div>
            <h3 className="font-display text-[10px] tracking-[0.28em] text-muted-foreground uppercase">
              Arena
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              {["Systems", "Booking", "Games", "Tournaments"].map((item) => (
                <li key={item}>
                  <button
                    onClick={() =>
                      document
                        .getElementById(item.toLowerCase())
                        ?.scrollIntoView({ behavior: "smooth", block: "start" })
                    }
                    className="transition-colors hover:text-neon-cyan"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-[10px] tracking-[0.28em] text-muted-foreground uppercase">
              Visit
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-neon-cyan" />
                Block 6, Clifton, Karachi
              </li>
              <li className="flex items-start gap-2">
                <Clock className="mt-0.5 size-4 shrink-0 text-neon-cyan" />
                Open 24 / 7
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-[10px] tracking-[0.28em] text-muted-foreground uppercase">
              Follow
            </h3>
            <div className="mt-4 flex gap-3">
              {[Instagram, Twitch, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Social link"
                  className="glass-static grid size-10 place-items-center rounded-xl text-muted-foreground transition-colors hover:text-neon-cyan"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>
        </Reveal>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© 2026 Arcadium All rights reserved.</p>
          <p className="font-display tracking-[0.2em] uppercase">Game On</p>
        </div>
      </div>
    </footer>
  );
}
