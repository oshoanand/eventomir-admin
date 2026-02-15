import PerformersTable from "@/components/performers-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PerformersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-2xl font-bold tracking-tight">
          Управление исполнителями
        </h1>
      </div>
      <Card>
        {/* <CardHeader>
          <CardTitle>Performers</CardTitle>
        </CardHeader> */}
        <CardContent>
          <PerformersTable />
        </CardContent>
      </Card>
    </div>
  );
}
