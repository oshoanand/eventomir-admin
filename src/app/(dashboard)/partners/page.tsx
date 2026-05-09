import PartnersTable from "@/components/partners-table";

export default function PartnersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-2xl font-bold tracking-tight">
          Управление Партнеры
        </h1>
      </div>

      <PartnersTable />
    </div>
  );
}
