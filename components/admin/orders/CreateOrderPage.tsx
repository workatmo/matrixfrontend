"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import AdminLayout from "@/components/admin/Layout";
import OrderForm, { type CreateOrderPayload } from "@/components/admin/orders/OrderForm";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSettings } from "@/components/admin/SettingsProvider";
import {
  createAdminOrder,
  listAdminSlots,
  listAdminTyres,
  listAdminUsers,
  listAdminVehicles,
  type AdminSlotItem,
  type AdminTyre,
  type AdminUserListItem,
  type AdminVehicleItem,
} from "@/lib/api";

type Option = { id: number; label: string; meta?: string };
type TyreOption = Option & { price: number };

export default function CreateOrderPage() {
  const router = useRouter();
  const { settings } = useSettings();
  const [customers, setCustomers] = useState<AdminUserListItem[]>([]);
  const [vehicles, setVehicles] = useState<AdminVehicleItem[]>([]);
  const [tyres, setTyres] = useState<AdminTyre[]>([]);
  const [slots, setSlots] = useState<AdminSlotItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setLoadError(null);

    void (async () => {
      try {
        const [usersRes, vehiclesRes, tyresRes, slotsRes] = await Promise.all([
          listAdminUsers(1, 200),
          listAdminVehicles({ page: 1, per_page: 200 }),
          listAdminTyres(),
          listAdminSlots(),
        ]);
        if (cancelled) return;

        setCustomers(usersRes.users);
        setVehicles(vehiclesRes.vehicles);
        setTyres(tyresRes.filter((tyre) => tyre.status && tyre.stock > 0));
        setSlots(slotsRes.filter((slot) => slot.status === "active"));
      } catch (error) {
        if (cancelled) return;
        setLoadError(error instanceof Error ? error.message : "Failed to load order form options.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const customerOptions = useMemo<Option[]>(
    () =>
      customers.map((customer) => ({
        id: customer.id,
        label: customer.name,
        meta: customer.phone ?? "",
      })),
    [customers],
  );

  const vehicleOptions = useMemo<Option[]>(
    () =>
      vehicles.map((vehicle) => ({
        id: vehicle.id,
        label: vehicle.registration,
        meta: vehicle.user?.name ?? "",
      })),
    [vehicles],
  );

  const tyreOptions = useMemo<TyreOption[]>(
    () =>
      tyres.map((tyre) => ({
        id: tyre.id,
        label: `${tyre.brand_name ?? "Tyre"} ${tyre.model} (${tyre.size_label ?? "N/A"})`,
        price: Number(tyre.price) || 0,
      })),
    [tyres],
  );

  const slotOptions = useMemo<Option[]>(
    () =>
      slots.map((slot) => ({
        id: slot.id,
        label: `${slot.day} ${slot.start_time} - ${slot.end_time}`,
        meta: slot.day.toLowerCase(),
      })),
    [slots],
  );

  const handleCreateOrder = async (payload: CreateOrderPayload) => {
    setSubmitting(true);
    try {
      const selectedTyre = tyres.find((tyre) => tyre.id === payload.tyre_id);
      const addressLine = payload.address ? `Delivery Address: ${payload.address}` : "";
      const phoneLine = payload.phone ? `Phone: ${payload.phone}` : "";
      const customerLine = payload.customer_name ? `Customer: ${payload.customer_name}` : "";
      const deliveryLine = `Delivery Charge: ${payload.delivery_charge.toFixed(2)}`;
      const notes = [customerLine, phoneLine, addressLine, deliveryLine].filter(Boolean).join("\n");

      await createAdminOrder({
        user_id: payload.user_id ?? null,
        slot_id: payload.slot_id,
        fitting_date: payload.booking_date,
        vehicle_registration: payload.vehicle_registration || null,
        service_type: "Manual Admin Order",
        tyre_brand: selectedTyre?.brand_name ?? null,
        tyre_model: selectedTyre?.model ?? null,
        tyre_size: selectedTyre?.size_label ?? null,
        tyre_quantity: payload.quantity,
        amount: payload.total_amount,
        payment_provider: payload.payment_method ?? null,
        payment_status: payload.payment_status,
        paid_at: payload.payment_status === "paid" ? new Date().toISOString() : null,
        status: "processing",
        notes: notes || null,
      });

      toast.success("Order created successfully.");
      router.push("/admin/orders");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create order.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout title="Create Order">
      <div className="w-full space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Create Order</h2>
            <p className="mt-1 text-sm text-muted-foreground">Create a manual order for a customer from admin.</p>
          </div>
          <Link
            href="/admin/orders"
            className={cn(buttonVariants({ variant: "outline" }), "border-border")}
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Orders
          </Link>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading form options...</p>
        ) : loadError ? (
          <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {loadError}
          </p>
        ) : (
          <OrderForm
            customers={customerOptions}
            vehicles={vehicleOptions}
            tyres={tyreOptions}
            slots={slotOptions}
            currency={settings?.currency}
            submitting={submitting}
            onCancel={() => router.push("/admin/orders")}
            onSubmit={handleCreateOrder}
          />
        )}
      </div>
    </AdminLayout>
  );
}
