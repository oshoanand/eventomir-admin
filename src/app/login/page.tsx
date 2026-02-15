"use client";

import * as React from "react";
import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion"; // Run: npm install framer-motion
import {
  Loader2,
  Smartphone,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Atom,
  Mail,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

// --- Schema Definition ---
const formSchema = z.object({
  email: z.string().email({
    message: "Пожалуйста, введите корректный адрес электронной почты.",
  }),

  password: z
    .string()
    .min(8, { message: "Пароль должен содержать не менее 8 символов." })
    .regex(/[A-Z]/, {
      message: "Должно содержать как минимум одну заглавную букву.",
    }),
});

export default function LoginPage() {
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setError(null);
    setIsLoading(true);

    // Simulate a slight delay for better UX (optional)
    // await new Promise(resolve => setTimeout(resolve, 500));

    const { email, password } = values;

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (res?.error) {
        setError(
          "Неверные учетные данные. Пожалуйста, проверьте свою электронную почту или пароль.",
        );
        setIsLoading(false);
      } else {
        router.push(callbackUrl);
        // Keep loading true while redirecting to prevent double clicks
      }
    } catch (err: any) {
      setError(
        "Произошла непредвиденная ошибка. Пожалуйста, попробуйте еще раз.",
      );
      setIsLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* 1. Background Decoration (Gradients) */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-400/20 blur-[120px]" />

      {/* 2. Main Container with Animation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-[420px] px-4"
      >
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl p-8">
          {/* Header Section */}
          <div className="flex flex-col items-center space-y-3 mb-8">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
              <Atom className="h-7 w-7 text-white" />
            </div>
            <div className="text-center">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                EVENTOMIR ADMIN
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Войдите в систему, чтобы получить доступ к панели администратора
              </p>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-6"
            >
              <Alert
                variant="destructive"
                className="border-red-500/50 bg-red-500/10 text-red-600 dark:text-red-400"
              >
                <AlertCircle className="h-4 w-4" />
                <AlertTitle className="ml-2 font-semibold">Error</AlertTitle>
                <AlertDescription className="ml-2">{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* Form Section */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Электронная почта
                    </FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <Input
                          {...field}
                          placeholder="example@mail.com"
                          disabled={isLoading}
                          type="email"
                          className="pl-10 h-11 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                        {/* Valid Indicator (Optional visual cue) */}
                        {!form.formState.errors.email && (
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password Field */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Пароль
                      </FormLabel>
                      <a
                        href="#"
                        className="text-xs text-blue-600 hover:text-blue-500 font-medium transition-colors"
                      >
                        Забыли пароль?
                      </a>
                    </div>
                    <FormControl>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          disabled={isLoading}
                          {...field}
                          className="pl-10 pr-10 h-11 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-none"
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Вход в систему...
                  </>
                ) : (
                  "Войти"
                )}
              </Button>
            </form>
          </Form>

          {/* Footer / Copyright */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-slate-900 px-2 text-slate-500">
                  Secure System
                </span>
              </div>
            </div>
            <p className="mt-4 text-center text-xs text-slate-400">
              &copy; {new Date().getFullYear()} eventomir.ru | All rights
              reserved
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
