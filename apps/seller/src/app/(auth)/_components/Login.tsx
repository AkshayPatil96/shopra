"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginDTO, LoginSchema } from "@repo/shared-types";
import {
  CircleAlertIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MailIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { SellerAuthAPI } from "@repo/shared-axios";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Login = () => {
  const router = useRouter();
  const [passwordVisible, setPasswordVisible] = useState(false);

  const form = useForm<LoginDTO>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginDTO) => {
      const res = await SellerAuthAPI.login(data);
      return res;
    },
    onSuccess: () => {
      toast.success("Login successful!");
      router.push("/");
    },
    onError: (err: any) => {
      console.error("Login error:", err);
      toast.error(err.message || "Login failed");
    },
  });

  const onSubmit = async (data: LoginDTO) => {
    await loginMutation.mutateAsync(data);
  };

  return (
    <div className="container">
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="w-full lg:w-1/2">
          {/* HEADER */}
          <div className="mb-8 text-center">
            <h2 className="text-3xl uppercase">Welcome back</h2>
            <p className="mt-2 text-sm text-stone-600">
              Sign in to continue your shopping journey
            </p>
          </div>

          {/* FORM */}
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              {/* API Error */}
              {loginMutation.isError && (
                <Alert variant="error">
                  <CircleAlertIcon />
                  <AlertTitle>
                    {String(loginMutation.error?.message)}
                  </AlertTitle>
                </Alert>
              )}

              {/* EMAIL */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase">Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="Enter your email"
                          type="email"
                          {...field}
                          className="pl-8"
                        />
                        <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* PASSWORD */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase">Password</FormLabel>
                    <FormControl>
                      <div className="relative flex items-center">
                        <LockIcon className="absolute left-3 size-5 text-gray-400" />
                        <Input
                          placeholder="Enter your password"
                          type={passwordVisible ? "text" : "password"}
                          {...field}
                          className="pl-8 pr-8"
                        />
                        <button
                          type="button"
                          onClick={() => setPasswordVisible(!passwordVisible)}
                          className="absolute right-3 cursor-pointer"
                        >
                          {passwordVisible ? (
                            <EyeOffIcon className="size-5 text-gray-400" />
                          ) : (
                            <EyeIcon className="size-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* REMEMBER ME + FORGOT PASSWORD */}
              <div className="flex items-center justify-between">
                <FormField
                  control={form.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) =>
                            field.onChange(!!checked)
                          }
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">
                        Remember me
                      </FormLabel>
                    </FormItem>
                  )}
                />

                <Link
                  href="/forgot-password"
                  className="text-primary hover:text-primary/80 text-sm"
                >
                  Forgot password?
                </Link>
              </div>

              {/* SUBMIT BUTTON */}
              <Button
                type="submit"
                disabled={loginMutation.isPending}
                className="mt-2 w-full py-3"
              >
                {loginMutation.isPending
                  ? "Signing in..."
                  : "Sign in to your account"}
              </Button>
            </form>
          </Form>

          {/* FOOTER */}
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              href="/sign-up"
              className="text-primary hover:text-primary/80"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
