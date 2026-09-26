import fpsPoster from "@/assets/game-fps.jpg";
import racingPoster from "@/assets/game-racing.jpg";
import sportsPoster from "@/assets/game-sports.jpg";
import fightingPoster from "@/assets/game-fighting.jpg";

export type Zone = "pc" | "ps5" | "sim";

export const zones: { id: Zone; label: string }[] = [
  { id: "pc", label: "High-End PCs" },
  { id: "ps5", label: "PS5 Pro Zones" },
  { id: "sim", label: "Racing Simulators" },
];

export const rigs: Record<
  Zone,
  { name: string; specs: string[]; status: "available" | "in-use"; tag: string }[]
> = {
  pc: [
    {
      name: "APEX-01",
      tag: "Flagship",
      status: "available",
      specs: ["RTX 4090 24GB", "i9-14900K", "64GB DDR5", "27\" 240Hz OLED"],
    },
    {
      name: "APEX-02",
      tag: "Flagship",
      status: "in-use",
      specs: ["RTX 4090 24GB", "i9-14900K", "64GB DDR5", "Secretlab Titan"],
    },
    {
      name: "PULSE-07",
      tag: "Competitive",
      status: "available",
      specs: ["RTX 4080 Super", "Ryzen 7 7800X3D", "32GB DDR5", "360Hz IPS"],
    },
    {
      name: "PULSE-11",
      tag: "Competitive",
      status: "in-use",
      specs: ["RTX 4070 Ti", "i7-14700K", "32GB DDR5", "240Hz IPS"],
    },
  ],
  ps5: [
    {
      name: "CONSOLE BAY A",
      tag: "4K Lounge",
      status: "available",
      specs: ["PS5 Pro", "65\" 4K 120Hz OLED", "DualSense Edge x2", "7.1 Surround"],
    },
    {
      name: "CONSOLE BAY B",
      tag: "4K Lounge",
      status: "available",
      specs: ["PS5 Pro", "55\" 4K 120Hz", "DualSense x4", "Recliner Seating"],
    },
    {
      name: "CONSOLE BAY C",
      tag: "Party Pod",
      status: "in-use",
      specs: ["PS5 Pro", "75\" 4K 120Hz", "DualSense x4", "Private Room"],
    },
    {
      name: "CONSOLE BAY D",
      tag: "Party Pod",
      status: "available",
      specs: ["PS5 Pro", "Dual Screens", "Fight Sticks", "Soundbar 5.1"],
    },
  ],
  sim: [
    {
      name: "SIM RIG 01",
      tag: "Full Motion",
      status: "available",
      specs: ["Triple 32\" Curved", "Fanatec DD Pro", "Load-Cell Pedals", "Motion Platform"],
    },
    {
      name: "SIM RIG 02",
      tag: "Formula",
      status: "in-use",
      specs: ["49\" Ultrawide", "Simucube 2 Pro", "Formula Rim", "Bass Shakers"],
    },
    {
      name: "SIM RIG 03",
      tag: "GT Cockpit",
      status: "available",
      specs: ["Triple 27\" 165Hz", "Thrustmaster T818", "H-Shifter", "Handbrake"],
    },
    {
      name: "SIM RIG 04",
      tag: "VR Pod",
      status: "available",
      specs: ["Quest 3 / Pimax", "Fanatec CSL DD", "Bucket Seat", "Wind Sim"],
    },
  ],
};

export type GameCategory = "FPS" | "Racing" | "Sports" | "Fighting";

export const games: {
  title: string;
  category: GameCategory;
  poster: string;
  players: string;
}[] = [
  { title: "Valorant", category: "FPS", poster: fpsPoster, players: "5v5 Tactical" },
  { title: "CS2", category: "FPS", poster: fpsPoster, players: "5v5 Ranked" },
  { title: "Forza Horizon", category: "Racing", poster: racingPoster, players: "Open World" },
  { title: "Assetto Corsa", category: "Racing", poster: racingPoster, players: "Sim Racing" },
  { title: "EA FC 26", category: "Sports", poster: sportsPoster, players: "1v1 / Co-op" },
  { title: "NBA 2K26", category: "Sports", poster: sportsPoster, players: "2v2" },
  { title: "Tekken 8", category: "Fighting", poster: fightingPoster, players: "1v1 Arcade" },
  { title: "Street Fighter 6", category: "Fighting", poster: fightingPoster, players: "1v1 Arcade" },
];

export const pricing = [
  {
    name: "Hourly Blitz",
    price: "Rs 250",
    unit: "/ hour",
    perks: ["Any high-end PC", "Free peripherals", "Unlimited game library", "Energy drink 20% off"],
    highlight: false,
  },
  {
    name: "Night Package",
    price: "Rs 1,200",
    unit: "/ 10pm - 6am",
    perks: [
      "8 hours straight",
      "Reserved APEX rig",
      "Free midnight snack combo",
      "Priority tournament seat",
    ],
    highlight: true,
  },
  {
    name: "Weekend Pass",
    price: "Rs 3,500",
    unit: "/ Fri - Sun",
    perks: ["18 hours pooled", "PS5 Pro + Sim access", "Guest pass included", "VIP lounge entry"],
    highlight: false,
  },
];

export const leaderboard = [
  { rank: 1, team: "PHANTOM SIX", game: "Valorant", points: 4820, streak: "12W" },
  { rank: 2, team: "NEON WOLVES", game: "CS2", points: 4560, streak: "9W" },
  { rank: 3, team: "APEX RONIN", game: "Tekken 8", points: 4310, streak: "7W" },
  { rank: 4, team: "VOLT RIDERS", game: "Assetto Corsa", points: 3980, streak: "5W" },
  { rank: 5, team: "KARACHI KINGS", game: "EA FC 26", points: 3720, streak: "4W" },
  { rank: 6, team: "CIPHER CLAN", game: "Valorant", points: 3540, streak: "3W" },
];

export const tiers = [
  {
    name: "Silver",
    price: "Rs 2,000 / mo",
    progress: 100,
    accent: "silver" as const,
    perks: ["10% off all hours", "Skip-the-queue booking", "Monthly free hour"],
  },
  {
    name: "Gold",
    price: "Rs 4,500 / mo",
    progress: 68,
    accent: "gold" as const,
    perks: ["20% off all hours", "Reserved PULSE rig", "Free tournament entry", "2x loyalty points"],
  },
  {
    name: "VIP",
    price: "Rs 9,000 / mo",
    progress: 24,
    accent: "vip" as const,
    perks: [
      "35% off all hours",
      "Private APEX suite",
      "Unlimited night packages",
      "Personal locker + coach session",
    ],
  },
];

export const paymentMethods = ["Easypaisa", "JazzCash", "Card"];

export const occupiedPCs = [2, 5, 6, 9, 13, 14, 18, 21, 24, 27, 28];
