"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MailIcon,
  TriangleAlertIcon,
  UserIcon,
} from "lucide-react";
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
import {
  LoginDTO,
  RegisterDTO,
  RegisterSchema,
} from "@repo/shared-types";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { UserAuthAPI } from "@repo/shared-axios";
import OtpForm from "./OtpForm";
import { toast } from "sonner";

const Register = () => {
  const router = useRouter();

  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);

  const [showOtp, setShowOtp] = useState<boolean>(false);

  const [userData, setUserData] = useState<RegisterDTO | null>(null);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [resendTimer, setResendTimer] = useState<number>(60);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<RegisterDTO>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      userType: "user",
    },
  });

  const startResendTimer = () => {
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const signUpMutation = useMutation({
    mutationFn: async (data: RegisterDTO) => {
      const response = await UserAuthAPI.register(data);
      console.log("✅✅✅✅response: ", response);
      return response;
    },
    onSuccess: (_, formData) => {
      console.log("✅✅✅✅ Registration successful:", _);
      console.log("formData: ", formData);
      toast.success(
        "Registration successful! Please check your email for the OTP.",
      );
      setShowOtp(true);
      setUserData(formData);
      setCanResend(false);
      setResendTimer(60);
      startResendTimer();
    },
    onError: (error: any) => {
      console.error("❌❌❌❌ Registration failed:", error);
    },
  });

  const onSubmit = async (data: RegisterDTO) => {
    await signUpMutation.mutateAsync(data);
  };

  return (
    <div className="container">
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        {showOtp ? (
          <OtpForm
            canResend={canResend}
            resendTimer={resendTimer}
            setCanResend={setCanResend}
            setResendTimer={setResendTimer}
            userData={userData}
          />
        ) : (
          <div className="w-full lg:w-1/2">
            <div className="mb-6 text-center">
              <h2 className="text-3xl uppercase">Create an account</h2>
              <p className="mt-2 text-sm text-stone-600">
                Sign up to start your shopping journey
              </p>
            </div>
            <Form
              className="flex flex-col gap-4"
              onSubmit={handleSubmit(onSubmit)}
            >
              {signUpMutation?.isError && signUpMutation.error && (
                <div className="w-fit flex items-center justify-center mx-auto gap-2 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-500">
                  <TriangleAlertIcon className="size-5 text-red-500" />
                  {signUpMutation.error.message}
                </div>
              )}
              <Field name="name">
                <FieldLabel className="block text-sm font-medium uppercase">
                  Name
                </FieldLabel>
                <InputGroup className={`border-border bg-input py-2`}>
                  <InputGroupInput
                    aria-label="Name"
                    placeholder="Enter your name"
                    type="text"
                    {...register("name")}
                  />
                  <InputGroupAddon>
                    <UserIcon className="size-6 text-gray-400" />
                  </InputGroupAddon>
                </InputGroup>
                {/* <FieldError /> */}
                {errors.name?.message && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.name.message}
                  </p>
                )}
              </Field>
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
                  <p className="mt-1 text-sm text-red-500">
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
                  <p className="mt-1 text-sm text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </Field>
              <Button
                type="submit"
                className="login-btn relative flex w-full items-center justify-center rounded-lg px-4 py-3 text-sm font-medium text-white transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={signUpMutation.isPending}
              >
                {signUpMutation.isPending
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
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-primary hover:text-primary/80"
              >
                Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;
