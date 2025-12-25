"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginDTO, LoginSchema } from "@repo/shared-types";
import { EyeIcon, EyeOffIcon, LockIcon, MailIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { UserAuthAPI } from "@repo/shared-axios";
import { toast } from "sonner";

const Login = () => {
  const router = useRouter();
  const params = useSearchParams();

  const redirect = params.get("redirect") || "/";
  console.log("redirect: ", redirect);

  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<LoginDTO>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginDTO) => {
      console.log("Logging in with data:", data);
      const response = await UserAuthAPI.login(data);
      return response;
    },
    onSuccess: (data, formData) => {
      console.log("Login successful:", data);
      toast.success("Login successful!");
      router.push(redirect);
    },
    onError: (error: any) => {
      console.error("Login error:", error);
    },
  });

  const onSubmit = async (data: LoginDTO) => {
    console.log("Submitting login payload:", data);
    await loginMutation.mutateAsync(data);
  };

  return (
    <div className="container">
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="w-full lg:w-1/2">
          <div className="mb-8 text-center">
            <h2 className="text-3xl uppercase">Welcome back</h2>
            <p className="mt-2 text-sm text-stone-600">
              Sign in to continue your shopping journey
            </p>
          </div>
          <Form
            className="flex flex-col gap-4"
            // errors={errors}
            onSubmit={handleSubmit(onSubmit)}
          >
            {loginMutation.isError && loginMutation.error && (
              <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
                {loginMutation.error.message}
              </div>
            )}
            <Field name="email">
              <FieldLabel className="block text-sm font-medium uppercase">
                Email
              </FieldLabel>
              <InputGroup className={`border-border bg-input py-2`}>
                <InputGroupInput
                  aria-label="Email"
                  placeholder="Enter your email"
                  type="email"
                  {...register("email")}
                />
                <InputGroupAddon>
                  <MailIcon className="size-6 text-gray-400" />
                </InputGroupAddon>
              </InputGroup>
              {/* <FieldError /> */}
              {errors.email?.message && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </Field>
            <Field name="password">
              <FieldLabel className="block text-sm font-medium uppercase">
                Password
              </FieldLabel>
              <InputGroup className={`border-border bg-input py-2`}>
                <InputGroupInput
                  aria-label="Password"
                  placeholder="Enter your password"
                  type={passwordVisible ? "text" : "password"}
                  {...register("password")}
                />
                <InputGroupAddon>
                  <LockIcon className="size-6 text-gray-400" />
                </InputGroupAddon>
                <InputGroupAddon
                  align={"inline-end"}
                  className="cursor-pointer"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                >
                  {passwordVisible ? (
                    <EyeOffIcon className="size-6 text-gray-400" />
                  ) : (
                    <EyeIcon className="size-6 text-gray-400" />
                  )}
                </InputGroupAddon>
              </InputGroup>
              {errors.password?.message && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </Field>
            <div className="flex items-center justify-between">
              <Field name="rememberMe">
                <FieldLabel className="flex items-center gap-2">
                  <Checkbox
                    className="size-4 border-border"
                    checked={!!watch("rememberMe")}
                    onCheckedChange={(checked) =>
                      setValue("rememberMe", !!checked, { shouldDirty: true })
                    }
                  />
                  <span>Remember me</span>
                </FieldLabel>
              </Field>
              <Link
                href="/forgot-password"
                className="text-primary hover:text-primary/80 text-sm"
              >
                Forgot password?
              </Link>
            </div>
            <Button
              type="submit"
              disabled={loginMutation.isPending}
              className="login-btn relative flex w-full items-center justify-center rounded-lg px-4 py-3 text-sm font-medium text-white transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loginMutation.isPending
                ? "Signing in..."
                : "Sign in to your account"}
            </Button>
            <div className="relative text-center text-sm text-stone-500">
              <div className="absolute inset-0 flex items-center">
                <div className="border-border w-full border-t"></div>
              </div>
              <span className="relative px-2 bg-background">
                Or continue with
              </span>
            </div>
            <div className="flex items-center justify-center gap-4">
              <Button
                type="button"
                className="w-[200px] border-border bg-secondary text-foreground hover:bg-secondary/80 flex items-center justify-center rounded-lg border px-4 py-2.5 text-sm shadow-sm"
              >
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  className="h-5 w-5"
                  alt="Google"
                />
                <span className="ml-2">Google</span>
              </Button>
            </div>
          </Form>
          <div className="text-muted-foreground mt-8 text-center text-sm">
            Don&apos;t have an account?{" "}
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
