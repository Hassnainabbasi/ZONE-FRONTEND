import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { BookingProvider } from "./../context/booking-context";
import { Navbar } from "@/components/gaming/Navbar";
import { Hero } from "@/components/gaming/Hero";
import { Systems } from "@/components/gaming/Systems";
import { Booking } from "@/components/gaming/Booking";
import { GameLibrary } from "@/components/gaming/GameLibrary";
import { Pricing } from "@/components/gaming/Pricing";
import { Tournaments } from "@/components/gaming/Tournaments";
import { Membership } from "@/components/gaming/Membership";
import { Footer } from "@/components/gaming/Footer";
import { MobileBookingBar } from "@/components/gaming/MobileBookingBar";

const title = "Arcadium | Next-Level Gaming Zone & Esports Lounge";
const description =
  "Book RTX 4090 battlestations, PS5 Pro lounges and racing simulators at Arcadium. Live slot booking, tournaments, leaderboards and VIP memberships.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <BookingProvider>
      <div className="min-h-screen overflow-x-hidden bg-background">
        <Navbar />
        <main>
          <Hero />
          <Systems />
          <Booking />
          <GameLibrary />
          <Pricing />
          <Tournaments />
          <Membership />
        </main>
        <Footer />
        <MobileBookingBar />
        <Toaster />
      </div>
    </BookingProvider>
  );
}
