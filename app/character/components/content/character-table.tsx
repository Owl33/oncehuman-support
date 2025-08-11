"use client";

import React from "react";
import { DataTable } from "@/components/ui";
import { DataTableRef } from "@/components/ui/data-table";
import { BaseCharacter } from "@/types/character";
import { columns } from "../../table/columns";

interface CharacterTableProps {
  tableRef: React.RefObject<DataTableRef<BaseCharacter> | null>;
  data: BaseCharacter[];
  onSave: (saveData: {
    updatedRows: BaseCharacter[];
    newRow: BaseCharacter | null;
  }) => Promise<void>;
  onDelete: (deleteData: BaseCharacter[]) => Promise<void>;
}

export function CharacterTable({
  tableRef,
  data,
  onSave,
  onDelete
}: CharacterTableProps) {
  return (
    <DataTable
      ref={tableRef}
      columns={columns}
      data={data}
      onSave={onSave}
      onDelete={onDelete}
    />
  );
}