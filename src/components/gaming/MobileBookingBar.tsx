import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { useBooking } from "@/context/booking-context";

export function MobileBookingBar() {
  const { seats, hours, total } = useBooking();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 90, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-x-3 bottom-3 z-50 lg:hidden"
      >
        <div className="glass-static flex items-center justify-between gap-3 rounded-2xl px-4 py-3">
          <div className="min-w-0">
            <p className="font-display text-[9px] tracking-[0.22em] text-muted-foreground uppercase">
              {seats.length ? `${seats.length} station · ${hours} hrs` : "Your cart"}
            </p>
            <p className="font-display text-base font-black text-gradient">
              Rs {total.toLocaleString()}
            </p>
          </div>
          <Button
            variant="hero"
            size="sm"
            onClick={() =>
              document
                .getElementById("booking")
                ?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
          >
            {seats.length ? "Checkout" : "Book Now"}
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
