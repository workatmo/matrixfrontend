"use client";

import { useState } from "react";
import { Search, Car } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface HeroSearchProps {
  onSearch: (registrationNumber: string) => void;
  isLoading: boolean;
}

export function HeroSearch({ onSearch, isLoading }: HeroSearchProps) {
  const [regInput, setRegInput] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Auto-uppercase and remove spaces
    setRegInput(e.target.value.toUpperCase().replace(/\s/g, ""));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (regInput.trim()) {
      onSearch(regInput.trim());
    }
  };

  return (
    <section className="bg-black text-white py-20 px-6 sm:px-10">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
          Find the Perfect Tyres for Your Car in Seconds
        </h1>
        <p className="text-lg sm:text-xl text-neutral-400 max-w-2xl mx-auto">
          Enter your vehicle registration number to get instant tyre
          recommendations tailored for your car.
        </p>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl mx-auto mt-10"
        >
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Car className="h-5 w-5 text-neutral-500" />
            </div>
            <Input
              type="text"
              placeholder="Enter Registration (e.g., AB12CDE)"
              className="w-full pl-10 pr-4 py-6 text-lg bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-500 focus-visible:ring-neutral-700 uppercase"
              value={regInput}
              onChange={handleInputChange}
              disabled={isLoading}
              maxLength={10}
            />
          </div>
          <Button
            type="submit"
            size="lg"
            className="w-full sm:w-auto py-6 px-8 text-lg font-medium bg-white text-black hover:bg-neutral-200"
            disabled={!regInput.trim() || isLoading}
          >
            {isLoading ? (
              "Searching..."
            ) : (
              <>
                <Search className="mr-2 h-5 w-5" /> Search Tyres
              </>
            )}
          </Button>
        </form>
      </div>
    </section>
  );
}
