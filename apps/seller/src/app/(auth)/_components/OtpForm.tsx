"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

import { zodResolver } from "@hookform/resolvers/zod";
import { SellerAuthAPI } from "@repo/shared-axios";
import {
  RegisterDTO,
  VerifyUserDTO,
  VerifyUserSchema,
} from "@repo/shared-types";

import { useMutation } from "@tanstack/react-query";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { TriangleAlertIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type Props = {
  canResend: boolean;
  resendTimer: number;
  setCanResend: React.Dispatch<React.SetStateAction<boolean>>;
  setResendTimer: React.Dispatch<React.SetStateAction<number>>;
  userData: RegisterDTO | null;
};

const OtpForm = ({
  canResend,
  resendTimer,
  setCanResend,
  setResendTimer,
  userData,
}: Props) => {
  const router = useRouter();

  const form = useForm<VerifyUserDTO>({
    resolver: zodResolver(VerifyUserSchema),
    defaultValues: {
      email: userData?.email || "",
      name: userData?.name || "",
      password: userData?.password || "",
      otp: "",
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async (data: VerifyUserDTO) => {
      const response = await SellerAuthAPI.verifyOtp(data);
      return response;
    },
    onSuccess: () => {
      toast.success("OTP verified successfully!");
      router.push("/login");
    },
    onError: (error: any) => {
      console.error("OTP verification failed:", error);
      toast.error(error?.message || "Invalid OTP");
    },
  });

  const onSubmit = async (data: VerifyUserDTO) => {
    if (!userData) return;
    await verifyOtpMutation.mutateAsync({ ...data, ...userData });
  };

  const resendOTP = () => {
    console.log("Resending OTP to:", form.watch("email"));
    setCanResend(false);
    setResendTimer(60);
  };

  return (
    <div className="w-full lg:w-1/2">
      <div className="mb-6 text-center">
        <h2 className="text-3xl uppercase">Enter OTP</h2>
        <p className="mt-2 text-sm text-stone-600">
          Please enter the OTP sent to your email to complete registration.
        </p>
        {form.watch("email") && (
          <p className="mt-2 text-sm text-stone-600">
            Email: <strong>{form.watch("email")}</strong>
          </p>
        )}
      </div>

      <Form {...form}>
        <form
          className="flex flex-col items-center gap-4"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          {verifyOtpMutation.isError && (
            <div className="w-fit flex items-center justify-center gap-2 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-500">
              <TriangleAlertIcon className="size-5 text-red-500" />
              {String(verifyOtpMutation.error?.message)}
            </div>
          )}

          {/* OTP FIELD */}
          <FormField
            control={form.control}
            name="otp"
            render={({ field }) => (
              <FormItem className="flex flex-col items-center justify-center">
                <FormControl>
                  <InputOTP
                    maxLength={6}
                    pattern={REGEXP_ONLY_DIGITS}
                    value={field.value}
                    onChange={field.onChange}
                    autoFocus
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* SUBMIT BUTTON */}
          <Button
            type="submit"
            disabled={verifyOtpMutation.isPending}
            className="w-full py-3 rounded-lg text-sm font-medium disabled:opacity-60"
          >
            {verifyOtpMutation.isPending ? "Verifying..." : "Verify OTP"}
          </Button>

          {/* RESEND OTP */}
          <p className="text-center text-sm text-stone-500">
            Didn’t receive the OTP?{" "}
            <Button
              variant="link"
              disabled={!canResend || verifyOtpMutation.isPending}
              onClick={resendOTP}
              type="button"
              className="text-primary"
            >
              Resend OTP {resendTimer > 0 && `(${resendTimer}s)`}
            </Button>
          </p>
        </form>
      </Form>

      <div className="text-center text-sm text-muted-foreground mt-4">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-primary hover:text-primary/80"
        >
          Login
        </Link>
      </div>
    </div>
  );
};

export default OtpForm;
