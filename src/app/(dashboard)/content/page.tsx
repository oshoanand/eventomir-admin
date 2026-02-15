import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function ContentPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl font-bold tracking-tight">Content Management</h1>
      <Card>
        <CardHeader>
          <CardTitle>Under Construction</CardTitle>
          <CardDescription>This section is being developed.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-4 py-16 text-center">
            <FileText className="h-16 w-16 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Coming Soon</h2>
          <p className="max-w-md text-muted-foreground">
            The content management system is currently in development. You'll soon be able to create, edit, and organize your website's content right from this dashboard.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
