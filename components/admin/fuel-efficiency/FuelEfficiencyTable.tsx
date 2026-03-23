"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { FuelEfficiency } from "./types";

interface FuelEfficiencyTableProps {
  rows: FuelEfficiency[];
  onEdit: (item: FuelEfficiency) => void;
  onDelete: (item: FuelEfficiency) => void;
  selectedIds: number[];
  onToggleAll: (checked: boolean) => void;
  onToggleOne: (id: number, checked: boolean) => void;
}

export default function FuelEfficiencyTable({
  rows,
  onEdit,
  onDelete,
  selectedIds,
  onToggleAll,
  onToggleOne,
}: FuelEfficiencyTableProps) {
  const allChecked = rows.length > 0 && rows.every((x) => selectedIds.includes(x.id));

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10">
            <Checkbox
              checked={allChecked}
              onCheckedChange={(v) => onToggleAll(Boolean(v))}
              aria-label="Select all fuel efficiency ratings"
            />
          </TableHead>
          <TableHead className="text-white">Rating</TableHead>
          <TableHead className="text-white">Description</TableHead>
          <TableHead className="text-white">Status</TableHead>
          <TableHead className="text-right text-white">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-white/70">
              No ratings yet.
            </TableCell>
          </TableRow>
        ) : (
          rows.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <Checkbox
                  checked={selectedIds.includes(item.id)}
                  onCheckedChange={(v) => onToggleOne(item.id, Boolean(v))}
                  aria-label={`Select ${item.rating}`}
                />
              </TableCell>
              <TableCell className="font-medium text-white">{item.rating}</TableCell>
              <TableCell className="text-white/80">{item.description || "—"}</TableCell>
              <TableCell className="text-white/80">{item.status === "active" ? "Active" : "Inactive"}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button type="button" variant="ghost" onClick={() => onEdit(item)} className="text-white hover:bg-white/10">
                    Edit
                  </Button>
                  <Button type="button" variant="destructive" onClick={() => onDelete(item)} className="bg-red-600 hover:bg-red-700">
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}

