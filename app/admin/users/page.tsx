"use client";

import AdminLayout from "@/components/admin/Layout";
import { listAdminUsers, createAdminUser, updateAdminUser, deleteAdminUser, type AdminUserListItem } from "@/lib/api";
import { Search, Plus, Loader2, Edit, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useAdminAuth } from "@/components/admin/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AVAILABLE_PERMISSIONS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "customers", label: "Customers" },
  { id: "vehicles", label: "Vehicles" },
  { id: "orders", label: "Orders" },
  { id: "tyres", label: "Tyres" },
  { id: "settings", label: "Settings" },
  { id: "test_dvla", label: "Test DVLA" },
  { id: "api_settings", label: "API Settings" },
  { id: "update", label: "Update" },
];

function formatRole(name: string | undefined): string {
  if (!name) return "—";
  return name.replace(/_/g, " ");
}

function formatJoined(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

export default function UsersPage() {
  const { user: authUser } = useAdminAuth();
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"customers" | "admins">("customers");

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin",
    permissions: [] as string[],
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { users: rows } = await listAdminUsers(1, 100);
      setUsers(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        permissions: formData.role === "admin" ? formData.permissions : undefined,
      };
      
      if (formData.password) {
        Object.assign(payload, { password: formData.password });
      }

      if (editingUserId) {
        const updatedUser = await updateAdminUser(editingUserId, payload);
        setUsers((prev) => prev.map(u => u.id === editingUserId ? updatedUser : u));
      } else {
        const newUser = await createAdminUser(payload);
        setUsers((prev) => [...prev, newUser]);
      }
      
      setCreateModalOpen(false);
      setFormData({ name: "", email: "", password: "", role: "admin", permissions: [] });
      setEditingUserId(null);
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : "Failed to save user.");
    } finally {
      setCreating(false);
    }
  };

  const handleEdit = (user: AdminUserListItem) => {
    setFormData({
      name: user.name,
      email: user.email,
      password: "", // blank to not update password unless typed
      role: user.role?.name || "admin",
      permissions: user.permissions || [],
    });
    setEditingUserId(user.id);
    setCreateModalOpen(true);
  };

  const handleDelete = async (user: AdminUserListItem) => {
    if (!window.confirm(`Are you sure you want to delete ${user.name}?`)) return;
    setDeletingId(user.id);
    try {
      await deleteAdminUser(user.id);
      setUsers((prev) => prev.filter(u => u.id !== user.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete user.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (user: AdminUserListItem, checked: boolean) => {
    setTogglingId(user.id);
    try {
      const updatedUser = await updateAdminUser(user.id, { is_active: checked });
      setUsers((prev) => prev.map(u => u.id === user.id ? updatedUser : u));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to toggle status.");
    } finally {
      setTogglingId(null);
    }
  };

  const handlePermToggle = (permId: string, checked: boolean) => {
    setFormData((prev) => {
      const next = new Set(prev.permissions);
      if (checked) next.add(permId);
      else next.delete(permId);
      return { ...prev, permissions: Array.from(next) };
    });
  };

  const q = query.trim().toLowerCase();
  
  const filteredUsers = users.filter((u) => {
    if (u.id === authUser?.id) return false;
    if (activeTab === "customers") return u.role?.name === "user" || !u.role;
    return u.role?.name === "admin" || u.role?.name === "super_admin";
  });

  const filtered = q
    ? filteredUsers.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.role?.name ?? "").toLowerCase().includes(q),
      )
    : filteredUsers;

  const isSuperAdmin = authUser?.role?.name === "super_admin";

  return (
    <AdminLayout title="Customers">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Customers</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Admin API users from the database ({users.length} total)
            </p>
          </div>
          {isSuperAdmin && activeTab === "admins" && (
            <Button onClick={() => {
                setEditingUserId(null);
                setFormData({ name: "", email: "", password: "", role: "admin", permissions: [] });
                setCreateModalOpen(true);
            }} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Admin
            </Button>
          )}
        </div>

        {isSuperAdmin && (
          <div className="flex items-center gap-2 border-b border-border mb-4">
            <button
              onClick={() => setActiveTab("customers")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "customers"
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              Customers
            </button>
            <button
              onClick={() => setActiveTab("admins")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "admins"
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              Administrators
            </button>
          </div>
        )}

        <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingUserId ? "Edit Admin" : "Add New Admin"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateSubmit} className="space-y-4 py-4">
              {createError && (
                <div className="p-3 rounded bg-red-500/10 text-red-500 text-sm">
                  {createError}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="admin@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required={!editingUserId}
                  minLength={8}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={editingUserId ? "Leave blank to keep current" : "Min. 8 characters"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(val) => setFormData({ ...formData, role: val ?? "admin" })}
                >
                  <SelectTrigger id="role" className="w-full">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.role === "admin" && (
                <div className="space-y-3 pt-2">
                  <Label>Sidebar Permissions</Label>
                  <div className="space-y-2 border border-border rounded-lg p-3 bg-muted/20">
                    {AVAILABLE_PERMISSIONS.map((perm) => (
                      <div key={perm.id} className="flex flex-row items-center space-x-2">
                        <Checkbox
                          id={`perm-${perm.id}`}
                          checked={formData.permissions.includes(perm.id)}
                          onCheckedChange={(c) => handlePermToggle(perm.id, !!c)}
                        />
                        <label
                          htmlFor={`perm-${perm.id}`}
                          className="text-sm font-medium leading-none cursor-pointer"
                        >
                          {perm.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <DialogFooter className="pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={creating}>
                  {creating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingUserId ? "Save Changes" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Filter by name, email, or role…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-ring transition-colors"
            />
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-500 bg-red-500/5 border border-red-500/20 rounded-xl px-3 py-2">
            {error}
          </div>
        )}

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border hover:bg-transparent">
                {["User", "Role", "Created", "Status", "Actions"].map((h) => (
                  <TableHead
                    key={h}
                    className={`h-12 px-5 text-xs font-medium text-muted-foreground uppercase tracking-wider ${h === 'Actions' ? 'text-right' : 'text-left'}`}
                  >
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-sm text-muted-foreground">
                    Loading customers…
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-sm text-muted-foreground">
                    No customers match.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((user) => (
                  <TableRow key={user.id} className="hover:bg-accent/30 transition-colors">
                    <TableCell className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-xs font-bold text-foreground">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-foreground text-sm font-medium">{user.name}</p>
                          <p className="text-muted-foreground text-xs">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-muted-foreground capitalize">
                      {formatRole(user.role?.name)}
                      {user.role?.name === "admin" && user.permissions?.length > 0 && (
                         <div className="flex gap-1 flex-wrap mt-1">
                           {user.permissions.map(p => (
                             <span key={p} className="text-[10px] px-1.5 py-0.5 bg-muted rounded">
                               {p}
                             </span>
                           ))}
                         </div>
                      )}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-muted-foreground">
                      {formatJoined(user.created_at)}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Switch 
                           checked={user.is_active} 
                           onCheckedChange={(c) => handleToggleActive(user, c)}
                           disabled={togglingId === user.id || (user.role?.name === "super_admin" && !isSuperAdmin)}
                        />
                        <span className={`text-xs font-medium ${user.is_active ? 'text-green-600' : 'text-muted-foreground'}`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                           variant="ghost" 
                           size="icon" 
                           onClick={() => handleEdit(user)}
                           disabled={user.role?.name === "super_admin" && !isSuperAdmin}
                           title="Edit User"
                        >
                          <Edit className="w-4 h-4 text-muted-foreground" />
                        </Button>
                        <Button 
                           variant="ghost" 
                           size="icon" 
                           onClick={() => handleDelete(user)}
                           disabled={deletingId === user.id || (user.role?.name === "super_admin" && !isSuperAdmin) || authUser?.id === user.id}
                           title="Delete User"
                        >
                          {deletingId === user.id ? <Loader2 className="w-4 h-4 animate-spin text-red-500" /> : <Trash2 className="w-4 h-4 text-red-500" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}
