export type StationStatus = "available" | "occupied" | "reserved" | "maintenance";
export type StationKind = "PC" | "PS5" | "SIM";

export type Station = {
  id: string;
  kind: StationKind;
  status: StationStatus;
  user?: string;
  minutesLeft?: number;
  startsAt?: string;
};

const occupied: Record<number, { user: string; minutesLeft: number }> = {
  2: { user: "Hamza R.", minutesLeft: 42 },
  5: { user: "Bilal K.", minutesLeft: 18 },
  6: { user: "Areeba S.", minutesLeft: 95 },
  9: { user: "Zain A.", minutesLeft: 7 },
  13: { user: "Faraz M.", minutesLeft: 63 },
  14: { user: "Owais T.", minutesLeft: 120 },
  18: { user: "Saad N.", minutesLeft: 31 },
  21: { user: "Rehan Q.", minutesLeft: 54 },
};
const reserved: Record<number, string> = { 4: "18:30", 11: "19:00", 25: "20:15" };
const maintenance = [16, 29];

export const stations: Station[] = [
  ...Array.from({ length: 30 }, (_, i): Station => {
    const n = i + 1;
    const id = `PC-${String(n).padStart(2, "0")}`;
    if (occupied[n]) return { id, kind: "PC", status: "occupied", ...occupied[n] };
    if (reserved[n]) return { id, kind: "PC", status: "reserved", startsAt: reserved[n] };
    if (maintenance.includes(n)) return { id, kind: "PC", status: "maintenance" };
    return { id, kind: "PC", status: "available" };
  }),
  ...Array.from({ length: 5 }, (_, i): Station => {
    const id = `PS5-0${i + 1}`;
    if (i === 1) return { id, kind: "PS5", status: "occupied", user: "Ali & Co.", minutesLeft: 76 };
    if (i === 3) return { id, kind: "PS5", status: "reserved", startsAt: "21:00" };
    return { id, kind: "PS5", status: "available" };
  }),
  ...Array.from({ length: 4 }, (_, i): Station => {
    const id = `SIM-0${i + 1}`;
    if (i === 0) return { id, kind: "SIM", status: "occupied", user: "Danish V.", minutesLeft: 24 };
    if (i === 2) return { id, kind: "SIM", status: "maintenance" };
    return { id, kind: "SIM", status: "available" };
  }),
];

export const statusMeta: Record<
  StationStatus,
  { label: string; dot: string; ring: string; text: string }
> = {
  available: {
    label: "Available",
    dot: "bg-neon-green",
    ring: "border-neon-green/40 bg-neon-green/10",
    text: "text-neon-green",
  },
  occupied: {
    label: "Occupied",
    dot: "bg-neon-red",
    ring: "border-neon-red/45 bg-neon-red/12",
    text: "text-neon-red",
  },
  reserved: {
    label: "Reserved",
    dot: "bg-neon-purple",
    ring: "border-neon-purple/50 bg-neon-purple/15",
    text: "text-neon-purple",
  },
  maintenance: {
    label: "Maintenance",
    dot: "bg-muted-foreground",
    ring: "border-border bg-muted/40",
    text: "text-muted-foreground",
  },
};

export type PaymentStatus = "Paid" | "Pending" | "Failed";
export type Booking = {
  id: string;
  customer: string;
  phone: string;
  system: string;
  date: string;
  slot: string;
  hours: number;
  amount: number;
  payment: PaymentStatus;
  method: "Easypaisa" | "JazzCash" | "Card" | "Cash";
  type: "Online" | "Walk-in";
};

const names = [
  "Hamza Raza",
  "Bilal Khan",
  "Areeba Sheikh",
  "Zain Abbas",
  "Faraz Malik",
  "Owais Tariq",
  "Saad Nawaz",
  "Rehan Qureshi",
  "Danish Vohra",
  "Mahad Iqbal",
  "Usman Ghani",
  "Sana Yousuf",
  "Talha Aziz",
  "Kamran Ali",
  "Noor Fatima",
  "Shayan Dar",
  "Junaid Baig",
  "Hira Siddiqui",
];
const systems = [
  "PC-04",
  "PC-11",
  "PC-25",
  "PC-07",
  "PS5-02",
  "PS5-04",
  "SIM-01",
  "SIM-02",
  "PC-19",
];
const statuses: PaymentStatus[] = ["Paid", "Pending", "Failed", "Paid", "Paid", "Pending"];
const methods: Booking["method"][] = ["Easypaisa", "JazzCash", "Card", "Cash"];

export const bookings: Booking[] = Array.from({ length: 42 }, (_, i) => {
  const hours = [1, 2, 3, 4, 6][i % 5]!;
  return {
    id: `NX-${4200 + i}`,
    customer: names[i % names.length]!,
    phone: `+92 3${(10 + (i % 40)).toString().padStart(2, "0")} 4${(1000000 + i * 3137) % 10000000}`,
    system: systems[i % systems.length]!,
    date: `2026-09-${String(10 + (i % 7)).padStart(2, "0")}`,
    slot: `${14 + (i % 8)}:00 - ${15 + (i % 8) + hours}:00`,
    hours,
    amount: hours * 250 + (i % 3) * 150,
    payment: statuses[i % statuses.length]!,
    method: methods[i % methods.length]!,
    type: i % 3 === 0 ? "Walk-in" : "Online",
  };
});

export const kpis = [
  { label: "Today's Revenue", value: "Rs 84,250", delta: "+12.4%", up: true, accent: "cyan" },
  { label: "Occupancy Rate", value: "72%", delta: "+5.1%", up: true, accent: "purple" },
  { label: "Active Members", value: "318", delta: "+9", up: true, accent: "green" },
  { label: "Pending Approvals", value: "7", delta: "-3", up: false, accent: "red" },
] as const;

export const dailyEarnings = [
  { day: "Mon", pcs: 22000, consoles: 9000, cafe: 5200 },
  { day: "Tue", pcs: 26500, consoles: 11200, cafe: 6100 },
  { day: "Wed", pcs: 31000, consoles: 12800, cafe: 7400 },
  { day: "Thu", pcs: 28400, consoles: 10400, cafe: 6600 },
  { day: "Fri", pcs: 46800, consoles: 19200, cafe: 11800 },
  { day: "Sat", pcs: 52400, consoles: 22600, cafe: 14200 },
  { day: "Sun", pcs: 48100, consoles: 20800, cafe: 12900 },
];

export const monthlyEarnings = [
  { month: "Apr", revenue: 810000 },
  { month: "May", revenue: 905000 },
  { month: "Jun", revenue: 1120000 },
  { month: "Jul", revenue: 1042000 },
  { month: "Aug", revenue: 1284000 },
  { month: "Sep", revenue: 1396000 },
];

export const peakHours = [
  { hour: "12p", sessions: 8 },
  { hour: "2p", sessions: 14 },
  { hour: "4p", sessions: 22 },
  { hour: "6p", sessions: 31 },
  { hour: "8p", sessions: 38 },
  { hour: "10p", sessions: 34 },
  { hour: "12a", sessions: 26 },
  { hour: "2a", sessions: 12 },
];

export const revenueSplit = [
  { name: "High-End PCs", value: 58, key: "pcs" },
  { name: "PS5 Zones", value: 24, key: "ps5" },
  { name: "Cafe Sales", value: 12, key: "cafe" },
  { name: "Sim Racing", value: 6, key: "sim" },
];

export const cafeItems = [
  { name: "Energy Drink", price: 250, stock: 84 },
  { name: "Cold Coffee", price: 320, stock: 41 },
  { name: "Loaded Fries", price: 450, stock: 26 },
  { name: "Zinger Burger", price: 620, stock: 18 },
  { name: "Chicken Wrap", price: 540, stock: 22 },
  { name: "Water Bottle", price: 80, stock: 120 },
];

export const cafeOrders = [
  { id: "CF-812", station: "PC-06", items: "2x Energy Drink, Fries", total: 950, status: "Preparing" },
  { id: "CF-813", station: "PS5-02", items: "Zinger Burger, Cold Coffee", total: 940, status: "Served" },
  { id: "CF-814", station: "SIM-01", items: "Water x2", total: 160, status: "Pending" },
  { id: "CF-815", station: "PC-14", items: "Chicken Wrap, Fries", total: 990, status: "Preparing" },
  { id: "CF-816", station: "PC-21", items: "Cold Coffee", total: 320, status: "Served" },
];

export const gameCatalog = [
  { title: "Valorant", genre: "FPS", platform: "PC", rate: 250, active: true },
  { title: "CS2", genre: "FPS", platform: "PC", rate: 250, active: true },
  { title: "EA FC 26", genre: "Sports", platform: "PS5", rate: 350, active: true },
  { title: "Tekken 8", genre: "Fighting", platform: "PS5", rate: 350, active: true },
  { title: "Assetto Corsa", genre: "Racing", platform: "SIM", rate: 500, active: true },
  { title: "Forza Horizon", genre: "Racing", platform: "PC", rate: 300, active: false },
  { title: "NBA 2K26", genre: "Sports", platform: "PS5", rate: 350, active: true },
  { title: "Street Fighter 6", genre: "Fighting", platform: "PS5", rate: 350, active: false },
];

export const tournaments = [
  {
    name: "Valorant Clash S4",
    game: "Valorant",
    entry: 2000,
    prize: 300000,
    teams: 24,
    maxTeams: 32,
    date: "2026-09-20",
    status: "Registrations Open",
  },
  {
    name: "Tekken Throwdown",
    game: "Tekken 8",
    entry: 800,
    prize: 60000,
    teams: 16,
    maxTeams: 16,
    date: "2026-09-27",
    status: "Bracket Live",
  },
  {
    name: "FC 26 Derby Night",
    game: "EA FC 26",
    entry: 500,
    prize: 40000,
    teams: 12,
    maxTeams: 16,
    date: "2026-10-04",
    status: "Draft",
  },
];

export const bracket = [
  {
    round: "Quarter Finals",
    matches: [
      { a: "Phantom Six", b: "Neon Wolves", winner: "Phantom Six" },
      { a: "Apex Ronin", b: "Volt Riders", winner: "Apex Ronin" },
      { a: "Karachi Kings", b: "Cipher Clan", winner: "Cipher Clan" },
      { a: "Static Void", b: "Grid Runners", winner: "Grid Runners" },
    ],
  },
  {
    round: "Semi Finals",
    matches: [
      { a: "Phantom Six", b: "Apex Ronin", winner: "Phantom Six" },
      { a: "Cipher Clan", b: "Grid Runners", winner: null },
    ],
  },
  {
    round: "Final",
    matches: [{ a: "Phantom Six", b: "TBD", winner: null }],
  },
];

export type Member = {
  id: string;
  name: string;
  phone: string;
  tier: "Silver" | "Gold" | "VIP";
  hours: number;
  points: number;
  joined: string;
  lastVisit: string;
};

export const members: Member[] = [
  { id: "M-101", name: "Hamza Raza", phone: "+92 300 1234567", tier: "VIP", hours: 412, points: 8240, joined: "2025-02-11", lastVisit: "2026-09-16" },
  { id: "M-102", name: "Areeba Sheikh", phone: "+92 321 9988776", tier: "Gold", hours: 268, points: 5310, joined: "2025-06-04", lastVisit: "2026-09-15" },
  { id: "M-103", name: "Zain Abbas", phone: "+92 333 4455661", tier: "Silver", hours: 94, points: 1420, joined: "2026-01-19", lastVisit: "2026-09-14" },
  { id: "M-104", name: "Owais Tariq", phone: "+92 345 7788990", tier: "Gold", hours: 302, points: 6180, joined: "2025-04-27", lastVisit: "2026-09-16" },
  { id: "M-105", name: "Sana Yousuf", phone: "+92 311 2233445", tier: "Silver", hours: 58, points: 760, joined: "2026-05-08", lastVisit: "2026-09-12" },
  { id: "M-106", name: "Danish Vohra", phone: "+92 302 6677889", tier: "VIP", hours: 501, points: 10420, joined: "2024-11-30", lastVisit: "2026-09-16" },
];

export const notifications = [
  { title: "Extension request", body: "PC-09 · Zain A. wants +1 hour", time: "2m" },
  { title: "Payment pending", body: "NX-4218 · Rs 1,500 via JazzCash", time: "9m" },
  { title: "Maintenance flagged", body: "PC-16 reported GPU artifacts", time: "24m" },
  { title: "New registration", body: "Cipher Clan joined Valorant Clash S4", time: "1h" },
];
