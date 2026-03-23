"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";
import {
  createAdminTyre,
  generateTyreDescription,
  getApiSettings,
  listAdminTyres,
  listAdminBrands,
  listAdminFuelEfficiencies,
  listAdminSeasons,
  listAdminSizes,
  listAdminSpeedRatings,
  listAdminTyreTypes,
  updateAdminTyre,
} from "@/lib/api";

type Option = { id: number; name: string };
type TyreFormValues = {
  brand_id: string;
  model: string;
  size_id: string;
  season_id: string;
  tyre_type_id: string;
  fuel_efficiency_id: string;
  speed_rating_id: string;
  price: string;
  stock: string;
  description: string;
  status: boolean;
};
type TyreFormErrors = Partial<Record<"brand_id" | "model" | "size_id" | "price" | "stock", string>>;

type AttributeOptions = {
  brands: Option[];
  sizes: Option[];
  seasons: Option[];
  tyreTypes: Option[];
  efficiencies: Option[];
  speedRatings: Option[];
};

const EMPTY_OPTIONS: AttributeOptions = {
  brands: [],
  sizes: [],
  seasons: [],
  tyreTypes: [],
  efficiencies: [],
  speedRatings: [],
};

function firstNonEmptyString(...values: Array<unknown>): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

const INITIAL_VALUES: TyreFormValues = {
  brand_id: "",
  model: "",
  size_id: "",
  season_id: "",
  tyre_type_id: "",
  fuel_efficiency_id: "",
  speed_rating_id: "",
  price: "",
  stock: "0",
  description: "",
  status: true,
};

function SelectField({
  id,
  label,
  value,
  onChange,
  data,
  placeholder,
  error,
  disabled,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string | null) => void;
  data: Option[];
  placeholder: string;
  error?: string;
  disabled?: boolean;
}) {
  const selected = data.find((item) => String(item.id) === value);

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value || null} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger id={id} className="w-full">
          {selected ? (
            <span className="truncate">{selected.name}</span>
          ) : (
            <SelectValue placeholder={placeholder} />
          )}
        </SelectTrigger>
        <SelectContent>
          {data.map((item) => (
            <SelectItem key={item.id} value={String(item.id)}>
              {item.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
    </div>
  );
}

export default function TyreForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editingTyreId = Number(searchParams.get("tyreId") ?? "");
  const isEditMode = Number.isFinite(editingTyreId) && editingTyreId > 0;
  const [values, setValues] = useState<TyreFormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<TyreFormErrors>({});
  const [lastPayload, setLastPayload] = useState<Record<string, unknown> | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [options, setOptions] = useState<AttributeOptions>(EMPTY_OPTIONS);
  const [loadingAttributes, setLoadingAttributes] = useState(true);
  const [attributesError, setAttributesError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadingTyre, setLoadingTyre] = useState(false);
  const [generatingDescription, setGeneratingDescription] = useState(false);
  const [showGenerateDescriptionButton, setShowGenerateDescriptionButton] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoadingAttributes(true);
    setAttributesError(null);

    void (async () => {
      try {
        const [brands, sizes, seasons, tyreTypes, efficiencies, speedRatings] = await Promise.all([
          listAdminBrands(),
          listAdminSizes(),
          listAdminSeasons(),
          listAdminTyreTypes(),
          listAdminFuelEfficiencies(),
          listAdminSpeedRatings(),
        ]);

        if (cancelled) return;

        setOptions({
          brands: brands
            .filter((item) => item.is_active)
            .map((item) => ({
              id: item.id,
              name: firstNonEmptyString(item.name, item.logo_url, `Brand #${item.id}`),
            })),
          sizes: sizes.map((item) => ({
            id: item.id,
            name: firstNonEmptyString(item.label, `${item.width}/${item.profile} R${item.rim}`),
          })),
          seasons: seasons
            .filter((item) => item.status === "active")
            .map((item) => ({
              id: item.id,
              name: firstNonEmptyString(item.name, item.description, `Season #${item.id}`),
            })),
          tyreTypes: tyreTypes
            .filter((item) => item.status === "active")
            .map((item) => ({
              id: item.id,
              name: firstNonEmptyString(item.name, item.description, `Type #${item.id}`),
            })),
          efficiencies: efficiencies
            .filter((item) => item.status === "active")
            .map((item) => ({
              id: item.id,
              name: firstNonEmptyString(
                item.description ? `${item.rating} - ${item.description}` : item.rating,
                item.rating,
                `Rating #${item.id}`,
              ),
            })),
          speedRatings: speedRatings
            .filter((item) => item.status === "active")
            .map((item) => ({
              id: item.id,
              name: firstNonEmptyString(
                item.rating ? `${item.rating} (${item.max_speed})` : "",
                item.rating,
                `Speed #${item.id}`,
              ),
            })),
        });
      } catch (error) {
        if (cancelled) return;
        const message = error instanceof Error ? error.message : "Failed to load attributes.";
        setAttributesError(message);
      } finally {
        if (!cancelled) setLoadingAttributes(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isEditMode) return;
    let cancelled = false;
    setLoadingTyre(true);

    void (async () => {
      try {
        const tyres = await listAdminTyres();
        const tyre = tyres.find((row) => row.id === editingTyreId);
        if (!tyre || cancelled) return;

        setValues({
          brand_id: String(tyre.brand_id),
          model: tyre.model ?? "",
          size_id: String(tyre.size_id),
          season_id: tyre.season_id ? String(tyre.season_id) : "",
          tyre_type_id: tyre.tyre_type_id ? String(tyre.tyre_type_id) : "",
          fuel_efficiency_id: tyre.fuel_efficiency_id ? String(tyre.fuel_efficiency_id) : "",
          speed_rating_id: tyre.speed_rating_id ? String(tyre.speed_rating_id) : "",
          price: String(tyre.price),
          stock: String(tyre.stock),
          description: tyre.description ?? "",
          status: Boolean(tyre.status),
        });
      } catch (error) {
        if (!cancelled) {
          toast.error(error instanceof Error ? error.message : "Failed to load tyre for edit.");
        }
      } finally {
        if (!cancelled) setLoadingTyre(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [editingTyreId, isEditMode]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const settings = await getApiSettings();
        const enabled = settings.some(
          (setting) => setting.key_name === "tyre_description_ai_generate" && setting.is_enabled
        );
        if (!cancelled) setShowGenerateDescriptionButton(enabled);
      } catch {
        if (!cancelled) setShowGenerateDescriptionButton(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const setValue = <K extends keyof TyreFormValues>(key: K, value: TyreFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key as keyof TyreFormErrors]) return prev;
      const next = { ...prev };
      delete next[key as keyof TyreFormErrors];
      return next;
    });
  };

  const validate = () => {
    const next: TyreFormErrors = {};
    if (!values.brand_id) next.brand_id = "Brand required";
    if (!values.model.trim()) next.model = "Model Name required";
    if (!values.size_id) next.size_id = "Size required";
    if (!Number.isFinite(Number(values.price)) || Number(values.price) <= 0) next.price = "Price must be positive";
    if (!Number.isFinite(Number(values.stock)) || Number(values.stock) < 0) next.stock = "Stock must be >= 0";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      brand_id: Number(values.brand_id),
      model: values.model.trim(),
      size_id: Number(values.size_id),
      season_id: values.season_id ? Number(values.season_id) : null,
      tyre_type_id: values.tyre_type_id ? Number(values.tyre_type_id) : null,
      fuel_efficiency_id: values.fuel_efficiency_id ? Number(values.fuel_efficiency_id) : null,
      speed_rating_id: values.speed_rating_id ? Number(values.speed_rating_id) : null,
      price: Number(values.price),
      stock: Number(values.stock),
      description: values.description.trim() || null,
      status: values.status,
      image_name: imageFile?.name ?? null,
      image_type: imageFile?.type ?? null,
      image_size: imageFile?.size ?? null,
    };

    setLastPayload(payload);

    setSaving(true);
    try {
      const savePayload = {
        brand_id: payload.brand_id,
        model: payload.model,
        size_id: payload.size_id,
        season_id: payload.season_id,
        tyre_type_id: payload.tyre_type_id,
        fuel_efficiency_id: payload.fuel_efficiency_id,
        speed_rating_id: payload.speed_rating_id,
        price: payload.price,
        stock: payload.stock,
        description: payload.description,
        status: values.status,
        image: imageFile ?? undefined,
      };

      if (isEditMode) {
        await updateAdminTyre(editingTyreId, savePayload);
      } else {
        await createAdminTyre(savePayload);
      }

      toast.success(isEditMode ? "Tyre updated successfully." : "Tyre created successfully.");
      router.push("/admin/tyres");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save tyre.");
    } finally {
      setSaving(false);
    }
  };

  const cardClass = "border border-border bg-card text-card-foreground";
  const inputClass = "";

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setImageError(null);

    if (!file) {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImageFile(null);
      setImagePreview(null);
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setImageError("Only JPG, PNG, or WEBP images are allowed.");
      event.currentTarget.value = "";
      return;
    }

    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      setImageError("Image size must be 2MB or less.");
      event.currentTarget.value = "";
      return;
    }

    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const handleGenerateDescription = async () => {
    if (!values.brand_id || !values.model.trim()) {
      toast.error("Brand and Model are required to generate description.");
      return;
    }

    const brandName = options.brands.find((x) => String(x.id) === values.brand_id)?.name ?? "";
    const sizeName = options.sizes.find((x) => String(x.id) === values.size_id)?.name ?? "";
    const seasonName = options.seasons.find((x) => String(x.id) === values.season_id)?.name ?? "";
    const tyreTypeName = options.tyreTypes.find((x) => String(x.id) === values.tyre_type_id)?.name ?? "";

    setGeneratingDescription(true);
    try {
      const description = await generateTyreDescription({
        brand: brandName || values.brand_id,
        model: values.model.trim(),
        size: sizeName || undefined,
        season: seasonName || undefined,
        tyre_type: tyreTypeName || undefined,
      });
      setValue("description", description);
      toast.success("Description generated and filled.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate description.");
    } finally {
      setGeneratingDescription(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card className={cardClass}>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <SelectField
            id="brand"
            label="Brand"
            value={values.brand_id}
            onChange={(v) => setValue("brand_id", v ?? "")}
            data={options.brands}
            placeholder="Select brand"
            error={errors.brand_id}
            disabled={loadingAttributes}
          />
          <div className="space-y-2">
            <Label htmlFor="model">Model Name</Label>
            <Input
              id="model"
              value={values.model}
              onChange={(e) => setValue("model", e.target.value)}
              placeholder="e.g. Pilot Sport 4S"
              className={inputClass}
            />
            {errors.model ? <p className="text-xs text-red-400">{errors.model}</p> : null}
          </div>
          <SelectField
            id="size"
            label="Size"
            value={values.size_id}
            onChange={(v) => setValue("size_id", v ?? "")}
            data={options.sizes}
            placeholder="Select size"
            error={errors.size_id}
            disabled={loadingAttributes}
          />
        </CardContent>
      </Card>

      {attributesError ? (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {attributesError}
        </p>
      ) : null}

      <Card className={cardClass}>
        <CardHeader>
          <CardTitle>Specifications</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SelectField id="season" label="Season" value={values.season_id} onChange={(v) => setValue("season_id", v ?? "")} data={options.seasons} placeholder="Select season" disabled={loadingAttributes} />
          <SelectField id="type" label="Tyre Type" value={values.tyre_type_id} onChange={(v) => setValue("tyre_type_id", v ?? "")} data={options.tyreTypes} placeholder="Select tyre type" disabled={loadingAttributes} />
          <SelectField id="fuel" label="Fuel Efficiency" value={values.fuel_efficiency_id} onChange={(v) => setValue("fuel_efficiency_id", v ?? "")} data={options.efficiencies} placeholder="Select efficiency" disabled={loadingAttributes} />
          <SelectField id="speed" label="Speed Rating" value={values.speed_rating_id} onChange={(v) => setValue("speed_rating_id", v ?? "")} data={options.speedRatings} placeholder="Select rating" disabled={loadingAttributes} />
        </CardContent>
      </Card>

      <Card className={cardClass}>
        <CardHeader>
          <CardTitle>Pricing &amp; Stock</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <Input id="price" type="number" min="0.01" step="0.01" value={values.price} onChange={(e) => setValue("price", e.target.value)} className={inputClass} />
            {errors.price ? <p className="text-xs text-red-400">{errors.price}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="stock">Stock Quantity</Label>
            <Input id="stock" type="number" min="0" step="1" value={values.stock} onChange={(e) => setValue("stock", e.target.value)} className={inputClass} />
            {errors.stock ? <p className="text-xs text-red-400">{errors.stock}</p> : null}
          </div>
        </CardContent>
      </Card>

      <Card className={cardClass}>
        <CardHeader>
          <CardTitle>Additional Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="image">Tyre Image</Label>
            <Input
              id="image"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleImageChange}
              className={inputClass}
            />
            <p className="text-xs text-muted-foreground">Accepted formats: JPG, PNG, WEBP (max 2MB)</p>
            {imageError ? <p className="text-xs text-red-400">{imageError}</p> : null}
            {imagePreview ? (
              <div className="mt-2 rounded-lg border border-border p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagePreview} alt="Tyre preview" className="h-28 w-28 rounded-md object-cover" />
              </div>
            ) : null}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="description">Description</Label>
              {showGenerateDescriptionButton ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={generatingDescription || loadingAttributes}
                  onClick={() => void handleGenerateDescription()}
                >
                  {generatingDescription ? (
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-1 h-4 w-4" />
                  )}
                  Generate Description with Workatmo AI
                </Button>
              ) : null}
            </div>
            <Textarea
              id="description"
              value={values.description}
              onChange={(e) => setValue("description", e.target.value)}
              placeholder="Optional details about this tyre"
              className={inputClass}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <Label htmlFor="status">Status</Label>
              <p className="text-xs text-muted-foreground">{values.status ? "Active" : "Inactive"}</p>
            </div>
            <Switch id="status" checked={values.status} onCheckedChange={(checked) => setValue("status", checked)} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={loadingAttributes || loadingTyre || saving}>
          {loadingAttributes || loadingTyre
            ? "Loading..."
            : saving
              ? "Saving..."
              : isEditMode
                ? "Update Tyre"
                : "Save Tyre"}
        </Button>
      </div>

      {lastPayload ? (
        <Card className={cardClass}>
          <CardHeader>
            <CardTitle className="text-sm">Submitted Payload Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="overflow-x-auto rounded-md border border-border bg-muted p-3 text-xs text-foreground/80">
              {JSON.stringify(lastPayload, null, 2)}
            </pre>
          </CardContent>
        </Card>
      ) : null}
    </form>
  );
}
