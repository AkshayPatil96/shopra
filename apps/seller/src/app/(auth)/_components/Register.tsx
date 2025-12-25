"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import {
  CircleAlertIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MailIcon,
  PhoneIcon,
  UserIcon,
} from "lucide-react";

import Link from "next/link";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  RegisterSellerDTO,
  RegisterSellerSchema,
} from "@repo/shared-types";
import { PhoneInputField } from "@/components/ui/phoneInput";
import { zodResolver } from "@hookform/resolvers/zod";
import CountryList from "country-list";
import { useMutation } from "@tanstack/react-query";
import { SellerAuthAPI } from "@repo/shared-axios";
import { toast } from "sonner";
import OtpForm from "./OtpForm";
import { Alert, AlertTitle } from "@/components/ui/alert";

const Register = () => {
  const countries = CountryList.getData()?.map((country) => ({
    label: country.name,
    value: country.code,
  }));

  const form = useForm<RegisterSellerDTO>({
    resolver: zodResolver(RegisterSellerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      userType: "seller",
      phone: "",
      country: "IN",
    },
  });

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [userData, setUserData] = useState<RegisterSellerDTO | null>(null);
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);

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
    mutationFn: async (data: RegisterSellerDTO) => {
      return await SellerAuthAPI.register(data);
    },
    onSuccess: (_, formData) => {
      toast.success(
        "Registration successful! Please check your email for OTP.",
      );
      setShowOtp(true);
      setUserData(formData);
      setCanResend(false);
      setResendTimer(60);
      startResendTimer();
    },
    onError: (error: any) => {
      console.error("Registration error:", error);
      toast.error(error.message || "Registration failed");
    },
  });

  const onSubmit = async (data: RegisterSellerDTO) => {
    await signUpMutation.mutateAsync(data);
  };

  return (
    <div className="container">
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
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
              <h2 className="text-3xl uppercase">Create your Seller account</h2>
              <p className="mt-2 text-sm text-secondary-foreground">
                Join us and start selling your products today!
              </p>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-4"
              >
                {/* API Error */}
                {signUpMutation.isError && (
                  <Alert variant="error">
                    <CircleAlertIcon />
                    <AlertTitle>
                      {String(signUpMutation.error?.message)}
                    </AlertTitle>
                  </Alert>
                )}

                {/* NAME */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase">Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="Enter your name"
                            {...field}
                            className="pl-8"
                          />
                          <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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

                {/* PHONE */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase">Phone Number</FormLabel>
                      <FormControl>
                        <PhoneInputField
                          placeholder="Enter your phone number"
                          value={field.value}
                          onChange={field.onChange}
                          // error={form.formState.errors.phone?.message}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* COUNTRY */}
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase">Country</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue>
                              {field.value
                                ? countries.find((c) => c.value === field.value)
                                    ?.label
                                : "Select your country"}
                            </SelectValue>
                          </SelectTrigger>

                          <SelectContent>
                            {countries.map(({ label, value }) => (
                              <SelectItem
                                key={value}
                                value={value}
                              >
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                        <div className="relative">
                          <Input
                            placeholder="Enter your password"
                            type={passwordVisible ? "text" : "password"}
                            {...field}
                            className="pl-8 pr-8"
                          />

                          <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />

                          <button
                            type="button"
                            onClick={() => setPasswordVisible(!passwordVisible)}
                            className="absolute right-3 top-1/2 -translate-y-1/2"
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

                {/* SUBMIT */}
                <Button
                  type="submit"
                  className="mt-2 w-full py-3"
                >
                  Continue
                </Button>

                <div className="mt-4 text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="text-primary hover:text-primary/80"
                  >
                    Login
                  </Link>
                </div>
              </form>
            </Form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;
