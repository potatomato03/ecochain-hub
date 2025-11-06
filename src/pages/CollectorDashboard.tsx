import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Truck, CheckCircle, Clock, Star, LogOut, Package, TrendingUp, Award } from "lucide-react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";

export default function CollectorDashboard() {
  const { isLoading, isAuthenticated, user, signOut } = useAuth();
  const navigate = useNavigate();
  const pendingPickups = useQuery(api.pickups.getPendingPickups);
  const assignedPickups = useQuery(api.pickups.getCollectorPickups);
  const acceptPickup = useMutation(api.pickups.acceptPickup);
  const completePickup = useMutation(api.pickups.completePickup);
  const rateCitizen = useMutation(api.pickups.rateCitizen);

  const [completeDialog, setCompleteDialog] = useState<{ open: boolean; pickupId: Id<"pickupRequests"> | null; actualWeight: string }>({
    open: false,
    pickupId: null,
    actualWeight: "",
  });

  const [ratingDialog, setRatingDialog] = useState<{ open: boolean; pickupId: Id<"pickupRequests"> | null; rating: number; feedback: string }>({
    open: false,
    pickupId: null,
    rating: 5,
    feedback: "",
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
    if (!isLoading && user && user.role !== "collector") {
      navigate("/dashboard");
    }
  }, [isLoading, isAuthenticated, user, navigate]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const completedPickups = assignedPickups?.filter((p) => p.status === "completed").length || 0;
  const totalEarnings = assignedPickups?.reduce((sum, p) => sum + (p.ecoPointsEarned || 0), 0) || 0;
  const avgRating = user.rating || 0;

  const handleAcceptPickup = async (pickupId: Id<"pickupRequests">) => {
    try {
      await acceptPickup({ pickupId });
      toast.success("Pickup accepted successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to accept pickup");
    }
  };

  const handleCompletePickup = async () => {
    if (!completeDialog.pickupId || !completeDialog.actualWeight) return;

    try {
      const result = await completePickup({
        pickupId: completeDialog.pickupId,
        actualWeight: parseFloat(completeDialog.actualWeight),
      });
      toast.success(`Pickup completed! Citizen earned ${result.ecoPoints} EcoPoints`);
      setCompleteDialog({ open: false, pickupId: null, actualWeight: "" });
      setRatingDialog({ open: true, pickupId: completeDialog.pickupId, rating: 5, feedback: "" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to complete pickup");
    }
  };

  const handleRateCitizen = async () => {
    if (!ratingDialog.pickupId) return;

    try {
      await rateCitizen({
        pickupId: ratingDialog.pickupId,
        rating: ratingDialog.rating,
        feedback: ratingDialog.feedback || undefined,
      });
      toast.success("Rating submitted successfully!");
      setRatingDialog({ open: false, pickupId: null, rating: 5, feedback: "" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit rating");
    }
  };

  return (
    <div className="min-h-screen gradient-bg">
      {/* Navbar */}
      <nav className="glass border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
              <img src="/logo.svg" alt="EcoChain Hub" className="h-8 w-8" />
              <span className="text-xl font-bold">EcoChain Hub - Collector</span>
            </div>
            <div className="flex items-center gap-4">
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
            Welcome, {user.name || "Collector"}!
          </h1>
          <p className="text-muted-foreground mb-8">Manage your pickups and track earnings</p>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="glass border-white/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Collections</CardTitle>
                <Package className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{completedPickups}</div>
              </CardContent>
            </Card>

            <Card className="glass border-white/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                <TrendingUp className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalEarnings}</div>
                <p className="text-xs text-muted-foreground mt-1">EcoPoints</p>
              </CardContent>
            </Card>

            <Card className="glass border-white/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                <Star className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{avgRating.toFixed(1)}</div>
                <p className="text-xs text-muted-foreground mt-1">out of 5</p>
              </CardContent>
            </Card>

            <Card className="glass border-white/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                <Truck className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {assignedPickups?.filter((p) => p.status === "accepted").length || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pickups Tabs */}
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-2 glass">
              <TabsTrigger value="pending">Available Pickups</TabsTrigger>
              <TabsTrigger value="assigned">My Pickups</TabsTrigger>
            </TabsList>

            <TabsContent value="pending">
              <Card className="glass border-white/20">
                <CardHeader>
                  <CardTitle>Available Pickup Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  {!pendingPickups || pendingPickups.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No pending pickups available
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {pendingPickups.map((pickup) => (
                        <div
                          key={pickup._id}
                          className="flex items-center justify-between p-4 glass-dark rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="font-medium capitalize">{pickup.materialType}</p>
                            <p className="text-sm text-muted-foreground">
                              {pickup.estimatedWeight} kg • {pickup.address}
                            </p>
                            {pickup.notes && (
                              <p className="text-xs text-muted-foreground mt-1">Note: {pickup.notes}</p>
                            )}
                          </div>
                          <Button onClick={() => handleAcceptPickup(pickup._id)}>
                            Accept
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="assigned">
              <Card className="glass border-white/20">
                <CardHeader>
                  <CardTitle>My Assigned Pickups</CardTitle>
                </CardHeader>
                <CardContent>
                  {!assignedPickups || assignedPickups.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No assigned pickups yet
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {assignedPickups.map((pickup) => (
                        <div
                          key={pickup._id}
                          className="flex items-center justify-between p-4 glass-dark rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium capitalize">{pickup.materialType}</p>
                              <Badge
                                variant={
                                  pickup.status === "completed"
                                    ? "default"
                                    : pickup.status === "accepted"
                                    ? "secondary"
                                    : "outline"
                                }
                              >
                                {pickup.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {pickup.estimatedWeight} kg • {pickup.address}
                            </p>
                            {pickup.status === "completed" && pickup.ecoPointsEarned && (
                              <p className="text-xs text-primary mt-1">
                                Citizen earned: {pickup.ecoPointsEarned} EcoPoints
                              </p>
                            )}
                          </div>
                          {pickup.status === "accepted" && (
                            <Button
                              onClick={() =>
                                setCompleteDialog({
                                  open: true,
                                  pickupId: pickup._id,
                                  actualWeight: pickup.estimatedWeight.toString(),
                                })
                              }
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Complete
                            </Button>
                          )}
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

      {/* Complete Pickup Dialog */}
      <Dialog open={completeDialog.open} onOpenChange={(open) => setCompleteDialog({ ...completeDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Pickup</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="actualWeight">Actual Weight (kg)</Label>
              <Input
                id="actualWeight"
                type="number"
                step="0.1"
                value={completeDialog.actualWeight}
                onChange={(e) => setCompleteDialog({ ...completeDialog, actualWeight: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCompleteDialog({ open: false, pickupId: null, actualWeight: "" })}>
              Cancel
            </Button>
            <Button onClick={handleCompletePickup}>Complete Pickup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rate Citizen Dialog */}
      <Dialog open={ratingDialog.open} onOpenChange={(open) => setRatingDialog({ ...ratingDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate Citizen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Rating</Label>
              <div className="flex gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-8 w-8 cursor-pointer ${
                      star <= ratingDialog.rating ? "fill-yellow-500 text-yellow-500" : "text-gray-300"
                    }`}
                    onClick={() => setRatingDialog({ ...ratingDialog, rating: star })}
                  />
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="feedback">Feedback (Optional)</Label>
              <Textarea
                id="feedback"
                value={ratingDialog.feedback}
                onChange={(e) => setRatingDialog({ ...ratingDialog, feedback: e.target.value })}
                placeholder="Share your experience..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRatingDialog({ open: false, pickupId: null, rating: 5, feedback: "" })}>
              Skip
            </Button>
            <Button onClick={handleRateCitizen}>Submit Rating</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
