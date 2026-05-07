"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatters";

export type CreateOrderPayload = {
  user_id?: number | null;
  customer_name: string;
  phone: string;
  vehicle_registration: string;
  tyre_id: number;
  quantity: number;
  slot_id: number;
  booking_date: string;
  address: string;
  delivery_charge: number;
  total_amount: number;
  payment_status: "paid" | "pending";
  payment_method?: "cash" | "online";
};

type SelectOption = {
  id: number;
  label: string;
  meta?: string;
};

type TyreOption = SelectOption & {
  price: number;
};

type FormValues = {
  customer_name: string;
  phone: string;
  customer_id: string;
  vehicle_registration: string;
  vehicle_id: string;
  tyre_id: string;
  quantity: string;
  booking_date: string;
  slot_id: string;
  address: string;
  delivery_charge: string;
  payment_status: "paid" | "pending";
  payment_method: "" | "cash" | "online";
};

type FormErrors = Partial<
  Record<"customer_name" | "phone" | "tyre_id" | "quantity" | "booking_date" | "slot_id", string>
>;

const INITIAL_VALUES: FormValues = {
  customer_name: "",
  phone: "",
  customer_id: "",
  vehicle_registration: "",
  vehicle_id: "",
  tyre_id: "",
  quantity: "1",
  booking_date: "",
  slot_id: "",
  address: "",
  delivery_charge: "0",
  payment_status: "pending",
  payment_method: "",
};

interface OrderFormProps {
  customers: SelectOption[];
  vehicles: SelectOption[];
  tyres: TyreOption[];
  slots: SelectOption[];
  currency?: string | null;
  submitting?: boolean;
  onCancel: () => void;
  onSubmit: (payload: CreateOrderPayload) => void;
}

export default function OrderForm({
  customers,
  vehicles,
  tyres,
  slots,
  currency,
  submitting = false,
  onCancel,
  onSubmit,
}: OrderFormProps) {
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<FormErrors>({});

  const selectedCustomer = useMemo(
    () => customers.find((customer) => String(customer.id) === values.customer_id),
    [customers, values.customer_id],
  );
  const selectedVehicle = useMemo(
    () => vehicles.find((vehicle) => String(vehicle.id) === values.vehicle_id),
    [vehicles, values.vehicle_id],
  );
  const selectedTyre = useMemo(
    () => tyres.find((tyre) => String(tyre.id) === values.tyre_id),
    [tyres, values.tyre_id],
  );

  const quantity = Number.parseInt(values.quantity, 10) || 0;
  const deliveryCharge = Number(values.delivery_charge) || 0;
  const tyrePrice = selectedTyre?.price ?? 0;
  const subtotal = tyrePrice * Math.max(quantity, 0);
  const totalAmount = subtotal + deliveryCharge;
  const selectedWeekday = values.booking_date
    ? new Date(`${values.booking_date}T00:00:00`).toLocaleDateString("en-US", { weekday: "long" }).toLowerCase()
    : null;
  const availableSlots = selectedWeekday
    ? slots.filter((slot) => (slot.meta ?? "").toLowerCase() === selectedWeekday)
    : slots;

  const setValue = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key as keyof FormErrors]) return prev;
      const next = { ...prev };
      delete next[key as keyof FormErrors];
      return next;
    });
  };

  const validate = () => {
    const next: FormErrors = {};

    const hasCustomer = values.customer_name.trim() || values.customer_id;
    if (!hasCustomer) next.customer_name = "Customer is required.";

    if (!values.tyre_id) next.tyre_id = "Tyre is required.";
    if (!Number.isFinite(quantity) || quantity <= 0) next.quantity = "Quantity must be greater than 0.";
    if (!values.booking_date) next.booking_date = "Date is required.";
    if (!values.slot_id) next.slot_id = "Slot is required.";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    const payload: CreateOrderPayload = {
      user_id: values.customer_id ? Number(values.customer_id) : null,
      customer_name: values.customer_name.trim() || selectedCustomer?.label || "",
      phone: values.phone.trim() || selectedCustomer?.meta || "",
      vehicle_registration: values.vehicle_registration.trim() || selectedVehicle?.label || "",
      tyre_id: Number(values.tyre_id),
      quantity,
      slot_id: Number(values.slot_id),
      booking_date: values.booking_date,
      address: values.address.trim(),
      delivery_charge: deliveryCharge,
      total_amount: totalAmount,
      payment_status: values.payment_status,
      payment_method: values.payment_method || undefined,
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card className="border border-border bg-card">
        <CardHeader>
          <CardTitle>Customer Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="customer_name">Customer Name</Label>
            <Input
              id="customer_name"
              value={values.customer_name}
              onChange={(e) => setValue("customer_name", e.target.value)}
              placeholder="Enter customer name"
            />
            {errors.customer_name ? <p className="text-xs text-destructive">{errors.customer_name}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={values.phone}
              onChange={(e) => setValue("phone", e.target.value)}
              placeholder="Enter phone number"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="customer_select">Select Existing Customer (optional)</Label>
            <Select
              value={values.customer_id || null}
              onValueChange={(value) => {
                const customer = customers.find((item) => String(item.id) === value);
                setValue("customer_id", value ?? "");
                if (customer) {
                  setValue("customer_name", customer.label);
                  setValue("phone", customer.meta ?? "");
                }
              }}
            >
              <SelectTrigger id="customer_select" className="w-full">
                {selectedCustomer ? (
                  <span className="truncate">{selectedCustomer.label}</span>
                ) : (
                  <SelectValue placeholder="Select customer" />
                )}
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={String(customer.id)}>
                    {customer.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border bg-card">
        <CardHeader>
          <CardTitle>Vehicle Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="vehicle_registration">Vehicle Registration Number</Label>
            <Input
              id="vehicle_registration"
              value={values.vehicle_registration}
              onChange={(e) => setValue("vehicle_registration", e.target.value)}
              placeholder="AB12 CDE (optional)"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vehicle_select">Select Vehicle (optional)</Label>
            <Select
              value={values.vehicle_id || null}
              onValueChange={(value) => {
                const vehicle = vehicles.find((item) => String(item.id) === value);
                setValue("vehicle_id", value ?? "");
                if (vehicle) setValue("vehicle_registration", vehicle.label);
              }}
            >
              <SelectTrigger id="vehicle_select" className="w-full">
                <SelectValue placeholder="Select vehicle" />
              </SelectTrigger>
              <SelectContent>
                {vehicles.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={String(vehicle.id)}>
                    {vehicle.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border bg-card">
        <CardHeader>
          <CardTitle>Tyre Selection</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="tyre_id">Select Tyre</Label>
            <Select value={values.tyre_id || null} onValueChange={(value) => setValue("tyre_id", value ?? "")}>
              <SelectTrigger id="tyre_id" className="w-full">
                {selectedTyre ? (
                  <span className="truncate">{selectedTyre.label}</span>
                ) : (
                  <SelectValue placeholder="Select tyre" />
                )}
              </SelectTrigger>
              <SelectContent>
                {tyres.map((tyre) => (
                  <SelectItem key={tyre.id} value={String(tyre.id)}>
                    {tyre.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.tyre_id ? <p className="text-xs text-destructive">{errors.tyre_id}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              step="1"
              value={values.quantity}
              onChange={(e) => setValue("quantity", e.target.value)}
            />
            {errors.quantity ? <p className="text-xs text-destructive">{errors.quantity}</p> : null}
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border bg-card">
        <CardHeader>
          <CardTitle>Slot Selection</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="booking_date">Date</Label>
            <Input
              id="booking_date"
              type="date"
              value={values.booking_date}
              onChange={(e) => setValue("booking_date", e.target.value)}
            />
            {errors.booking_date ? <p className="text-xs text-destructive">{errors.booking_date}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="slot_id">Slot</Label>
            <Select value={values.slot_id || null} onValueChange={(value) => setValue("slot_id", value ?? "")}>
              <SelectTrigger id="slot_id" className="w-full">
                <SelectValue placeholder="Select slot" />
              </SelectTrigger>
              <SelectContent>
                {availableSlots.map((slot) => (
                  <SelectItem key={slot.id} value={String(slot.id)}>
                    {slot.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {values.booking_date && availableSlots.length === 0 ? (
              <p className="text-xs text-muted-foreground">No active slots available for selected date weekday.</p>
            ) : null}
            {errors.slot_id ? <p className="text-xs text-destructive">{errors.slot_id}</p> : null}
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border bg-card">
        <CardHeader>
          <CardTitle>Delivery</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={values.address}
              onChange={(e) => setValue("address", e.target.value)}
              placeholder="Enter delivery address"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="delivery_charge">Delivery Charge</Label>
            <Input
              id="delivery_charge"
              type="number"
              min="0"
              step="0.01"
              value={values.delivery_charge}
              onChange={(e) => setValue("delivery_charge", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Distance auto-calculate will be added in a future update.</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border bg-card">
        <CardHeader>
          <CardTitle>Payment</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="payment_status">Payment Status</Label>
            <Select
              value={values.payment_status}
              onValueChange={(value) => setValue("payment_status", (value as "paid" | "pending") ?? "pending")}
            >
              <SelectTrigger id="payment_status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="payment_method">Payment Method (optional)</Label>
            <Select
              value={values.payment_method || null}
              onValueChange={(value) => setValue("payment_method", (value as "" | "cash" | "online") ?? "")}
            >
              <SelectTrigger id="payment_method" className="w-full">
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="online">Online</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border bg-card">
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Price</span>
            <span>{formatCurrency(tyrePrice, currency ?? undefined)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Quantity</span>
            <span>{Math.max(quantity, 0)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Delivery Charge</span>
            <span>{formatCurrency(deliveryCharge, currency ?? undefined)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-2 font-semibold">
            <span>Total Amount</span>
            <span>{formatCurrency(totalAmount, currency ?? undefined)}</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Creating..." : "Create Order"}
        </Button>
      </div>
    </form>
  );
}
