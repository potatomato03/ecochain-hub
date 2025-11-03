import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, Recycle, TrendingUp, Plus, LogOut } from "lucide-react";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const { isLoading, isAuthenticated, user, signOut } = useAuth();
  const navigate = useNavigate();
  const pickups = useQuery(api.pickups.getUserPickups);
  const transactions = useQuery(api.wallet.getTransactions);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const ecoPoints = user.ecoPoints || 0;
  const completedPickups = pickups?.filter((p) => p.status === "completed").length || 0;
  const totalWeight = pickups?.reduce((sum, p) => sum + (p.actualWeight || 0), 0) || 0;

  return (
    <div className="min-h-screen gradient-bg">
      {/* Navbar */}
      <nav className="glass border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
              <img src="/logo.svg" alt="EcoChain Hub" className="h-8 w-8" />
              <span className="text-xl font-bold">EcoChain Hub</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate("/leaderboard")}>
                Leaderboard
              </Button>
              <Button variant="ghost" onClick={() => navigate("/wallet")}>
                Wallet
              </Button>
              <Button variant="ghost" size="icon" onClick={() => signOut()}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Welcome back, {user.name || "Recycler"}!
          </h1>
          <p className="text-muted-foreground mb-8">Track your impact and manage pickups</p>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="glass border-white/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">EcoPoints Balance</CardTitle>
                <Coins className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{ecoPoints}</div>
                <p className="text-xs text-muted-foreground mt-1">Available for redemption</p>
              </CardContent>
            </Card>

            <Card className="glass border-white/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Completed Pickups</CardTitle>
                <Recycle className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{completedPickups}</div>
                <p className="text-xs text-muted-foreground mt-1">Total collections</p>
              </CardContent>
            </Card>

            <Card className="glass border-white/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Recycled</CardTitle>
                <TrendingUp className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalWeight.toFixed(1)} kg</div>
                <p className="text-xs text-muted-foreground mt-1">Environmental impact</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Button
                size="lg"
                className="glass-dark h-24 text-lg"
                onClick={() => navigate("/pickup")}
              >
                <Plus className="mr-2 h-6 w-6" />
                Request Pickup
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="glass h-24 text-lg"
                onClick={() => navigate("/wallet")}
              >
                <Coins className="mr-2 h-6 w-6" />
                Redeem Points
              </Button>
            </div>
          </div>

          {/* Recent Activity */}
          <Card className="glass border-white/20">
            <CardHeader>
              <CardTitle>Recent Pickups</CardTitle>
            </CardHeader>
            <CardContent>
              {!pickups || pickups.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No pickups yet. Request your first pickup to get started!
                </p>
              ) : (
                <div className="space-y-4">
                  {pickups.slice(0, 5).map((pickup) => (
                    <div
                      key={pickup._id}
                      className="flex items-center justify-between p-4 glass-dark rounded-lg"
                    >
                      <div>
                        <p className="font-medium capitalize">{pickup.materialType}</p>
                        <p className="text-sm text-muted-foreground">
                          {pickup.estimatedWeight} kg • {pickup.status}
                        </p>
                      </div>
                      {pickup.ecoPointsEarned && (
                        <div className="text-right">
                          <p className="font-bold text-primary">+{pickup.ecoPointsEarned}</p>
                          <p className="text-xs text-muted-foreground">EcoPoints</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
