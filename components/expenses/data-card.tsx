"use client";

import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileDrop, type RejectedFile } from "@/components/file-drop";
import { useDatabaseTransfer } from "@/lib/storage/react";
import type { DatabaseHandle, TableMap } from "@/lib/storage/database";
import type { Expense } from "@/lib/db";

/**
 * The way this app's data leaves and returns to the device: a JSON export the visitor keeps, and an
 * export file brought back in. There is no sync and no server copy — this is the only honest route,
 * and it is here because the browser can clear this data at any time.
 */
export function DataCard({ database }: { database: DatabaseHandle<{ expenses: Expense } & TableMap> }) {
  const transfer = useDatabaseTransfer(database);

  const onExport = () => {
    void transfer.exportToFile().then(() => {
      toast.success("Exported every expense to a file.");
    }, (error: unknown) => {
      toast.error(`Could not export: ${error instanceof Error ? error.message : "unknown error"}`);
    });
  };

  const onFiles = async (files: File[], rejected: RejectedFile[]) => {
    const file = files[0];
    if (!file) {
      if (rejected.length) toast.error(`Could not load ${rejected[0].file.name}: ${rejected[0].reason}.`);
      return;
    }
    try {
      const result = await transfer.importFromFile(file, "merge");
      const loaded = result.tables.expenses ?? 0;
      toast.success(`Loaded ${loaded} expense${loaded === 1 ? "" : "s"} from the file.`);
    } catch (error) {
      toast.error(`Could not load that file: ${error instanceof Error ? error.message : "not an export of this app"}`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Your data</CardTitle>
        <CardDescription>
          Everything lives in this browser on this device — nothing is sent anywhere. Keep an export
          file if you want a copy, or to carry it to another browser.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div>
          <Button type="button" variant="outline" onClick={onExport} disabled={transfer.state.kind === "working"}>
            Export data
          </Button>
        </div>
        <FileDrop
          accept="application/json,.json"
          multiple={false}
          label="Choose export file"
          onFiles={(files, rejected) => void onFiles(files, rejected)}
        >
          or drop an export file here — expenses in it are added to what is here
        </FileDrop>
        {transfer.state.kind === "error" && (
          <Alert variant="destructive">
            <AlertTitle>That did not work</AlertTitle>
            <AlertDescription>{transfer.state.message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}