"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CheckCircle2, ChevronLeft, ChevronRight, CalendarClock, Car, User, FileText } from "lucide-react";

interface Slot {
  id: number;
  day: string;
  start_time: string;
  end_time: string;
}

interface CheckoutConfig {
  vat_enabled: boolean;
  vat_percentage: number;
  platform_fee_enabled: boolean;
  platform_fee: number;
  currency: string;
}

function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Booking Data from URL
  const tyre_id = searchParams.get("tyre_id");
  const tyre_brand = searchParams.get("tyre_brand") || "";
  const tyre_model = searchParams.get("tyre_model") || "";
  const tyre_size = searchParams.get("tyre_size") || "";
  const tyre_price = searchParams.get("tyre_price") || "0";
  const vehicle_reg = searchParams.get("vehicle_reg") || "";
  const vehicle_make = searchParams.get("vehicle_make") || "";
  const vehicle_model = searchParams.get("vehicle_model") || "";

  // Form State
  const [step, setStep] = useState(1);
  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [tyreQuantity, setTyreQuantity] = useState<number>(4);
  
  const [slots, setSlots] = useState<Slot[]>([]);
  const [checkoutConfig, setCheckoutConfig] = useState<CheckoutConfig>({
    vat_enabled: false,
    vat_percentage: 0,
    platform_fee_enabled: false,
    platform_fee: 0,
    currency: "GBP",
  });
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch slots
  useEffect(() => {
    async function fetchSlots() {
      setIsLoadingSlots(true);
      try {
        const res = await fetch("/api/public/slots");
        if (res.ok) {
          const data = await res.json();
          setSlots(data.data.slots || []);
        } else {
          toast.error("Failed to load available slots");
        }
      } catch (e: unknown) {
        console.error("Fetch slots error:", e);
        toast.error("Error connecting to server");
      } finally {
        setIsLoadingSlots(false);
      }
    }
    fetchSlots();
  }, []);

  useEffect(() => {
    async function fetchCheckoutConfig() {
      try {
        const res = await fetch("/api/public/checkout-config", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        const cfg = data?.data;
        setCheckoutConfig({
          vat_enabled: Boolean(cfg?.vat_enabled),
          vat_percentage:
            typeof cfg?.vat_percentage === "number"
              ? cfg.vat_percentage
              : Number(cfg?.vat_percentage ?? 0),
          platform_fee_enabled: Boolean(cfg?.platform_fee_enabled),
          platform_fee:
            typeof cfg?.platform_fee === "number"
              ? cfg.platform_fee
              : Number(cfg?.platform_fee ?? 0),
          currency: typeof cfg?.currency === "string" && cfg.currency ? cfg.currency : "GBP",
        });
      } catch {
        // Keep defaults for resilient checkout flow.
      }
    }
    void fetchCheckoutConfig();
  }, []);

  const unitPrice = Number.parseFloat(tyre_price) || 0;
  const subtotal = unitPrice * tyreQuantity;
  const platformFee = checkoutConfig.platform_fee_enabled ? checkoutConfig.platform_fee : 0;
  const taxBase = subtotal + platformFee;
  const vatAmount = checkoutConfig.vat_enabled
    ? (taxBase * checkoutConfig.vat_percentage) / 100
    : 0;
  const total = subtotal + platformFee + vatAmount;
  const currencySymbol = checkoutConfig.currency.toUpperCase() === "GBP" ? "£" : `${checkoutConfig.currency.toUpperCase()} `;

  // Handlers
  const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomer(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const nextStep = () => {
    if (step === 1) {
      if (!customer.name || !customer.email || !customer.phone || !customer.address) {
        toast.error("Please fill in all details");
        return;
      }
      // Simple email validation
      if (!/^\S+@\S+\.\S+$/.test(customer.email)) {
        toast.error("Please enter a valid email");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!selectedSlot) {
        toast.error("Please select a time slot");
        return;
      }
      setStep(3);
    }
  };

  const prevStep = () => {
    setStep(prev => Math.max(1, prev - 1));
  };

  const confirmBooking = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/public/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...customer,
          slot_id: selectedSlot?.id,
          vehicle_registration: vehicle_reg,
          vehicle_make,
          vehicle_model,
          tyre_brand,
          tyre_model,
          tyre_size,
          tyre_quantity: tyreQuantity,
          tyre_unit_price: unitPrice,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to confirm booking");
      }

      const json = await res.json();
      const orderId =
        (json?.data?.order?.id as number | undefined) ??
        (json?.data?.order?.order?.id as number | undefined);

      if (!orderId) {
        throw new Error("Booking created, but order id was missing.");
      }

      // Start Stripe checkout (test by default; backend gates by API Settings toggles/keys).
      const stripeRes = await fetch(`/api/public/orders/${orderId}/stripe-checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "test" }),
      });
      const stripeJson = await stripeRes.json().catch(() => ({}));
      if (!stripeRes.ok) {
        throw new Error(stripeJson?.message || "Failed to start payment.");
      }

      const url = stripeJson?.data?.url as string | undefined;
      if (!url) {
        throw new Error("Stripe did not return a checkout URL.");
      }

      window.location.assign(url);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to process booking";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!tyre_id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Invalid Booking URL</h2>
          <p className="text-neutral-500 mb-6">Please start the booking process again from the home page.</p>
          <Button onClick={() => router.push("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  // Format slots logically group by day
  const groupedSlots = slots.reduce((acc, slot) => {
    if (!acc[slot.day]) acc[slot.day] = [];
    acc[slot.day].push(slot);
    return acc;
  }, {} as Record<string, Slot[]>);

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        
        {/* Header / Stepper */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-6">Complete your booking</h1>
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-neutral-200 -z-10"></div>
            <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-black -z-10 transition-all duration-500 ${step === 1 ? 'w-0' : step === 2 ? 'w-1/2' : 'w-full'}`}></div>
            
            {[1, 2, 3].map((s) => (
              <div key={s} className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-colors duration-300 ${step >= s ? 'bg-black text-white' : 'bg-white border-2 border-neutral-200 text-neutral-400'}`}>
                {s < step ? <CheckCircle2 size={16} /> : s}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs font-medium text-neutral-500 px-1">
            <span className={step >= 1 ? 'text-black' : ''}>Details</span>
            <span className={step >= 2 ? 'text-black' : ''}>Time Slot</span>
            <span className={step >= 3 ? 'text-black' : ''}>Confirmation</span>
          </div>
        </div>

        {/* Form Area */}
        <Card className="shadow-lg border-neutral-200/60 overflow-hidden bg-white text-neutral-900">
          {/* Step 1: Customer Details */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <CardHeader className="bg-white border-b border-neutral-100">
                <CardTitle className="flex items-center gap-2 text-neutral-900">
                  <User size={20} className="text-neutral-500" />
                  Customer Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-neutral-900">Full Name</Label>
                    <Input id="name" name="name" value={customer.name} onChange={handleCustomerChange} placeholder="John Doe" className="bg-white text-neutral-900 border-neutral-300" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-neutral-900">Phone Number</Label>
                    <Input id="phone" name="phone" value={customer.phone} onChange={handleCustomerChange} placeholder="07123 456789" className="bg-white text-neutral-900 border-neutral-300" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-neutral-900">Email Address</Label>
                  <Input id="email" name="email" type="email" value={customer.email} onChange={handleCustomerChange} placeholder="john@example.com" className="bg-white text-neutral-900 border-neutral-300" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-neutral-900">Fitting Address / Notes</Label>
                    <Input id="address" name="address" value={customer.address} onChange={handleCustomerChange} placeholder="123 High Street, London, SW1A 1AA" className="bg-white text-neutral-900 border-neutral-300" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tyreQuantity" className="text-neutral-900">Tyre Quantity</Label>
                    <select
                      id="tyreQuantity"
                      name="tyreQuantity"
                      value={tyreQuantity}
                      onChange={(e) => setTyreQuantity(parseInt(e.target.value))}
                      className="flex h-10 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                    >
                      {[1, 2, 3, 4, 5, 6].map(num => (
                        <option key={num} value={num}>{num} {num === 1 ? 'Tyre' : 'Tyres'}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-6 border-t border-neutral-100 bg-neutral-50/50">
                <Button variant="outline" className="text-neutral-900 border-neutral-300 bg-white hover:bg-neutral-100" onClick={() => router.back()}>Cancel</Button>
                <Button onClick={nextStep} className="gap-2 bg-black text-white hover:bg-neutral-800">Continue <ChevronRight size={16} /></Button>
              </CardFooter>
            </div>
          )}

          {/* Step 2: Slot Selection */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <CardHeader className="bg-white border-b border-neutral-100">
                <CardTitle className="flex items-center gap-2 text-neutral-900">
                  <CalendarClock size={20} className="text-neutral-500" />
                  Select Fiting Slot
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 bg-white">
                {isLoadingSlots ? (
                  <div className="flex justify-center py-10">
                    <div className="animate-spin w-8 h-8 border-4 border-neutral-200 border-t-black rounded-full"></div>
                  </div>
                ) : slots.length === 0 ? (
                  <div className="text-center py-10 text-neutral-500">
                    No slots available right now. Please try again later.
                  </div>
                ) : (
                  <div className="space-y-8">
                    {Object.keys(groupedSlots).map(day => (
                      <div key={day}>
                        <h3 className="font-semibold text-lg capitalize mb-3 text-neutral-800 border-b pb-2">{day}</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {groupedSlots[day].map(slot => (
                            <button
                              key={slot.id}
                              onClick={() => setSelectedSlot(slot)}
                              className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                                selectedSlot?.id === slot.id 
                                  ? 'bg-black text-white border-black shadow-md ring-2 ring-black ring-offset-2' 
                                  : 'bg-white text-neutral-700 border-neutral-200 hover:border-black/50 hover:bg-neutral-50'
                              }`}
                            >
                              {slot.start_time} - {slot.end_time}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between pt-6 border-t border-neutral-100 bg-neutral-50/50">
                <Button variant="outline" onClick={prevStep} className="gap-2 text-neutral-900 border-neutral-300 bg-white hover:bg-neutral-100"><ChevronLeft size={16} /> Back</Button>
                <Button onClick={nextStep} className="gap-2 bg-black text-white hover:bg-neutral-800" disabled={!selectedSlot}>Continue <ChevronRight size={16} /></Button>
              </CardFooter>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <CardHeader className="bg-white border-b border-neutral-100">
                <CardTitle className="flex items-center gap-2 text-neutral-900">
                  <FileText size={20} className="text-neutral-500" />
                  Review & Confirm
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6 bg-white">
                 
                 {/* Summary Grid */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {/* Left Column */}
                   <div className="space-y-6">
                     <div className="bg-neutral-50 rounded-xl p-5 border border-neutral-100">
                       <h4 className="flex items-center gap-2 font-semibold text-neutral-900 mb-3"><Car size={16} /> Vehicle & Tyre</h4>
                       <div className="space-y-2 text-sm">
                         <div className="flex justify-between"><span className="text-neutral-500">Registration</span><span className="font-medium uppercase text-neutral-900">{vehicle_reg}</span></div>
                         <div className="flex justify-between"><span className="text-neutral-500">Vehicle</span><span className="font-medium text-neutral-900">{vehicle_make} {vehicle_model}</span></div>
                         <div className="w-full h-[1px] bg-neutral-200 my-2"></div>
                         <div className="flex justify-between"><span className="text-neutral-500">Tyre</span><span className="font-medium text-right text-neutral-900">{tyre_brand} {tyre_model}</span></div>
                         <div className="flex justify-between"><span className="text-neutral-500">Size</span><span className="font-medium text-neutral-900">{tyre_size}</span></div>
                         <div className="flex justify-between"><span className="text-neutral-500">Quantity</span><span className="font-medium text-neutral-900">{tyreQuantity}x</span></div>
                       </div>
                     </div>

                     <div className="bg-neutral-50 rounded-xl p-5 border border-neutral-100">
                       <h4 className="flex items-center gap-2 font-semibold text-neutral-900 mb-3"><CalendarClock size={16} /> Fitting Time</h4>
                       <div className="space-y-1 text-sm">
                         <p className="font-medium capitalize text-lg text-neutral-900">{selectedSlot?.day}</p>
                         <p className="text-neutral-500">{selectedSlot?.start_time} - {selectedSlot?.end_time}</p>
                       </div>
                     </div>
                   </div>

                   {/* Right Column */}
                   <div className="space-y-6">
                     <div className="bg-neutral-50 rounded-xl p-5 border border-neutral-100">
                       <h4 className="flex items-center gap-2 font-semibold text-neutral-900 mb-3"><User size={16} /> Personal Details</h4>
                       <div className="space-y-2 text-sm flex flex-col">
                         <span className="font-medium text-neutral-900">{customer.name}</span>
                         <span className="text-neutral-600">{customer.phone}</span>
                         <span className="text-neutral-600">{customer.email}</span>
                         <span className="text-neutral-600 mt-2 pt-2 border-t border-neutral-200">{customer.address}</span>
                       </div>
                     </div>

                     <div className="bg-neutral-900 text-white rounded-xl p-6 shadow-sm">
                       <h4 className="font-semibold mb-4 text-neutral-400">Payment Summary</h4>
                       <div className="space-y-3">
                         <div className="flex justify-between text-sm"><span className="text-neutral-300">Subtotal ({tyreQuantity}x)</span><span>{currencySymbol}{subtotal.toFixed(2)}</span></div>
                         <div className="flex justify-between text-sm"><span className="text-neutral-300">Platform Fee</span><span>{currencySymbol}{platformFee.toFixed(2)}</span></div>
                         <div className="flex justify-between text-sm"><span className="text-neutral-300">VAT ({checkoutConfig.vat_enabled ? `${checkoutConfig.vat_percentage}%` : "Disabled"})</span><span>{currencySymbol}{vatAmount.toFixed(2)}</span></div>
                         <div className="w-full h-[1px] bg-neutral-700 my-3"></div>
                         <div className="flex justify-between items-center">
                           <span className="font-bold text-lg">Total</span>
                           <span className="font-bold text-2xl">{currencySymbol}{total.toFixed(2)}</span>
                         </div>
                       </div>
                     </div>
                   </div>
                 </div>

              </CardContent>
              <CardFooter className="flex justify-between pt-6 border-t border-neutral-100 bg-neutral-50/50">
                <Button variant="outline" onClick={prevStep} className="gap-2 text-neutral-900 border-neutral-300 bg-white hover:bg-neutral-100" disabled={isSubmitting}><ChevronLeft size={16} /> Back</Button>
                <Button onClick={confirmBooking} className="px-8 bg-green-600 hover:bg-green-700 text-white border-0" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                       <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                       Processing...
                    </span>
                  ) : "Confirm Booking"}
                </Button>
              </CardFooter>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-neutral-50"><div className="animate-spin w-8 h-8 border-4 border-neutral-200 border-t-black rounded-full"></div></div>}>
      <CheckoutPageContent />
    </Suspense>
  );
}
