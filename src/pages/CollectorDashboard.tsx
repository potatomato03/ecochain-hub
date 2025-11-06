import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Truck, CheckCircle, Clock, Star, LogOut, Package, MapPin, User, Phone, Mail } from "lucide-react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export default function CollectorDashboard() {
  const { isLoading, isAuthenticated, user, signOut } = useAuth();
  const navigate = useNavigate();
  const pendingPickups = useQuery(api.pickups.getPendingPickups);
  const assignedPickups = useQuery(api.pickups.getCollectorPickups);
  const acceptPickup = useMutation(api.pickups.acceptPickup);
  const completePickup = useMutation(api.pickups.completePickup);
  const rateCitizen = useMutation(api.pickups.rateCitizen);
  const toggleAvailability = useMutation(api.pickups.toggleAvailability);

  const [isAvailable, setIsAvailable] = useState(true);
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

  useEffect(() => {
    if (user) {
      setIsAvailable(user.isVerified || false);
    }
  }, [user]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const acceptedPickups = assignedPickups?.filter((p) => p.status === "accepted") || [];
  const completedPickups = assignedPickups?.filter((p) => p.status === "completed") || [];

  const handleAvailabilityToggle = async (checked: boolean) => {
    try {
      await toggleAvailability({ isAvailable: checked });
      setIsAvailable(checked);
      toast.success(checked ? "You are now available for pickups" : "You are now unavailable");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update availability");
    }
  };

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

  const PickupCard = ({ pickup, type }: { pickup: any; type: "available" | "accepted" | "completed" }) => (
    <Card className="bg-white border-2 border-green-100 hover:border-green-300 transition-all">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge
                variant={type === "completed" ? "default" : type === "accepted" ? "secondary" : "outline"}
                className={
                  type === "completed"
                    ? "bg-green-500 text-white"
                    : type === "accepted"
                    ? "bg-blue-500 text-white"
                    : "bg-yellow-500 text-white"
                }
              >
                {type === "completed" ? "Completed" : type === "accepted" ? "Accepted" : "Pending"}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {new Date(pickup._creationTime).toLocaleDateString()}
              </span>
            </div>
            <CardTitle className="text-base capitalize">{pickup.materialType}</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span className="text-muted-foreground">{pickup.address}</span>
          </div>
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-green-600" />
            <span className="text-muted-foreground">
              Quantity: {pickup.actualWeight || pickup.estimatedWeight} kg
            </span>
          </div>
          {pickup.notes && (
            <div className="text-xs text-muted-foreground bg-green-50 p-2 rounded">
              Note: {pickup.notes}
            </div>
          )}
        </div>

        {type === "available" && (
          <Button
            onClick={() => handleAcceptPickup(pickup._id)}
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={!isAvailable}
          >
            Accept Pickup
          </Button>
        )}

        {type === "accepted" && (
          <Button
            onClick={() =>
              setCompleteDialog({
                open: true,
                pickupId: pickup._id,
                actualWeight: pickup.estimatedWeight.toString(),
              })
            }
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Mark as Complete
          </Button>
        )}

        {type === "completed" && pickup.ecoPointsEarned && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Citizen earned:</span>
            <span className="font-bold text-green-600">{pickup.ecoPointsEarned} EcoPoints</span>
          </div>
        )}

        {type === "completed" && pickup.collectorRating && (
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">Your Rating:</span>
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < pickup.collectorRating ? "fill-yellow-500 text-yellow-500" : "text-gray-300"
                }`}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-green-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
              <img src="/logo.svg" alt="EcoChain Hub" className="h-8 w-8" />
              <span className="text-xl font-bold text-green-700">EcoChain Hub</span>
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
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-green-800 mb-2">
              Welcome Captain {user.name || ""}!
            </h1>
            <p className="text-muted-foreground">Manage your pickup requests and track your collections</p>
          </div>

          {/* Profile & Availability Section */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Profile Card */}
            <Card className="bg-white border-2 border-green-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <User className="h-5 w-5" />
                  Your Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Name:</span>
                  <span className="text-muted-foreground">{user.name || "Not set"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Email:</span>
                  <span className="text-muted-foreground text-xs">{user.email || "Not set"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Phone:</span>
                  <span className="text-muted-foreground">{user.phone || "Not set"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Collections:</span>
                  <span className="text-muted-foreground">{user.totalCollections || 0}</span>
                </div>
              </CardContent>
            </Card>

            {/* Availability Toggle */}
            <Card className="bg-white border-2 border-green-100">
              <CardHeader>
                <CardTitle className="text-green-700">Availability Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{isAvailable ? "Available" : "Unavailable"}</p>
                    <p className="text-xs text-muted-foreground">
                      {isAvailable ? "You can accept pickups" : "You won't receive requests"}
                    </p>
                  </div>
                  <Switch checked={isAvailable} onCheckedChange={handleAvailabilityToggle} />
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
              <CardHeader>
                <CardTitle className="text-white">Your Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Collections:</span>
                  <span className="font-bold">{completedPickups.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Jobs:</span>
                  <span className="font-bold">{acceptedPickups.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Rating:</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-300 text-yellow-300" />
                    <span className="font-bold">{(user.rating || 0).toFixed(1)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Map Widget */}
          <Card className="bg-white border-2 border-green-100 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <MapPin className="h-5 w-5" />
                Pickup Locations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full h-[300px] rounded-lg overflow-hidden">
                <MapContainer
                  center={[17.385, 78.4867]}
                  zoom={12}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {pendingPickups?.map((pickup) => (
                    <Marker key={pickup._id} position={[pickup.latitude, pickup.longitude]}>
                      <Popup>
                        <div className="text-sm">
                          <p className="font-bold capitalize">{pickup.materialType}</p>
                          <p className="text-xs">{pickup.estimatedWeight} kg</p>
                          <p className="text-xs text-muted-foreground">{pickup.address}</p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                  {acceptedPickups?.map((pickup) => (
                    <Marker key={pickup._id} position={[pickup.latitude, pickup.longitude]}>
                      <Popup>
                        <div className="text-sm">
                          <p className="font-bold capitalize">{pickup.materialType}</p>
                          <p className="text-xs">{pickup.estimatedWeight} kg</p>
                          <p className="text-xs text-blue-600">Accepted by you</p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </CardContent>
          </Card>

          {/* Available Pickups Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-6 w-6 text-yellow-600" />
              <h2 className="text-2xl font-bold text-green-800">Available Pickups</h2>
              <Badge variant="secondary" className="ml-2">
                {pendingPickups?.length || 0}
              </Badge>
            </div>
            {!pendingPickups || pendingPickups.length === 0 ? (
              <Card className="bg-white border-2 border-green-100">
                <CardContent className="py-12">
                  <p className="text-muted-foreground text-center">
                    No available pickups at the moment
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingPickups.map((pickup) => (
                  <PickupCard key={pickup._id} pickup={pickup} type="available" />
                ))}
              </div>
            )}
          </div>

          {/* Accepted Pickups Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Truck className="h-6 w-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-green-800">Your Accepted Pickups</h2>
              <Badge variant="secondary" className="ml-2">
                {acceptedPickups.length}
              </Badge>
            </div>
            {acceptedPickups.length === 0 ? (
              <Card className="bg-white border-2 border-green-100">
                <CardContent className="py-12">
                  <p className="text-muted-foreground text-center">
                    No accepted pickups yet
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {acceptedPickups.map((pickup) => (
                  <PickupCard key={pickup._id} pickup={pickup} type="accepted" />
                ))}
              </div>
            )}
          </div>

          {/* Completed Pickups Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <h2 className="text-2xl font-bold text-green-800">Completed Pickups</h2>
              <Badge variant="secondary" className="ml-2">
                {completedPickups.length}
              </Badge>
            </div>
            {completedPickups.length === 0 ? (
              <Card className="bg-white border-2 border-green-100">
                <CardContent className="py-12">
                  <p className="text-muted-foreground text-center">
                    No completed pickups yet
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedPickups.map((pickup) => (
                  <PickupCard key={pickup._id} pickup={pickup} type="completed" />
                ))}
              </div>
            )}
          </div>
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
            <Button onClick={handleCompletePickup} className="bg-green-600 hover:bg-green-700">
              Complete Pickup
            </Button>
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
            <Button onClick={handleRateCitizen} className="bg-green-600 hover:bg-green-700">
              Submit Rating
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}