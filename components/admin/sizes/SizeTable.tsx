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

type Size = {
  id: number;
  width: number;
  profile: number;
  rim: number;
  label: string;
};

interface SizeTableProps {
  sizes: Size[];
  onEdit: (size: Size) => void;
  onDelete: (size: Size) => void;
  selectedIds: number[];
  onToggleAll: (checked: boolean) => void;
  onToggleOne: (id: number, checked: boolean) => void;
}

export default function SizeTable({
  sizes,
  onEdit,
  onDelete,
  selectedIds,
  onToggleAll,
  onToggleOne,
}: SizeTableProps) {
  const allChecked = sizes.length > 0 && sizes.every((s) => selectedIds.includes(s.id));

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10">
            <Checkbox
              checked={allChecked}
              onCheckedChange={(v) => onToggleAll(Boolean(v))}
              aria-label="Select all sizes"
            />
          </TableHead>
          <TableHead>Size</TableHead>
          <TableHead>Width</TableHead>
          <TableHead>Profile</TableHead>
          <TableHead>Rim</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sizes.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-muted-foreground">
              No sizes yet.
            </TableCell>
          </TableRow>
        ) : (
          sizes.map((s) => (
            <TableRow key={s.id}>
              <TableCell>
                <Checkbox
                  checked={selectedIds.includes(s.id)}
                  onCheckedChange={(v) => onToggleOne(s.id, Boolean(v))}
                  aria-label={`Select ${s.label}`}
                />
              </TableCell>
              <TableCell className="font-medium">{s.label}</TableCell>
              <TableCell>{s.width}</TableCell>
              <TableCell>{s.profile}</TableCell>
              <TableCell>{s.rim}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button type="button" variant="ghost" onClick={() => onEdit(s)}>
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => onDelete(s)}
                  >
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

