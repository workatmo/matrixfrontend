import { NextResponse } from "next/server";

const mockTyresData = {
  leaf: [
    {
      id: "t1",
      brand: "Michelin",
      model: "Primacy 4",
      size: "205/55 R16",
      season: "Summer",
      price: 110,
      image: "summer",
    },
    {
      id: "t2",
      brand: "Continental",
      model: "PremiumContact 6",
      size: "205/55 R16",
      season: "Summer",
      price: 105,
      image: "summer",
    },
    {
      id: "t3",
      brand: "Goodyear",
      model: "Vector 4Seasons Gen-3",
      size: "205/55 R16",
      season: "All-Season",
      price: 120,
      image: "allseason",
    },
  ],
  tesla: [
    {
      id: "t4",
      brand: "Pirelli",
      model: "P Zero Elect",
      size: "235/45 R18",
      season: "Summer",
      price: 210,
      image: "summer",
    },
    {
      id: "t5",
      brand: "Michelin",
      model: "Pilot Sport EV",
      size: "235/45 R18",
      season: "Summer",
      price: 240,
      image: "summer",
    },
  ],
  default: [
    {
      id: "t6",
      brand: "Bridgestone",
      model: "Turanza T005",
      size: "225/45 R17",
      season: "Summer",
      price: 130,
      image: "summer",
    },
    {
      id: "t7",
      brand: "Michelin",
      model: "CrossClimate 2",
      size: "225/45 R17",
      season: "All-Season",
      price: 150,
      image: "allseason",
    },
  ],
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const vehicle = searchParams.get("vehicle") || "default";

  // Match vehicle to mock data loosely
  let key: keyof typeof mockTyresData = "default";
  if (vehicle.toLowerCase().includes("leaf")) {
    key = "leaf";
  } else if (vehicle.toLowerCase().includes("tesla") || vehicle.toLowerCase().includes("model 3")) {
    key = "tesla";
  }

  // Artificial delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  return NextResponse.json({ tyres: mockTyresData[key] });
}
