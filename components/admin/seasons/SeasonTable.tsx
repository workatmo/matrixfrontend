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
import type { Season } from "./types";

interface SeasonTableProps {
  seasons: Season[];
  onEdit: (season: Season) => void;
  onDelete: (season: Season) => void;
  selectedIds: number[];
  onToggleAll: (checked: boolean) => void;
  onToggleOne: (id: number, checked: boolean) => void;
}

export default function SeasonTable({
  seasons,
  onEdit,
  onDelete,
  selectedIds,
  onToggleAll,
  onToggleOne,
}: SeasonTableProps) {
  const allChecked = seasons.length > 0 && seasons.every((s) => selectedIds.includes(s.id));

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10">
            <Checkbox
              checked={allChecked}
              onCheckedChange={(v) => onToggleAll(Boolean(v))}
              aria-label="Select all seasons"
            />
          </TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {seasons.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-muted-foreground">
              No seasons yet.
            </TableCell>
          </TableRow>
        ) : (
          seasons.map((season) => (
            <TableRow key={season.id}>
              <TableCell>
                <Checkbox
                  checked={selectedIds.includes(season.id)}
                  onCheckedChange={(v) => onToggleOne(season.id, Boolean(v))}
                  aria-label={`Select ${season.name}`}
                />
              </TableCell>
              <TableCell className="font-medium">{season.name}</TableCell>
              <TableCell>{season.description || "—"}</TableCell>
              <TableCell>{season.status === "active" ? "Active" : "Inactive"}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button type="button" variant="ghost" onClick={() => onEdit(season)}>
                    Edit
                  </Button>
                  <Button type="button" variant="destructive" onClick={() => onDelete(season)}>
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

