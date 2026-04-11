"use client";

import { useCustomerData } from "@/components/account/CustomerDataContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateCustomerPassword, updateCustomerProfile } from "@/lib/customer-api";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function CustomerProfilePage() {
  const { user, loading, reload } = useCustomerData();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicleReg, setVehicleReg] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postcode, setPostcode] = useState("");
  const [profileSubmitting, setProfileSubmitting] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }
    setName(user.name ?? "");
    setEmail(user.email ?? "");
    setPhone(user.phone ?? "");
    setVehicleReg(user.vehicle_registration_number ?? "");
    setAddress(user.address ?? "");
    setCity(user.city ?? "");
    setPostcode(user.postcode ?? "");
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSubmitting(true);
    try {
      await updateCustomerProfile({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        vehicle_registration_number: vehicleReg.trim() || null,
        address: address.trim() || null,
        city: city.trim() || null,
        postcode: postcode.trim() || null,
      });
      toast.success("Profile updated.");
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update profile");
    } finally {
      setProfileSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSubmitting(true);
    try {
      await updateCustomerPassword({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      });
      toast.success("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update password");
    } finally {
      setPasswordSubmitting(false);
    }
  };

  if (loading && !user) {
    return <p className="text-sm text-muted-foreground">Loading profile…</p>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Profile & security</h2>
        <p className="text-muted-foreground text-sm mt-1">Manage your personal information and password.</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal details</CardTitle>
            <CardDescription>Your profile is used for bookings and contact. You can update these fields any time.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => void handleProfileSubmit(e)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="profile-name">Full name</Label>
                  <Input
                    id="profile-name"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="profile-email">Email</Label>
                  <Input
                    id="profile-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="profile-phone">Phone</Label>
                  <Input
                    id="profile-phone"
                    type="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="profile-vrn">Vehicle registration</Label>
                  <Input
                    id="profile-vrn"
                    autoComplete="off"
                    value={vehicleReg}
                    onChange={(e) => setVehicleReg(e.target.value.toUpperCase())}
                    className="uppercase"
                    maxLength={50}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="profile-address">Address</Label>
                <Textarea
                  id="profile-address"
                  autoComplete="street-address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  className="resize-y min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="profile-city">City</Label>
                  <Input
                    id="profile-city"
                    autoComplete="address-level2"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="profile-postcode">Postcode</Label>
                  <Input
                    id="profile-postcode"
                    autoComplete="postal-code"
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value)}
                  />
                </div>
              </div>

              <Button type="submit" disabled={profileSubmitting}>
                {profileSubmitting ? "Saving…" : "Save changes"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Change password</CardTitle>
            <CardDescription>Use a strong password you have not used elsewhere.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => void handlePasswordSubmit(e)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="cur-pw">Current password</Label>
                <Input
                  id="cur-pw"
                  type="password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="new-pw">New password</Label>
                <Input
                  id="new-pw"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="conf-pw">Confirm new password</Label>
                <Input
                  id="conf-pw"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              <Button type="submit" disabled={passwordSubmitting}>
                {passwordSubmitting ? "Saving…" : "Update password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
