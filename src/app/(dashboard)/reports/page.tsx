import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import ReportsChart from '@/components/reports-chart';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl font-bold tracking-tight">
        Reporting & Analytics
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>User Activity</CardTitle>
          <CardDescription>A breakdown of user activity over the last 6 months.</CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <ReportsChart />
        </CardContent>
      </Card>
    </div>
  );
}
