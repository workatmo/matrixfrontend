"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CalendarClock,
  Car,
  User,
  FileText,
  MapPin,
  Loader2,
} from "lucide-react";

interface Slot {
  id: number;
  day: string;
  start_time: string;
  end_time: string;
}

interface SlotOccupancyEntry {
  slot_id: number;
  date: string;
}

interface CheckoutConfig {
  vat_enabled: boolean;
  vat_percentage: number;
  platform_fee_enabled: boolean;
  platform_fee: number;
  currency: string;
}

type CheckoutConfigStatus = "loading" | "ready" | "error";

const CHECKOUT_FORM_STORAGE_KEY = "checkout_form";

/** Shape stored in localStorage under `checkout_form` (note = customer comment). */
type CheckoutFormPersist = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  vehicle_reg: string;
  address: string;
  city: string;
  postcode: string;
  note: string;
};

const STEPPER_LABELS = ["Basic Details", "Address Details", "Time Slot", "Confirmation"] as const;

/** JS getDay() 0 = Sunday … 6 = Saturday → Laravel slot `day` enum */
const SLOT_DAY_KEYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function dateToSlotDayKey(date: Date): string {
  return SLOT_DAY_KEYS[date.getDay()] ?? "monday";
}

function timeStringToMinutes(t: string): number {
  const [h = "0", m = "0"] = t.split(":");
  return parseInt(h, 10) * 60 + parseInt(m, 10);
}

/** Keep MOT-style window: from 09:00 inclusive to before 18:00 start */
function isSlotInBusinessWindow(slot: Slot): boolean {
  const start = timeStringToMinutes(slot.start_time);
  return start >= 9 * 60 && start < 18 * 60;
}

function formatDayShort(d: Date): string {
  return d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
}

function formatDateTile(d: Date): string {
  const dayNum = String(d.getDate()).padStart(2, "0");
  const mon = d.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
  return `${dayNum} ${mon}`;
}

function formatHeaderDate(d: Date): string {
  const x = startOfDay(d);
  const dd = String(x.getDate()).padStart(2, "0");
  const mm = String(x.getMonth() + 1).padStart(2, "0");
  const yyyy = x.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

/** `Y-m-d` in local calendar (for API fitting_date + occupancy keys). */
function toDateKey(d: Date): string {
  const x = startOfDay(d);
  const y = x.getFullYear();
  const m = String(x.getMonth() + 1).padStart(2, "0");
  const day = String(x.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatShortTime(t: string): string {
  const m = t.match(/^(\d{2}):(\d{2})/);
  return m ? `${m[1]}:${m[2]}` : t;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    startOfDay(a).getTime() === startOfDay(b).getTime()
  );
}

function isPastCalendarDay(d: Date): boolean {
  return startOfDay(d).getTime() < startOfDay(new Date()).getTime();
}

function generateCalendarDates(): Date[] {
  const today = startOfDay(new Date());
  const dates: Date[] = [];
  for (let i = 0; i < 20; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(startOfDay(d));
  }
  return dates;
}

function RequiredStar() {
  return (
    <span className="text-red-600" aria-hidden="true">
      *
    </span>
  );
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
  const vehicle_make = searchParams.get("vehicle_make") || "";
  const vehicle_model = searchParams.get("vehicle_model") || "";

  // Form State
  const [step, setStep] = useState(1);
  const [customer, setCustomer] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postcode: "",
    customer_comment: "",
  });
  const [vehicleRegistration, setVehicleRegistration] = useState(
    () => searchParams.get("vehicle_reg")?.trim() || ""
  );
  /** Raw digits while typing; parsed via `tyreQuantity` for totals and API. */
  const [tyreQtyStr, setTyreQtyStr] = useState("1");
  const tyreQuantity = useMemo(() => {
    const trimmed = tyreQtyStr.trim();
    if (trimmed === "") return 1;
    const n = Number.parseInt(trimmed, 10);
    if (Number.isNaN(n)) return 1;
    return Math.max(1, Math.min(999, n));
  }, [tyreQtyStr]);

  const [slots, setSlots] = useState<Slot[]>([]);
  const [checkoutConfig, setCheckoutConfig] = useState<CheckoutConfig>({
    vat_enabled: false,
    vat_percentage: 0,
    platform_fee_enabled: false,
    platform_fee: 0,
    currency: "GBP",
  });
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()));
  const [occupancy, setOccupancy] = useState<SlotOccupancyEntry[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutConfigStatus, setCheckoutConfigStatus] = useState<CheckoutConfigStatus>("loading");
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);

  const calendarDates = useMemo(() => generateCalendarDates(), []);

  const slotsForSelectedDate = useMemo(() => {
    const key = dateToSlotDayKey(selectedDate);
    return slots
      .filter((s) => s.day.toLowerCase() === key && isSlotInBusinessWindow(s))
      .sort((a, b) => timeStringToMinutes(a.start_time) - timeStringToMinutes(b.start_time));
  }, [slots, selectedDate]);

  const bookedSlotKeys = useMemo(() => {
    const set = new Set<string>();
    for (const o of occupancy) {
      if (o.date && o.slot_id != null) {
        set.add(`${o.date}|${o.slot_id}`);
      }
    }
    return set;
  }, [occupancy]);

  const bookingPreview = useMemo(
    () => ({
      date: selectedDate,
      slot: selectedSlot,
      timeLabel:
        selectedSlot != null
          ? `${formatShortTime(selectedSlot.start_time)}–${formatShortTime(selectedSlot.end_time)}`
          : null,
    }),
    [selectedDate, selectedSlot]
  );

  useEffect(() => {
    const key = dateToSlotDayKey(selectedDate);
    setSelectedSlot((prev) => (prev && prev.day !== key ? null : prev));
  }, [selectedDate]);

  useEffect(() => {
    if (calendarDates.length === 0) return;
    const from = toDateKey(calendarDates[0]);
    const to = toDateKey(calendarDates[calendarDates.length - 1]);
    async function loadOccupancy() {
      try {
        const res = await fetch(
          `/api/public/slots/occupancy?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
        );
        if (!res.ok) return;
        const json = await res.json();
        const rows = json?.data?.occupancy;
        if (Array.isArray(rows)) {
          setOccupancy(
            rows
              .filter(
                (r: unknown) =>
                  r &&
                  typeof r === "object" &&
                  "slot_id" in r &&
                  "date" in r &&
                  typeof (r as SlotOccupancyEntry).slot_id === "number" &&
                  typeof (r as SlotOccupancyEntry).date === "string"
              )
              .map((r: SlotOccupancyEntry) => ({
                slot_id: r.slot_id,
                date: r.date,
              }))
          );
        }
      } catch {
        // non-blocking
      }
    }
    void loadOccupancy();
  }, [calendarDates]);

  useEffect(() => {
    setSelectedSlot((prev) => {
      if (!prev) return prev;
      if (bookedSlotKeys.has(`${toDateKey(selectedDate)}|${prev.id}`)) return null;
      return prev;
    });
  }, [bookedSlotKeys, selectedDate]);

  // Restore checkout draft from localStorage (client-only; avoids overwriting before read).
  useEffect(() => {
    if (typeof window === "undefined") {
      setHasRestoredDraft(true);
      return;
    }
    const urlVehicleReg = searchParams.get("vehicle_reg")?.trim() ?? "";
    try {
      const raw = localStorage.getItem(CHECKOUT_FORM_STORAGE_KEY);
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw) as Partial<CheckoutFormPersist>;
      setCustomer((prev) => ({
        first_name: typeof parsed.first_name === "string" ? parsed.first_name : prev.first_name,
        last_name: typeof parsed.last_name === "string" ? parsed.last_name : prev.last_name,
        email: typeof parsed.email === "string" ? parsed.email : prev.email,
        phone: typeof parsed.phone === "string" ? parsed.phone : prev.phone,
        address: typeof parsed.address === "string" ? parsed.address : prev.address,
        city: typeof parsed.city === "string" ? parsed.city : prev.city,
        postcode: typeof parsed.postcode === "string" ? parsed.postcode : prev.postcode,
        customer_comment: typeof parsed.note === "string" ? parsed.note : prev.customer_comment,
      }));
      const savedRegTrim =
        typeof parsed.vehicle_reg === "string" ? parsed.vehicle_reg.trim() : "";
      setVehicleRegistration(savedRegTrim !== "" ? savedRegTrim : urlVehicleReg);
    } catch {
      // ignore invalid JSON
    } finally {
      setHasRestoredDraft(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- restore once on mount; URL fallback captured here
  }, []);

  // Persist draft whenever contact/address fields change (after initial restore).
  useEffect(() => {
    if (!hasRestoredDraft || typeof window === "undefined") return;
    const payload: CheckoutFormPersist = {
      first_name: customer.first_name,
      last_name: customer.last_name,
      email: customer.email,
      phone: customer.phone,
      vehicle_reg: vehicleRegistration,
      address: customer.address,
      city: customer.city,
      postcode: customer.postcode,
      note: customer.customer_comment,
    };
    try {
      localStorage.setItem(CHECKOUT_FORM_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // quota or private mode
    }
  }, [customer, vehicleRegistration, hasRestoredDraft]);

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
      setCheckoutConfigStatus("loading");
      try {
        const res = await fetch("/api/public/checkout-config", { cache: "no-store" });
        if (!res.ok) {
          setCheckoutConfigStatus("error");
          return;
        }
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
        setCheckoutConfigStatus("ready");
      } catch {
        setCheckoutConfigStatus("error");
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
  const currencySymbol =
    checkoutConfig.currency.toUpperCase() === "GBP" ? "£" : `${checkoutConfig.currency.toUpperCase()} `;

  const handleCustomerInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCustomer((prev) => ({ ...prev, [name]: value }));
  };

  const progressPercent = ((step - 1) / 3) * 100;

  const nextStep = () => {
    if (step === 1) {
      if (
        !customer.first_name.trim() ||
        !customer.last_name.trim() ||
        !customer.email.trim() ||
        !customer.phone.trim()
      ) {
        toast.error("Please fill in all basic details");
        return;
      }
      if (!/^\S+@\S+\.\S+$/.test(customer.email.trim())) {
        toast.error("Please enter a valid email");
        return;
      }
      setStep(2);
      return;
    }
    if (step === 2) {
      if (!customer.address.trim() || !customer.city.trim() || !customer.postcode.trim()) {
        toast.error("Please fill in address, city, and post code");
        return;
      }
      setStep(3);
      return;
    }
    if (step === 3) {
      if (!selectedSlot) {
        toast.error("Please select a time slot");
        return;
      }
      if (bookedSlotKeys.has(`${toDateKey(selectedDate)}|${selectedSlot.id}`)) {
        toast.error("That time slot is no longer available. Please choose another.");
        setSelectedSlot(null);
        return;
      }
      setStep(4);
    }
  };

  const prevStep = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  const confirmBooking = async () => {
    setIsSubmitting(true);
    try {
      const comment = customer.customer_comment.trim();
      const res = await fetch("/api/public/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: customer.first_name.trim(),
          last_name: customer.last_name.trim(),
          email: customer.email.trim(),
          phone: customer.phone.trim(),
          address: customer.address.trim(),
          city: customer.city.trim(),
          postcode: customer.postcode.trim(),
          ...(comment ? { customer_comment: comment } : {}),
          slot_id: selectedSlot?.id,
          fitting_date: toDateKey(selectedDate),
          vehicle_registration: vehicleRegistration.trim(),
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

      try {
        localStorage.removeItem(CHECKOUT_FORM_STORAGE_KEY);
      } catch {
        // ignore
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

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1
            className={`text-3xl font-bold text-neutral-900 ${
              checkoutConfigStatus === "ready" ? "mb-6" : "mb-2"
            }`}
          >
            Complete your booking
          </h1>
          {checkoutConfigStatus === "loading" ? (
            <p className="flex items-center gap-2 text-sm text-neutral-500 mb-4">
              <Loader2 className="h-4 w-4 shrink-0 animate-spin text-neutral-600" aria-hidden />
              Loading pricing settings…
            </p>
          ) : checkoutConfigStatus === "error" ? (
            <p className="text-sm text-neutral-500 mb-4">
              Could not load latest tax settings; totals may use defaults.
            </p>
          ) : null}
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-neutral-200 -z-10" />
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-black -z-10 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />

            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-colors duration-300 ${
                  step >= s ? "bg-black text-white" : "bg-white border-2 border-neutral-200 text-neutral-400"
                }`}
              >
                {step > s ? <CheckCircle2 size={16} /> : s}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs font-medium text-neutral-500 px-0 gap-1">
            {STEPPER_LABELS.map((label, i) => (
              <span
                key={label}
                className={`text-center flex-1 min-w-0 ${step >= i + 1 ? "text-black" : ""}`}
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        <Card className="shadow-lg border-neutral-200/60 overflow-hidden bg-white text-neutral-900">
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <CardHeader className="bg-white border-b border-neutral-100">
                <CardTitle className="flex items-center gap-2 text-neutral-900">
                  <User size={20} className="text-neutral-500" />
                  Basic Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name" className="text-neutral-900">
                      First Name <RequiredStar />
                    </Label>
                    <Input
                      id="first_name"
                      name="first_name"
                      value={customer.first_name}
                      onChange={handleCustomerInputChange}
                      placeholder="John"
                      required
                      aria-required="true"
                      className="bg-white text-neutral-900 border-neutral-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name" className="text-neutral-900">
                      Last Name <RequiredStar />
                    </Label>
                    <Input
                      id="last_name"
                      name="last_name"
                      value={customer.last_name}
                      onChange={handleCustomerInputChange}
                      placeholder="Doe"
                      required
                      aria-required="true"
                      className="bg-white text-neutral-900 border-neutral-300"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-neutral-900">
                    Email Address <RequiredStar />
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={customer.email}
                    onChange={handleCustomerInputChange}
                    placeholder="john@example.com"
                    required
                    aria-required="true"
                    className="bg-white text-neutral-900 border-neutral-300"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-neutral-900">
                      Phone <RequiredStar />
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={customer.phone}
                      onChange={handleCustomerInputChange}
                      placeholder="07123 456789"
                      required
                      aria-required="true"
                      className="bg-white text-neutral-900 border-neutral-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vehicle_registration" className="text-neutral-900">
                      Vehicle Registration Number{" "}
                      <span className="text-neutral-400 font-normal">(optional)</span>
                    </Label>
                    <Input
                      id="vehicle_registration"
                      name="vehicle_registration"
                      value={vehicleRegistration}
                      onChange={(e) => setVehicleRegistration(e.target.value)}
                      placeholder="AB12 CDE"
                      className="bg-white text-neutral-900 border-neutral-300 uppercase"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-6 border-t border-neutral-100 bg-neutral-50/50">
                <Button
                  variant="outline"
                  className="text-neutral-900 border-neutral-300 bg-white hover:bg-neutral-100"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button onClick={nextStep} className="gap-2 bg-black text-white hover:bg-neutral-800">
                  Continue <ChevronRight size={16} />
                </Button>
              </CardFooter>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <CardHeader className="bg-white border-b border-neutral-100">
                <CardTitle className="flex items-center gap-2 text-neutral-900">
                  <MapPin size={20} className="text-neutral-500" />
                  Address Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6 bg-white">
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-neutral-900">
                    Address <RequiredStar />
                  </Label>
                  <Input
                    id="address"
                    name="address"
                    value={customer.address}
                    onChange={handleCustomerInputChange}
                    placeholder="123 High Street"
                    required
                    aria-required="true"
                    className="bg-white text-neutral-900 border-neutral-300"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-neutral-900">
                      City <RequiredStar />
                    </Label>
                    <Input
                      id="city"
                      name="city"
                      value={customer.city}
                      onChange={handleCustomerInputChange}
                      placeholder="London"
                      required
                      aria-required="true"
                      className="bg-white text-neutral-900 border-neutral-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postcode" className="text-neutral-900">
                      Post Code <RequiredStar />
                    </Label>
                    <Input
                      id="postcode"
                      name="postcode"
                      value={customer.postcode}
                      onChange={handleCustomerInputChange}
                      placeholder="SW1A 1AA"
                      required
                      aria-required="true"
                      className="bg-white text-neutral-900 border-neutral-300"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer_comment" className="text-neutral-900">
                    Comment / Note
                  </Label>
                  <Textarea
                    id="customer_comment"
                    name="customer_comment"
                    value={customer.customer_comment}
                    onChange={handleCustomerInputChange}
                    placeholder="Access instructions, preferred contact time, etc."
                    rows={4}
                    className="bg-white text-neutral-900 border-neutral-300 min-h-[100px]"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-6 border-t border-neutral-100 bg-neutral-50/50">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  className="gap-2 text-neutral-900 border-neutral-300 bg-white hover:bg-neutral-100"
                >
                  <ChevronLeft size={16} /> Back
                </Button>
                <Button onClick={nextStep} className="gap-2 bg-black text-white hover:bg-neutral-800">
                  Continue <ChevronRight size={16} />
                </Button>
              </CardFooter>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <CardHeader className="bg-white border-b border-neutral-100">
                <CardTitle className="flex items-center gap-2 text-neutral-900">
                  <CalendarClock size={20} className="text-neutral-500" />
                  Select Fitting Slot
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 bg-white px-4 sm:px-6">
                {isLoadingSlots ? (
                  <div className="flex justify-center py-10">
                    <div className="animate-spin w-8 h-8 border-4 border-neutral-200 border-t-black rounded-full" />
                  </div>
                ) : slots.length === 0 ? (
                  <div className="text-center py-10 text-neutral-500">
                    No slots available right now. Please try again later.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-3">
                        Select a date
                      </p>
                      <div className="grid grid-cols-5 gap-2">
                        {calendarDates.map((date) => {
                          const past = isPastCalendarDay(date);
                          const selected = isSameDay(date, selectedDate);
                          return (
                            <button
                              key={date.getTime()}
                              type="button"
                              disabled={past}
                              onClick={() => setSelectedDate(startOfDay(date))}
                              className={`flex min-h-[4.5rem] flex-col items-center justify-center rounded-xl border px-1 py-2 text-center text-xs font-semibold transition-all ${
                                past
                                  ? "cursor-not-allowed border-neutral-100 bg-neutral-50 text-neutral-300"
                                  : selected
                                    ? "border-emerald-600 bg-emerald-600 text-white shadow-md ring-2 ring-emerald-600 ring-offset-2"
                                    : "border-neutral-200 bg-white text-neutral-800 hover:border-emerald-500/60 hover:bg-emerald-50/50"
                              }`}
                            >
                              <span className="leading-tight">{formatDayShort(date)}</span>
                              <span className="mt-1 text-[0.7rem] font-bold leading-tight">
                                {formatDateTile(date)}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-neutral-900 mb-3">
                        Slot for {formatHeaderDate(selectedDate)}
                      </h3>
                      {slotsForSelectedDate.length === 0 ? (
                        <p className="text-sm text-neutral-500 py-8 text-center rounded-xl border border-dashed border-neutral-200 bg-neutral-50/80">
                          No slots for this day.
                        </p>
                      ) : (
                        <div className="grid grid-cols-5 gap-2">
                          {slotsForSelectedDate.map((slot) => {
                            const booked = bookedSlotKeys.has(`${toDateKey(selectedDate)}|${slot.id}`);
                            const active = !booked && selectedSlot?.id === slot.id;
                            return (
                              <button
                                key={slot.id}
                                type="button"
                                disabled={booked}
                                onClick={() => {
                                  if (!booked) setSelectedSlot(slot);
                                }}
                                className={`min-h-11 rounded-xl border px-1 py-2 text-center text-xs font-semibold transition-all ${
                                  booked
                                    ? "cursor-not-allowed border-neutral-200 bg-neutral-200 text-neutral-500"
                                    : active
                                      ? "border-emerald-600 bg-emerald-600 text-white shadow-md ring-2 ring-emerald-600 ring-offset-1"
                                      : "border-neutral-200 bg-white text-neutral-800 hover:border-emerald-500/60 hover:bg-emerald-50/50"
                                }`}
                              >
                                {formatShortTime(slot.start_time)}
                                <span className="block text-[0.65rem] font-normal opacity-90">
                                  {formatShortTime(slot.end_time)}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between pt-6 border-t border-neutral-100 bg-neutral-50/50">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  className="gap-2 text-neutral-900 border-neutral-300 bg-white hover:bg-neutral-100"
                >
                  <ChevronLeft size={16} /> Back
                </Button>
                <Button
                  onClick={nextStep}
                  className="gap-2 bg-black text-white hover:bg-neutral-800"
                  disabled={!selectedSlot}
                >
                  Continue <ChevronRight size={16} />
                </Button>
              </CardFooter>
            </div>
          )}

          {step === 4 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <CardHeader className="bg-white border-b border-neutral-100">
                <CardTitle className="flex items-center gap-2 text-neutral-900">
                  <FileText size={20} className="text-neutral-500" />
                  Review & Confirm
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="bg-neutral-50 rounded-xl p-5 border border-neutral-100">
                      <h4 className="flex items-center gap-2 font-semibold text-neutral-900 mb-3">
                        <Car size={16} /> Vehicle & Tyre
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between gap-2">
                          <span className="text-neutral-500 shrink-0">Registration</span>
                          <span className="font-medium uppercase text-neutral-900 text-right">
                            {vehicleRegistration.trim() || "—"}
                          </span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-neutral-500 shrink-0">Vehicle</span>
                          <span className="font-medium text-neutral-900 text-right">
                            {vehicle_make} {vehicle_model}
                          </span>
                        </div>
                        <div className="w-full h-[1px] bg-neutral-200 my-2" />
                        <div className="flex justify-between gap-2">
                          <span className="text-neutral-500 shrink-0">Tyre</span>
                          <span className="font-medium text-right text-neutral-900">
                            {tyre_brand} {tyre_model}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Size</span>
                          <span className="font-medium text-neutral-900">{tyre_size}</span>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                          <Label htmlFor="tyreQuantityConfirm" className="text-neutral-900 shrink-0">
                            Tyre quantity <RequiredStar />
                          </Label>
                          <Input
                            id="tyreQuantityConfirm"
                            name="tyreQuantityConfirm"
                            type="text"
                            inputMode="numeric"
                            autoComplete="off"
                            aria-required="true"
                            value={tyreQtyStr}
                            onChange={(e) => {
                              const digits = e.target.value.replace(/\D/g, "");
                              if (digits === "") {
                                setTyreQtyStr("");
                                return;
                              }
                              const n = Number.parseInt(digits, 10);
                              if (Number.isNaN(n)) return;
                              setTyreQtyStr(String(Math.max(1, Math.min(999, n))));
                            }}
                            onBlur={() => {
                              setTyreQtyStr((s) => {
                                const n = Number.parseInt(s.trim(), 10);
                                if (Number.isNaN(n) || n < 1) return "1";
                                return String(Math.min(999, n));
                              });
                            }}
                            className="h-10 w-24 shrink-0 border-2 border-neutral-300 bg-white text-center text-neutral-900 shadow-sm md:text-sm focus-visible:border-neutral-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-neutral-50 rounded-xl p-5 border border-neutral-100">
                      <h4 className="flex items-center gap-2 font-semibold text-neutral-900 mb-3">
                        <CalendarClock size={16} /> Fitting Time
                      </h4>
                      <div className="space-y-1 text-sm">
                        <p className="font-medium text-lg text-neutral-900">
                          {formatHeaderDate(bookingPreview.date)}
                        </p>
                        {bookingPreview.timeLabel ? (
                          <p className="text-neutral-700 font-medium">{bookingPreview.timeLabel}</p>
                        ) : null}
                        {selectedSlot?.day ? (
                          <p className="text-neutral-500 text-xs capitalize">{selectedSlot.day}</p>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-neutral-50 rounded-xl p-5 border border-neutral-100">
                      <h4 className="flex items-center gap-2 font-semibold text-neutral-900 mb-3">
                        <User size={16} /> Your details
                      </h4>
                      <div className="space-y-2 text-sm flex flex-col">
                        <span className="font-medium text-neutral-900">
                          {customer.first_name} {customer.last_name}
                        </span>
                        <span className="text-neutral-600">{customer.phone}</span>
                        <span className="text-neutral-600">{customer.email}</span>
                        <span className="text-neutral-600 mt-2 pt-2 border-t border-neutral-200">
                          {customer.address}
                          <br />
                          {customer.city}
                          <br />
                          {customer.postcode}
                        </span>
                        {customer.customer_comment.trim() ? (
                          <div className="mt-2 space-y-1 border-t border-neutral-200 pt-2">
                            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                              Comment / Note
                            </p>
                            <p className="whitespace-pre-wrap text-sm text-neutral-600">
                              {customer.customer_comment.trim()}
                            </p>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div
                      className="relative bg-neutral-900 text-white rounded-xl p-6 shadow-sm overflow-hidden"
                      aria-busy={checkoutConfigStatus === "loading"}
                    >
                      <h4 className="font-semibold mb-4 text-neutral-400">Payment Summary</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-neutral-300">Subtotal ({tyreQuantity}x)</span>
                          <span>
                            {currencySymbol}
                            {subtotal.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-neutral-300">Platform Fee</span>
                          <span>
                            {currencySymbol}
                            {platformFee.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-neutral-300">
                            VAT ({checkoutConfig.vat_enabled ? `${checkoutConfig.vat_percentage}%` : "Disabled"})
                          </span>
                          <span>
                            {currencySymbol}
                            {vatAmount.toFixed(2)}
                          </span>
                        </div>
                        <div className="w-full h-[1px] bg-neutral-700 my-3" />
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-lg">Total</span>
                          <span className="font-bold text-2xl">
                            {currencySymbol}
                            {total.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      {checkoutConfigStatus === "loading" ? (
                        <div
                          className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-xl bg-neutral-950/75 text-white"
                          role="status"
                          aria-live="polite"
                        >
                          <Loader2 className="h-8 w-8 animate-spin text-white/90" aria-hidden />
                          <span className="text-sm font-medium text-white/90">Updating totals…</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-6 border-t border-neutral-100 bg-neutral-50/50">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  className="gap-2 text-neutral-900 border-neutral-300 bg-white hover:bg-neutral-100"
                  disabled={isSubmitting}
                >
                  <ChevronLeft size={16} /> Back
                </Button>
                <Button
                  onClick={confirmBooking}
                  className="px-8 bg-green-600 hover:bg-green-700 text-white border-0"
                  disabled={isSubmitting || checkoutConfigStatus === "loading"}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      Processing...
                    </span>
                  ) : (
                    "Confirm Booking"
                  )}
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
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-neutral-50">
          <div className="animate-spin w-8 h-8 border-4 border-neutral-200 border-t-black rounded-full" />
        </div>
      }
    >
      <CheckoutPageContent />
    </Suspense>
  );
}
