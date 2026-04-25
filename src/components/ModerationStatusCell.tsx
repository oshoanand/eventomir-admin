import { TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, XCircle, Ban, HelpCircle } from "lucide-react";

export function ModerationStatusCell({ status }: { status: string }) {
  // Helper function to map the status to its specific visual configuration
  const getStatusConfig = (currentStatus: string) => {
    switch (currentStatus?.toUpperCase()) {
      case "APPROVED":
        return {
          label: "Одобрен",
          // Soft green background, dark green text, subtle border
          className:
            "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
          Icon: CheckCircle2,
        };
      case "PENDING":
        return {
          label: "На проверке",
          // Soft amber/yellow background for warning/waiting states
          className:
            "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
          Icon: Clock,
        };
      case "REJECTED":
        return {
          label: "Отклонен",
          // Soft red for negative/error states
          className:
            "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100",
          Icon: XCircle,
        };
      case "BLOCKED":
        return {
          label: "Заблокирован",
          // Muted slate/gray for inactive or blocked states
          className:
            "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200",
          Icon: Ban,
        };
      default:
        return {
          label: "Неизвестно",
          className:
            "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100",
          Icon: HelpCircle,
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.Icon;

  return (
    <TableCell>
      <Badge
        variant="outline"
        className={`flex w-fit items-center gap-1.5 px-2.5 py-1 text-xs font-medium transition-colors shadow-sm ${config.className}`}
      >
        <Icon className="h-3.5 w-3.5" />
        {config.label}
      </Badge>
    </TableCell>
  );
}
