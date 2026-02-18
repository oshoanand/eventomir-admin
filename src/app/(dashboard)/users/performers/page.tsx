import PerformersTable from "@/components/performers-table";

export default function PerformersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-2xl font-bold tracking-tight">
          Управление исполнителями
        </h1>
      </div>

      <PerformersTable />
    </div>
  );
}
