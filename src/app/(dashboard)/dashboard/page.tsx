import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Assuming you have this, otherwise standard input
import { Construction, ArrowLeft, Rocket } from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  // 2. Security Check
  if (!session) {
    redirect("/login?callbackUrl=/dashboard");
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center p-4">
      <Card className="w-full max-w-md border-none shadow-xl bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <CardHeader className="text-center space-y-4 pb-2">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-2">
            <Rocket className="h-8 w-8 text-primary animate-pulse" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold tracking-tight">
              Coming Soon
            </CardTitle>
            <CardDescription className="text-base">
              We are currently building a new and improved analytics dashboard.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="text-center pb-2">
          <p className="text-sm text-muted-foreground mb-6">
            Our team is working hard to bring you detailed insights, real-time
            metrics, and comprehensive reports. Check back soon!
          </p>

          {/* Optional: A mock email signup for notifications to make it look pro */}
          <div className="flex w-full max-w-sm items-center space-x-2 mx-auto">
            <Input type="email" placeholder="Email for updates" disabled />
            <Button type="submit" disabled>
              Notify Me
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-widest">
            Estimated Launch: Q4 2026
          </p>
        </CardContent>

        {/* <CardFooter className="flex justify-center pt-6">
          <Link href="/" passHref>
            <Button
              variant="ghost"
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Return to Home
            </Button>
          </Link>
        </CardFooter> */}
      </Card>
    </div>
  );
}
