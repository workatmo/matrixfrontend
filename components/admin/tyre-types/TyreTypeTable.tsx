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
import type { TyreType } from "./types";

interface TyreTypeTableProps {
  tyreTypes: TyreType[];
  onEdit: (item: TyreType) => void;
  onDelete: (item: TyreType) => void;
  selectedIds: number[];
  onToggleAll: (checked: boolean) => void;
  onToggleOne: (id: number, checked: boolean) => void;
}

export default function TyreTypeTable({
  tyreTypes,
  onEdit,
  onDelete,
  selectedIds,
  onToggleAll,
  onToggleOne,
}: TyreTypeTableProps) {
  const allChecked = tyreTypes.length > 0 && tyreTypes.every((x) => selectedIds.includes(x.id));

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10">
            <Checkbox
              checked={allChecked}
              onCheckedChange={(v) => onToggleAll(Boolean(v))}
              aria-label="Select all tyre types"
            />
          </TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tyreTypes.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-muted-foreground">
              No tyre types yet.
            </TableCell>
          </TableRow>
        ) : (
          tyreTypes.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <Checkbox
                  checked={selectedIds.includes(item.id)}
                  onCheckedChange={(v) => onToggleOne(item.id, Boolean(v))}
                  aria-label={`Select ${item.name}`}
                />
              </TableCell>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>{item.description || "—"}</TableCell>
              <TableCell>{item.status === "active" ? "Active" : "Inactive"}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button type="button" variant="ghost" onClick={() => onEdit(item)}>
                    Edit
                  </Button>
                  <Button type="button" variant="destructive" onClick={() => onDelete(item)}>
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

