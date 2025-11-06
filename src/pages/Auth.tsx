import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ArrowRight, Loader2, Mail, Recycle, Truck, UserX } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useNavigate } from "react-router";

interface AuthProps {
  redirectAfterAuth?: string;
}

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const { isLoading: authLoading, isAuthenticated, user, signIn } = useAuth();
  const setUserRole = useMutation(api.users.setUserRole);
  const navigate = useNavigate();
  const [step, setStep] = useState<"roleSelect" | "signIn" | { email: string }>("roleSelect");
  const [selectedRole, setSelectedRole] = useState<"citizen" | "collector">("citizen");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      // If user has a role, redirect to appropriate dashboard
      if (user.role === "collector") {
        navigate("/collector", { replace: true });
      } else if (user.role === "citizen") {
        navigate("/dashboard", { replace: true });
      }
      // If no role, stay on auth page to show role selection
    }
  }, [authLoading, isAuthenticated, user, navigate]);

  const handleRoleConfirm = () => {
    setStep("signIn");
  };

  const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);
      setStep({ email: formData.get("email") as string });
      setIsLoading(false);
    } catch (error) {
      console.error("Email sign-in error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to send verification code. Please try again.",
      );
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);

      // Wait a moment for auth to complete, then set role
      setTimeout(async () => {
        try {
          await setUserRole({ role: selectedRole });
          const redirect = selectedRole === "collector" ? "/collector" : "/dashboard";
          navigate(redirect, { replace: true });
        } catch (err) {
          console.error("Role setting error:", err);
          setError("Failed to set role. Please try again.");
        }
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error("OTP verification error:", error);
      setError("The verification code you entered is incorrect.");
      setIsLoading(false);
      setOtp("");
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn("anonymous");
      
      // Wait a moment for auth to complete, then set role
      setTimeout(async () => {
        try {
          await setUserRole({ role: selectedRole });
          const redirect = selectedRole === "collector" ? "/collector" : "/dashboard";
          navigate(redirect, { replace: true });
        } catch (err) {
          console.error("Role setting error:", err);
          setError("Failed to set role. Please try again.");
        }
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error("Guest login error:", error);
      setError(`Failed to sign in as guest: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Auth Content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center justify-center h-full flex-col">
        <Card className="min-w-[350px] pb-0 border shadow-md">
          {step === "roleSelect" ? (
            <>
              <CardHeader className="text-center mt-4">
                <div className="flex justify-center">
                  <img
                    src="./logo.svg"
                    alt="EcoChain Hub"
                    width={64}
                    height={64}
                    className="rounded-lg mb-4 cursor-pointer"
                    onClick={() => navigate("/")}
                  />
                </div>
                <CardTitle>Welcome to EcoChain Hub</CardTitle>
                <CardDescription>
                  Choose your role to get started
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="space-y-3">
                  <div
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedRole === "citizen"
                        ? "border-primary bg-primary/10"
                        : "border-white/20 glass-dark"
                    }`}
                    onClick={() => setSelectedRole("citizen")}
                  >
                    <div className="flex items-center gap-3">
                      <Recycle className="h-8 w-8 text-primary" />
                      <div>
                        <p className="font-bold">Waste Generator</p>
                        <p className="text-sm text-muted-foreground">
                          Schedule pickups and earn rewards
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedRole === "collector"
                        ? "border-primary bg-primary/10"
                        : "border-white/20 glass-dark"
                    }`}
                    onClick={() => setSelectedRole("collector")}
                  >
                    <div className="flex items-center gap-3">
                      <Truck className="h-8 w-8 text-primary" />
                      <div>
                        <p className="font-bold">Waste Collector</p>
                        <p className="text-sm text-muted-foreground">
                          Accept pickups and earn income
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleRoleConfirm}
                  className="w-full"
                >
                  Continue as {selectedRole === "citizen" ? "Generator" : "Collector"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </>
          ) : step === "signIn" ? (
            <>
              <CardHeader className="text-center">
              <div className="flex justify-center">
                    <img
                      src="./logo.svg"
                      alt="Lock Icon"
                      width={64}
                      height={64}
                      className="rounded-lg mb-4 mt-4 cursor-pointer"
                      onClick={() => setStep("roleSelect")}
                    />
                  </div>
                <CardTitle className="text-xl">Sign In</CardTitle>
                <CardDescription>
                  Enter your email to continue as {selectedRole === "citizen" ? "Generator" : "Collector"}
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleEmailSubmit}>
                <CardContent>
                  
                  <div className="relative flex items-center gap-2">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        name="email"
                        placeholder="name@example.com"
                        type="email"
                        className="pl-9"
                        disabled={isLoading}
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      variant="outline"
                      size="icon"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ArrowRight className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {error && (
                    <p className="mt-2 text-sm text-red-500">{error}</p>
                  )}
                  
                  <div className="mt-4">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                          Or
                        </span>
                      </div>
                    </div>
                    
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full mt-4"
                      onClick={handleGuestLogin}
                      disabled={isLoading}
                    >
                      <UserX className="mr-2 h-4 w-4" />
                      Continue as Guest
                    </Button>
                    
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full mt-2"
                      onClick={() => setStep("roleSelect")}
                      disabled={isLoading}
                    >
                      Change Role
                    </Button>
                  </div>
                </CardContent>
              </form>
            </>
          ) : (
            <>
              <CardHeader className="text-center mt-4">
                <CardTitle>Check your email</CardTitle>
                <CardDescription>
                  We've sent a code to {step.email}
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleOtpSubmit}>
                <CardContent className="pb-4">
                  <input type="hidden" name="email" value={step.email} />
                  <input type="hidden" name="code" value={otp} />

                  <div className="flex justify-center">
                    <InputOTP
                      value={otp}
                      onChange={setOtp}
                      maxLength={6}
                      disabled={isLoading}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && otp.length === 6 && !isLoading) {
                          const form = (e.target as HTMLElement).closest("form");
                          if (form) {
                            form.requestSubmit();
                          }
                        }
                      }}
                    >
                      <InputOTPGroup>
                        {Array.from({ length: 6 }).map((_, index) => (
                          <InputOTPSlot key={index} index={index} />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  {error && (
                    <p className="mt-2 text-sm text-red-500 text-center">
                      {error}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground text-center mt-4">
                    Didn't receive a code?{" "}
                    <Button
                      variant="link"
                      className="p-0 h-auto"
                      onClick={() => setStep("signIn")}
                    >
                      Try again
                    </Button>
                  </p>
                </CardContent>
                <CardFooter className="flex-col gap-2">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading || otp.length !== 6}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        Verify code
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setStep("signIn")}
                    disabled={isLoading}
                    className="w-full"
                  >
                    Use different email
                  </Button>
                </CardFooter>
              </form>
            </>
          )}

          <div className="py-4 px-6 text-xs text-center text-muted-foreground bg-muted border-t rounded-b-lg">
            Secured by{" "}
            <a
              href="https://vly.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-primary transition-colors"
            >
              vly.ai
            </a>
          </div>
        </Card>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage(props: AuthProps) {
  return (
    <Suspense>
      <Auth {...props} />
    </Suspense>
  );
}