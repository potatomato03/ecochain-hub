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
import { ArrowRight, Loader2, Mail, Recycle, Truck, UserX, Sparkles, Leaf } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";

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
      if (user.role === "collector") {
        navigate("/collector", { replace: true });
      } else if (user.role === "citizen") {
        navigate("/dashboard", { replace: true });
      }
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

      setTimeout(async () => {
        try {
          await setUserRole({ role: selectedRole });
          const redirect = selectedRole === "collector" ? "/collector" : "/landing";
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
      
      setTimeout(async () => {
        try {
          await setUserRole({ role: selectedRole });
          const redirect = selectedRole === "collector" ? "/collector" : "/landing";
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
    <div className="min-h-screen flex flex-col relative overflow-hidden gradient-bg">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-accent/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </div>

      {/* Auth Content */}
      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={step === "roleSelect" ? "role" : step === "signIn" ? "signin" : "otp"}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md"
          >
            <Card className="glass border-2 border-white/30 shadow-2xl backdrop-blur-xl">
              {step === "roleSelect" ? (
                <>
                  <CardHeader className="text-center mt-4 space-y-4">
                    <motion.div 
                      className="flex justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    >
                      <div className="relative">
                        <motion.div
                          className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl"
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 0.8, 0.5],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        />
                        <img
                          src="./logo.svg"
                          alt="EcoChain Hub"
                          width={80}
                          height={80}
                          className="rounded-2xl mb-4 cursor-pointer relative z-10 shadow-lg"
                          onClick={() => navigate("/")}
                        />
                      </div>
                    </motion.div>
                    <div>
                      <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                        Welcome to EcoChain Hub
                      </CardTitle>
                      <CardDescription className="text-base mt-2 flex items-center justify-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        Choose your role to get started
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4 px-6">
                    <div className="space-y-4">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                          selectedRole === "citizen"
                            ? "border-primary bg-gradient-to-br from-primary/20 to-primary/10 shadow-lg"
                            : "border-white/20 glass-dark hover:border-white/40"
                        }`}
                        onClick={() => setSelectedRole("citizen")}
                      >
                        <div className="flex items-center gap-4">
                          <motion.div
                            className={`p-3 rounded-xl ${
                              selectedRole === "citizen" ? "bg-primary/20" : "bg-white/10"
                            }`}
                            animate={selectedRole === "citizen" ? { rotate: [0, 5, -5, 0] } : {}}
                            transition={{ duration: 0.5 }}
                          >
                            <Recycle className="h-8 w-8 text-primary" />
                          </motion.div>
                          <div className="flex-1">
                            <p className="font-bold text-lg">Recycler</p>
                            <p className="text-sm text-muted-foreground">
                              Schedule pickups and earn rewards
                            </p>
                          </div>
                          {selectedRole === "citizen" && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                            >
                              <Leaf className="h-4 w-4 text-white" />
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                      
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                          selectedRole === "collector"
                            ? "border-primary bg-gradient-to-br from-primary/20 to-primary/10 shadow-lg"
                            : "border-white/20 glass-dark hover:border-white/40"
                        }`}
                        onClick={() => setSelectedRole("collector")}
                      >
                        <div className="flex items-center gap-4">
                          <motion.div
                            className={`p-3 rounded-xl ${
                              selectedRole === "collector" ? "bg-primary/20" : "bg-white/10"
                            }`}
                            animate={selectedRole === "collector" ? { rotate: [0, 5, -5, 0] } : {}}
                            transition={{ duration: 0.5 }}
                          >
                            <Truck className="h-8 w-8 text-primary" />
                          </motion.div>
                          <div className="flex-1">
                            <p className="font-bold text-lg">Waste Collector</p>
                            <p className="text-sm text-muted-foreground">
                              Accept pickups and earn income
                            </p>
                          </div>
                          {selectedRole === "collector" && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                            >
                              <Leaf className="h-4 w-4 text-white" />
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    </div>
                  </CardContent>
                  <CardFooter className="px-6">
                    <motion.div className="w-full" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        onClick={handleRoleConfirm}
                        className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg"
                      >
                        Continue as {selectedRole === "citizen" ? "Recycler" : "Collector"}
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </motion.div>
                  </CardFooter>
                </>
              ) : step === "signIn" ? (
                <>
                  <CardHeader className="text-center space-y-4">
                    <motion.div 
                      className="flex justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    >
                      <img
                        src="./logo.svg"
                        alt="Lock Icon"
                        width={64}
                        height={64}
                        className="rounded-xl mb-4 mt-4 cursor-pointer shadow-lg"
                        onClick={() => setStep("roleSelect")}
                      />
                    </motion.div>
                    <div>
                      <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
                      <CardDescription className="mt-2">
                        Enter your email to continue as {selectedRole === "citizen" ? "Recycler" : "Collector"}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <form onSubmit={handleEmailSubmit}>
                    <CardContent className="space-y-4">
                      <div className="relative flex items-center gap-2">
                        <div className="relative flex-1">
                          <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                          <Input
                            name="email"
                            placeholder="name@example.com"
                            type="email"
                            className="pl-10 h-12 glass border-white/30"
                            disabled={isLoading}
                            required
                          />
                        </div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            type="submit"
                            variant="outline"
                            size="icon"
                            className="h-12 w-12 glass border-white/30"
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                              <ArrowRight className="h-5 w-5" />
                            )}
                          </Button>
                        </motion.div>
                      </div>
                      {error && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-sm text-red-500 bg-red-50 p-3 rounded-lg"
                        >
                          {error}
                        </motion.p>
                      )}
                      
                      <div className="mt-6">
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-white/20" />
                          </div>
                          <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-3 text-muted-foreground font-medium">
                              Or
                            </span>
                          </div>
                        </div>
                        
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full mt-4 h-12 glass border-white/30"
                            onClick={handleGuestLogin}
                            disabled={isLoading}
                          >
                            <UserX className="mr-2 h-5 w-5" />
                            Continue as Guest
                          </Button>
                        </motion.div>
                        
                        <Button
                          type="button"
                          variant="ghost"
                          className="w-full mt-2 h-10"
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
                  <CardHeader className="text-center mt-4 space-y-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    >
                      <div className="w-16 h-16 mx-auto bg-primary/20 rounded-full flex items-center justify-center mb-4">
                        <Mail className="h-8 w-8 text-primary" />
                      </div>
                    </motion.div>
                    <div>
                      <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
                      <CardDescription className="mt-2">
                        We've sent a code to <span className="font-semibold text-foreground">{step.email}</span>
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <form onSubmit={handleOtpSubmit}>
                    <CardContent className="pb-4 space-y-4">
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
                              <InputOTPSlot key={index} index={index} className="glass border-white/30" />
                            ))}
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                      {error && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-sm text-red-500 text-center bg-red-50 p-3 rounded-lg"
                        >
                          {error}
                        </motion.p>
                      )}
                      <p className="text-sm text-muted-foreground text-center mt-4">
                        Didn't receive a code?{" "}
                        <Button
                          variant="link"
                          className="p-0 h-auto text-primary font-semibold"
                          onClick={() => setStep("signIn")}
                        >
                          Try again
                        </Button>
                      </p>
                    </CardContent>
                    <CardFooter className="flex-col gap-3 px-6">
                      <motion.div className="w-full" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          type="submit"
                          className="w-full h-12 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg"
                          disabled={isLoading || otp.length !== 6}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              Verifying...
                            </>
                          ) : (
                            <>
                              Verify code
                              <ArrowRight className="ml-2 h-5 w-5" />
                            </>
                          )}
                        </Button>
                      </motion.div>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setStep("signIn")}
                        disabled={isLoading}
                        className="w-full h-10"
                      >
                        Use different email
                      </Button>
                    </CardFooter>
                  </form>
                </>
              )}

              <div className="py-4 px-6 text-xs text-center text-muted-foreground bg-muted/50 border-t border-white/10 rounded-b-lg backdrop-blur-sm">
                Secured by{" "}
                <a
                  href="https://vly.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-primary transition-colors font-semibold"
                >
                  vly.ai
                </a>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
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