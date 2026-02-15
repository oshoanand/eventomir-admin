"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Send,
  Smartphone,
  Loader2,
  BellRing,
  History,
  Lock,
  Unlock,
} from "lucide-react";
import { toast } from "sonner"; // Assuming you use Sonner or similar toast
// import { NotificationHistory } from "@/components/notification-history";
import Link from "next/link";

// 1. CONFIGURATION MAPPING
const TOPIC_CONFIG = {
  collector:
    process.env.NEXT_PUBLIC_COLLECTOR_FCM_TOPIC ||
    "garbagecollector_collector_topic",
  visitor:
    process.env.NEXT_PUBLIC_VISITOR_FCM_TOPIC ||
    "garbagecollector_visitor_topic",
  token_group:
    process.env.NEXT_PUBLIC_TOKEN_FCM_TOPIC || "token_generator_topic",
  user: "", // User requires manual input
};

type SelectionType = "collector" | "visitor" | "token_group" | "user";

export default function NotificationsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [targetType, setTargetType] = useState<SelectionType>("collector");

  // Form State
  const [formData, setFormData] = useState({
    target: "",
    title: "",
    body: "",
  });

  const handleTypeChange = (value: SelectionType) => {
    setTargetType(value);

    if (value === "user") {
      // If User, clear target for manual entry
      setFormData((prev) => ({ ...prev, target: "" }));
    } else {
      // If Group, auto-populate from Environment Variables
      setFormData((prev) => ({ ...prev, target: TOPIC_CONFIG[value] }));
    }
  };

  const handleSend = async () => {
    if (!formData.title || !formData.body || !formData.target) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      // 4. Determine generic API type based on specific UI selection
      // const apiType = targetType === "user" ? "token" : "topic";

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/notifications/send`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "topic", // 'topic' or 'token'
            target: formData.target, // topic name or user fcm token
            title: formData.title,
            body: formData.body,
          }),
        },
      );

      if (response.ok) {
        toast.success("Notification sent successfully!");
        // Reset form but keep the current target logic intact
        setFormData((prev) => ({ ...prev, title: "", body: "" }));
        if (targetType === "user") {
          setFormData((prev) => ({ ...prev, target: "" }));
        }
      } else {
        toast.error("Failed to send notification");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Push Notifications{" "}
          </h2>
          <p className="text-muted-foreground">
            Send FCM messages to specific users or broadcast via topics.
          </p>
        </div>
        <Button variant="outline" className="border border-[#f97415]" asChild>
          <Link href="/notifications/history">
            <History className="mr-2 h-4 w-4" />
            View History
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
        {/* --- Left Column: Input Form --- */}
        <Card className="col-span-4 border-none shadow-md">
          <CardHeader>
            <CardTitle>Compose Message</CardTitle>
            <CardDescription>
              Configure the details of your push notification.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Target Audience</Label>
                <Select
                  value={targetType}
                  onValueChange={(val: SelectionType) => handleTypeChange(val)}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="collector">Collector Group</SelectItem>
                    <SelectItem value="visitor">Visitor Group</SelectItem>
                    <SelectItem value="token_group">Token Group</SelectItem>
                    <SelectItem value="user">Specific User (Token)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="target">
                    {targetType === "user"
                      ? "User FCM Token"
                      : "Topic Name (Auto-Filled)"}
                  </Label>
                  {/* Visual indicator for Read Only vs Editable */}
                  {targetType !== "user" ? (
                    <Lock className="w-3 h-3 text-gray-400" />
                  ) : (
                    <Unlock className="w-3 h-3 text-gray-400" />
                  )}
                </div>
                <Input
                  id="target"
                  placeholder={
                    targetType === "user"
                      ? "Paste FCM Token here..."
                      : "Topic name from .env"
                  }
                  value={formData.target}
                  // Disable editing if it's a group topic to prevent errors
                  readOnly={targetType !== "user"}
                  disabled={targetType !== "user"}
                  className={
                    targetType !== "user"
                      ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                      : ""
                  }
                  onChange={(e) =>
                    setFormData({ ...formData, target: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Notification Title</Label>
              <Input
                id="title"
                placeholder="e.g., Special Offer Inside!"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="body">Message Body</Label>
              <Textarea
                id="body"
                placeholder="Type your message here..."
                className="min-h-[100px]"
                value={formData.body}
                onChange={(e) =>
                  setFormData({ ...formData, body: e.target.value })
                }
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button
              onClick={handleSend}
              disabled={isLoading}
              className="w-full md:w-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Notification
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* --- Right Column: Live Preview --- */}
        <div className="col-span-4 lg:col-span-3">
          <Card className="h-full bg-slate-50/50 dark:bg-slate-900/50 border-dashed">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center pt-8">
              {/* Mobile Phone Simulation */}
              <div className="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[500px] w-[300px] shadow-xl">
                <div className="w-[148px] h-[18px] bg-gray-800 top-0 rounded-b-[1rem] left-1/2 -translate-x-1/2 absolute"></div>
                <div className="h-[32px] w-[3px] bg-gray-800 absolute -start-[17px] top-[72px] rounded-s-lg"></div>
                <div className="h-[46px] w-[3px] bg-gray-800 absolute -start-[17px] top-[124px] rounded-s-lg"></div>
                <div className="h-[46px] w-[3px] bg-gray-800 absolute -start-[17px] top-[178px] rounded-s-lg"></div>
                <div className="h-[64px] w-[3px] bg-gray-800 absolute -end-[17px] top-[142px] rounded-e-lg"></div>

                {/* Screen Content */}
                <div className="rounded-[2rem] overflow-hidden w-[272px] h-[472px] bg-white dark:bg-gray-950 relative">
                  {/* Status Bar */}
                  <div className="h-6 bg-slate-100 dark:bg-slate-900 w-full flex justify-between items-center px-4 text-[10px] text-gray-500">
                    <span>9:41</span>
                    <div className="flex gap-1">
                      <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                      <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                    </div>
                  </div>

                  {/* Wallpaper / Home Screen */}
                  <div className="p-4 pt-10 space-y-4">
                    {/* The Notification Card */}
                    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm p-3 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-4 duration-500">
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/10 p-2 rounded-xl">
                          <BellRing className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between items-start">
                            <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                              Zepo App
                            </span>
                            <span className="text-[10px] text-gray-400">
                              Now
                            </span>
                          </div>
                          <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                            {formData.title || "Notification Title"}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 leading-snug">
                            {formData.body ||
                              "The notification body text will appear here on the user's device."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
