"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ForgotPasswordDTO, ForgotPasswordSchema } from "@repo/shared-types";
import { MailIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { UserAuthAPI } from "@repo/shared-axios";
import { toast } from "sonner";

const ForgotPassword = () => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordDTO>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: async (data: ForgotPasswordDTO) => {
      console.log("Requesting forgot password with data:", data);
      const response = await UserAuthAPI.forgotPassword(data);
      console.log("response: ", response);
      return response;
    },
    onSuccess: (data, formData) => {
      console.log("Forgot password successful:", data);
      toast.success("OTP sent to your email. Please check your inbox.");
      router.push("/login");
    },
    onError: (error: any) => {
      console.error("Login error:", error);
    },
  });

  const onSubmit = async (data: ForgotPasswordDTO) => {
    console.log("Submitting forgot password payload:", data);
    await forgotPasswordMutation.mutateAsync(data);
  };

  return (
    <div className="container">
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="w-full lg:w-1/2">
          <div className="mb-8 text-center">
            <h2 className="text-3xl uppercase">Forgot your password?</h2>
            <p className="mt-2 text-sm text-stone-600">
              Enter your email address below and we&apos;ll send you a OTP.
            </p>
          </div>
          <Form
            className="flex flex-col gap-4"
            onSubmit={handleSubmit(onSubmit)}
          >
            {forgotPasswordMutation.isError && forgotPasswordMutation.error && (
              <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
                {forgotPasswordMutation.error.message}
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
              {errors.email?.message && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </Field>
            <Button
              type="submit"
              disabled={forgotPasswordMutation.isPending}
              className="login-btn relative flex w-full items-center justify-center rounded-lg px-4 py-3 text-sm font-medium text-white transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {forgotPasswordMutation.isPending
                ? "Sending..."
                : "Send Reset OTP"}
            </Button>
          </Form>
          <div className="text-muted-foreground mt-2 text-center text-sm">
            Remember your password?{" "}
            <Link
              href="/login"
              className="text-primary hover:text-primary/80"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
