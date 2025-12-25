import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserAuthAPI } from "@repo/shared-axios";
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
import React, { useState } from "react";
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

  const {
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<VerifyUserDTO>({
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
      console.log("Verifying OTP with data:", data);
      const response = await UserAuthAPI.verifyOtp(data);
      return response;
    },
    onSuccess: (data, formData) => {
      console.log("✅✅✅✅ OTP verified successfully:", data);
      toast.success("OTP verified successfully!");
      router.push("/login");
    },
    onError: (error: any) => {
      console.error("❌❌❌❌ OTP verification failed:", error);
    },
  });

  const onSubmit = async (data: VerifyUserDTO) => {
    if (!userData) return;
    console.log("Submitting OTP payload:", data);
    await verifyOtpMutation.mutateAsync({ ...data, ...userData });
  };

  const resendOTP = () => {
    console.log("Resending OTP to email:", watch("email"));
    setCanResend(false);
    setResendTimer(60);
  };

  return (
    <div className="w-full lg:w-1/2">
      <div className="mb-6 text-center">
        <h2 className="text-3xl uppercase">Enter OTP</h2>
        <p className="mt-2 text-sm text-stone-600">
          Please enter the OTP sent to your email to complete the registration
          process.
        </p>
        {watch("email") && (
          <p className="mt-2 text-sm text-stone-600">
            Email: <strong>{watch("email")}</strong>
          </p>
        )}
      </div>

      <Form
        className="flex flex-col items-center gap-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        {verifyOtpMutation?.isError && verifyOtpMutation.error && (
          <div className="w-fit flex items-center justify-center gap-2 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-500">
            <TriangleAlertIcon className="size-5 text-red-500" />
            {verifyOtpMutation.error.message}
          </div>
        )}
        <Field
          name="otp"
          className={"flex items-center justify-center"}
        >
          <InputOTP
            maxLength={6}
            pattern={REGEXP_ONLY_DIGITS}
            // {...register("otp")}
            onChange={(value) => setValue("otp", value)}
            value={watch("otp") || ""}
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
          {/* <FieldError /> */}
          {errors.otp?.message && (
            <p className="mt-1 text-sm text-red-500">{errors.otp.message}</p>
          )}
        </Field>
        <Button
          type="submit"
          disabled={verifyOtpMutation.isPending}
          className="login-btn relative flex w-full items-center justify-center rounded-lg px-4 py-3 text-sm font-medium text-white transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {verifyOtpMutation.isPending ? "Verifying..." : "Verify OTP"}
        </Button>

        <div className="">
          <p className="text-center text-sm text-stone-500">
            Didn&apos;t receive the OTP?{" "}
            <Button
              variant="link"
              className="text-primary hover:text-primary/80"
              disabled={!canResend || verifyOtpMutation.isPending}
              type="button"
              onClick={() => resendOTP()}
            >
              Resend OTP {resendTimer > 0 && `(${resendTimer}s)`}
            </Button>
          </p>
        </div>

        <div className="relative text-center text-sm text-stone-500">
          <div className="absolute inset-0 flex items-center">
            <div className="border-border w-full border-t"></div>
          </div>
          <span className="relative px-2 bg-background">Or continue with</span>
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
