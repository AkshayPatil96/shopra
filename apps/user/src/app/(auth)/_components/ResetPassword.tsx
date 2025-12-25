"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ResetPasswordDTO, ResetPasswordSchema } from "@repo/shared-types";
import { EyeIcon, EyeOffIcon, LockIcon, MailIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { UserAuthAPI } from "@repo/shared-axios";
import { toast } from "sonner";

const ResetPassword = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] =
    useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ResetPasswordDTO>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      email: email || "",
      newPassword: "",
      confirmPassword: "",
      token: token || "",
    },
  });

  useEffect(() => {
    if (email) setValue("email", email);
    if (token) setValue("token", token);

    if (!email || !token) router.push("/");
  }, [email, token, setValue]);

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: ResetPasswordDTO) => {
      console.log("Resetting password with data:", data);
      const response = await UserAuthAPI.resetPassword(data);
      return response;
    },
    onSuccess: (data, formData) => {
      console.log("Reset password successful:", data);
      toast.success(
        "Password reset successful! Please login with your new password.",
      );
      router.push("/login");
    },
    onError: (error: any) => {
      console.error("Reset password error:", error);
    },
  });

  const onSubmit = async (data: ResetPasswordDTO) => {
    console.log("Submitting reset password payload:", data);
    await resetPasswordMutation.mutateAsync(data);
  };

  return (
    <div className="container">
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="w-full lg:w-1/2">
          <div className="mb-8 text-center">
            <h2 className="text-3xl uppercase">Reset Your Password</h2>
            <p className="mt-2 text-sm text-stone-600"></p>
          </div>
          <Form
            className="flex flex-col gap-4"
            // errors={errors}
            onSubmit={handleSubmit(onSubmit)}
          >
            {resetPasswordMutation.isError && resetPasswordMutation.error && (
              <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
                {resetPasswordMutation.error.message}
              </div>
            )}
            <Field name="newPassword">
              <FieldLabel className="block text-sm font-medium uppercase">
                New Password
              </FieldLabel>
              <InputGroup className={`border-border bg-input py-2`}>
                <InputGroupInput
                  aria-label="New Password"
                  placeholder="Enter your new password"
                  type={passwordVisible ? "text" : "password"}
                  {...register("newPassword")}
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
              {errors.newPassword?.message && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.newPassword.message}
                </p>
              )}
            </Field>
            <Field name="confirmPassword">
              <FieldLabel className="block text-sm font-medium uppercase">
                Confirm Password
              </FieldLabel>
              <InputGroup className={`border-border bg-input py-2`}>
                <InputGroupInput
                  aria-label="Confirm Password"
                  placeholder="Enter your confirm password"
                  type={passwordVisible ? "text" : "password"}
                  {...register("confirmPassword")}
                />
                <InputGroupAddon>
                  <LockIcon className="size-6 text-gray-400" />
                </InputGroupAddon>
                <InputGroupAddon
                  align={"inline-end"}
                  className="cursor-pointer"
                  onClick={() =>
                    setConfirmPasswordVisible(!confirmPasswordVisible)
                  }
                >
                  {confirmPasswordVisible ? (
                    <EyeOffIcon className="size-6 text-gray-400" />
                  ) : (
                    <EyeIcon className="size-6 text-gray-400" />
                  )}
                </InputGroupAddon>
              </InputGroup>
              {errors.confirmPassword?.message && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.confirmPassword.message}
                </p>
              )}
            </Field>
            <Button
              type="submit"
              disabled={resetPasswordMutation.isPending}
              className="login-btn relative flex w-full items-center justify-center rounded-lg px-4 py-3 text-sm font-medium text-white transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {resetPasswordMutation.isPending
                ? "Resetting..."
                : "Reset Password"}
            </Button>
          </Form>
          <div className="text-muted-foreground mt-8 text-center text-sm">
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

export default ResetPassword;
