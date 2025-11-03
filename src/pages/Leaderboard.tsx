import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Award, Trophy } from "lucide-react";
import { Loader2 } from "lucide-react";

export default function Leaderboard() {
  const navigate = useNavigate();
  const topRecyclers = useQuery(api.leaderboard.getTopRecyclers);
  const topCollectors = useQuery(api.leaderboard.getTopCollectors);

  return (
    <div className="min-h-screen gradient-bg">
      <nav className="glass border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <span className="ml-4 text-xl font-bold">Leaderboard</span>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-8">
            <Trophy className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="text-4xl font-bold tracking-tight mb-2">Top Contributors</h1>
            <p className="text-muted-foreground">Celebrating our eco-champions</p>
          </div>

          <Tabs defaultValue="recyclers" className="w-full">
            <TabsList className="grid w-full grid-cols-2 glass">
              <TabsTrigger value="recyclers">Top Recyclers</TabsTrigger>
              <TabsTrigger value="collectors">Top Collectors</TabsTrigger>
            </TabsList>

            <TabsContent value="recyclers">
              <Card className="glass border-white/20">
                <CardHeader>
                  <CardTitle>Top Recyclers This Month</CardTitle>
                </CardHeader>
                <CardContent>
                  {!topRecyclers ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : topRecyclers.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No recyclers yet. Be the first!
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {topRecyclers.map((recycler) => (
                        <div
                          key={recycler.rank}
                          className="flex items-center justify-between p-4 glass-dark rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20">
                              {recycler.rank <= 3 ? (
                                <Award className="h-5 w-5 text-primary" />
                              ) : (
                                <span className="font-bold">{recycler.rank}</span>
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{recycler.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {recycler.ecoPoints} EcoPoints
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="collectors">
              <Card className="glass border-white/20">
                <CardHeader>
                  <CardTitle>Top Collectors This Month</CardTitle>
                </CardHeader>
                <CardContent>
                  {!topCollectors ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : topCollectors.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No collectors yet
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {topCollectors.map((collector) => (
                        <div
                          key={collector.rank}
                          className="flex items-center justify-between p-4 glass-dark rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20">
                              {collector.rank <= 3 ? (
                                <Award className="h-5 w-5 text-primary" />
                              ) : (
                                <span className="font-bold">{collector.rank}</span>
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{collector.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {collector.totalCollections} collections • ⭐ {collector.rating.toFixed(1)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
