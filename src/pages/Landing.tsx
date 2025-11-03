import { motion } from "framer-motion";
import { Leaf, Recycle, Coins, MapPin, Award, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <div className="min-h-screen gradient-bg">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative overflow-hidden"
      >
        {/* Navbar */}
        <nav className="glass fixed top-0 left-0 right-0 z-50 border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
                <img src="/logo.svg" alt="EcoChain Hub" className="h-8 w-8" />
                <span className="text-xl font-bold tracking-tight">EcoChain Hub</span>
              </div>
              <div className="flex items-center gap-4">
                {!isLoading && (
                  <Button
                    onClick={() => navigate(isAuthenticated ? "/dashboard" : "/auth")}
                    className="glass-dark"
                  >
                    {isAuthenticated ? "Dashboard" : "Get Started"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="pt-32 pb-20 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-6">
                <Leaf className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Blockchain-Powered Recycling</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
                Turn Waste Into
                <span className="text-primary block">Digital Rewards</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                Join the decentralized recycling economy. Request pickups, earn EcoPoints, and redeem rewards at partner stores.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={() => navigate(isAuthenticated ? "/dashboard" : "/auth")}
                  className="text-lg"
                >
                  Start Recycling
                  <Recycle className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" className="glass text-lg">
                  Learn More
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Features Section */}
      <div className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold tracking-tight mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground">Simple, transparent, and rewarding</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: MapPin,
                title: "Request Pickup",
                description: "Schedule doorstep collection of recyclables with verified collectors",
              },
              {
                icon: Recycle,
                title: "Get Verified",
                description: "Collectors verify and weigh materials, logged on blockchain",
              },
              {
                icon: Coins,
                title: "Earn & Redeem",
                description: "Receive EcoPoints instantly, redeem at partner stores",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass p-8 rounded-2xl hover:scale-105 transition-transform"
              >
                <feature.icon className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-20 px-4 glass-dark">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { value: "10K+", label: "Active Users" },
              { value: "50K+", label: "Pickups Completed" },
              { value: "2M+", label: "EcoPoints Earned" },
              { value: "100+", label: "Partner Stores" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-4xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="glass p-12 rounded-3xl"
          >
            <Award className="h-16 w-16 text-primary mx-auto mb-6" />
            <h2 className="text-4xl font-bold tracking-tight mb-4">
              Ready to Make an Impact?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of citizens building a sustainable future
            </p>
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="text-lg"
            >
              Get Started Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}