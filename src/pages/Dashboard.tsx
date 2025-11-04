import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins, Recycle, TrendingUp, Plus, LogOut, Award, Droplet, Leaf, Trophy } from "lucide-react";
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

  // Calculate environmental impact metrics
  const co2Saved = Math.round(totalWeight * 2.5); // 2.5 kg CO2 per kg recycled
  const waterConserved = Math.round(totalWeight * 17); // 17 liters per kg

  // Determine achievements based on metrics
  const achievements = [
    {
      name: "Eco-Warrior",
      level: totalWeight >= 50 ? "Gold" : totalWeight >= 25 ? "Silver" : "Bronze",
      description: `Recycled ${totalWeight.toFixed(1)}kg+ materials`,
      unlocked: totalWeight >= 50,
      icon: Award,
      color: totalWeight >= 50 ? "text-yellow-500" : totalWeight >= 25 ? "text-gray-400" : "text-orange-600",
    },
    {
      name: "Planet Guardian",
      level: completedPickups >= 30 ? "Gold" : completedPickups >= 15 ? "Silver" : "Bronze",
      description: `${completedPickups}+ pickups completed`,
      unlocked: completedPickups >= 15,
      icon: Trophy,
      color: completedPickups >= 30 ? "text-yellow-500" : completedPickups >= 15 ? "text-gray-400" : "text-orange-600",
    },
    {
      name: "Waste Hero",
      level: ecoPoints >= 1000 ? "Gold" : ecoPoints >= 500 ? "Silver" : "Bronze",
      description: `Recycle ${ecoPoints >= 1000 ? "1000" : "100"}kg materials`,
      unlocked: ecoPoints >= 500,
      icon: Recycle,
      color: ecoPoints >= 1000 ? "text-yellow-500" : ecoPoints >= 500 ? "text-gray-400" : "text-orange-600",
    },
  ];

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

          {/* Environmental Impact Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="glass border-white/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">CO₂ Saved</CardTitle>
                <Leaf className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{co2Saved}</div>
                <p className="text-xs text-muted-foreground mt-1">kg</p>
              </CardContent>
            </Card>

            <Card className="glass border-white/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Water Conserved</CardTitle>
                <Droplet className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{waterConserved}</div>
                <p className="text-xs text-muted-foreground mt-1">liters</p>
              </CardContent>
            </Card>

            <Card className="glass border-white/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Recycled</CardTitle>
                <Recycle className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalWeight.toFixed(1)}</div>
                <p className="text-xs text-muted-foreground mt-1">kg</p>
              </CardContent>
            </Card>

            <Card className="glass border-white/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Tokens Earned</CardTitle>
                <Coins className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{ecoPoints}</div>
                <p className="text-xs text-muted-foreground mt-1">SST</p>
              </CardContent>
            </Card>
          </div>

          {/* Achievements Section */}
          <Card className="glass border-white/20 mb-8">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                <CardTitle>Your Achievements</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {achievements.map((achievement, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`glass-dark p-4 rounded-lg border-2 ${
                      achievement.unlocked ? "border-primary/50" : "border-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-full bg-primary/20 ${achievement.color}`}>
                        <achievement.icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-bold">{achievement.name}</p>
                          <Badge
                            variant={achievement.level === "Gold" ? "default" : "secondary"}
                            className={
                              achievement.level === "Gold"
                                ? "bg-yellow-500 text-black"
                                : achievement.level === "Silver"
                                ? "bg-gray-400 text-black"
                                : "bg-orange-600 text-white"
                            }
                          >
                            {achievement.level}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

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