import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Coins, QrCode, TrendingDown, TrendingUp } from "lucide-react";
import { Loader2 } from "lucide-react";

export default function Wallet() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const transactions = useQuery(api.wallet.getTransactions);
  const stores = useQuery(api.wallet.getPartnerStores);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg">
      <nav className="glass border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <span className="ml-4 text-xl font-bold">Wallet</span>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Balance Card */}
          <Card className="glass border-white/20 mb-8">
            <CardContent className="pt-6">
              <div className="text-center">
                <Coins className="h-16 w-16 text-primary mx-auto mb-4" />
                <p className="text-sm text-muted-foreground mb-2">Your Balance</p>
                <h2 className="text-5xl font-bold mb-6">{user.ecoPoints || 0}</h2>
                <div className="flex gap-4 justify-center">
                  <Button className="glass-dark">
                    <QrCode className="mr-2 h-4 w-4" />
                    Show QR Code
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Partner Stores */}
          <Card className="glass border-white/20 mb-8">
            <CardHeader>
              <CardTitle>Redeem at Partner Stores</CardTitle>
            </CardHeader>
            <CardContent>
              {!stores || stores.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No partner stores available yet
                </p>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {stores.map((store) => (
                    <div key={store._id} className="glass-dark p-4 rounded-lg">
                      <h3 className="font-bold mb-1">{store.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{store.category}</p>
                      <p className="text-xs text-primary">
                        {store.redemptionRate} points = $1
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Transaction History */}
          <Card className="glass border-white/20">
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              {!transactions || transactions.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No transactions yet
                </p>
              ) : (
                <div className="space-y-3">
                  {transactions.map((tx) => (
                    <div
                      key={tx._id}
                      className="flex items-center justify-between p-4 glass-dark rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {tx.type === "earn" ? (
                          <TrendingUp className="h-5 w-5 text-green-500" />
                        ) : (
                          <TrendingDown className="h-5 w-5 text-red-500" />
                        )}
                        <div>
                          <p className="font-medium">{tx.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(tx._creationTime).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className={tx.type === "earn" ? "text-green-500" : "text-red-500"}>
                        <p className="font-bold">
                          {tx.type === "earn" ? "+" : ""}
                          {tx.amount}
                        </p>
                      </div>
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
