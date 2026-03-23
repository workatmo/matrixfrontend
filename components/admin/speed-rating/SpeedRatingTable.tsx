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
import type { SpeedRating } from "./types";

interface SpeedRatingTableProps {
  rows: SpeedRating[];
  onEdit: (item: SpeedRating) => void;
  onDelete: (item: SpeedRating) => void;
  selectedIds: number[];
  onToggleAll: (checked: boolean) => void;
  onToggleOne: (id: number, checked: boolean) => void;
}

export default function SpeedRatingTable({
  rows,
  onEdit,
  onDelete,
  selectedIds,
  onToggleAll,
  onToggleOne,
}: SpeedRatingTableProps) {
  const allChecked = rows.length > 0 && rows.every((x) => selectedIds.includes(x.id));

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10">
            <Checkbox
              checked={allChecked}
              onCheckedChange={(v) => onToggleAll(Boolean(v))}
              aria-label="Select all speed ratings"
            />
          </TableHead>
          <TableHead className="text-white">Rating</TableHead>
          <TableHead className="text-white">Max Speed (km/h)</TableHead>
          <TableHead className="text-white">Description</TableHead>
          <TableHead className="text-white">Status</TableHead>
          <TableHead className="text-right text-white">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-white/70">
              No speed ratings yet.
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
              <TableCell className="text-white/80">{item.maxSpeed}</TableCell>
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

