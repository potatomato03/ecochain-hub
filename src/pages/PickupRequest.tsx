import { useState } from "react";
import { useNavigate } from "react-router";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

const MATERIAL_OPTIONS = [
  { id: "plastic", label: "Plastic" },
  { id: "paper", label: "Paper" },
  { id: "glass", label: "Glass" },
  { id: "metal", label: "Metal" },
  { id: "electronics", label: "Electronics" },
  { id: "organic", label: "Organic" },
];

export default function PickupRequest() {
  const navigate = useNavigate();
  const createPickup = useMutation(api.pickups.createPickupRequest);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    estimatedWeight: "",
    address: "",
    notes: "",
  });

  const handleMaterialToggle = (materialId: string) => {
    setSelectedMaterials((prev) =>
      prev.includes(materialId)
        ? prev.filter((id) => id !== materialId)
        : [...prev, materialId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedMaterials.length === 0) {
      toast.error("Please select at least one material type");
      return;
    }

    setIsLoading(true);

    try {
      let totalPoints = 0;
      const weight = parseFloat(formData.estimatedWeight);

      // Create a pickup for each selected material type
      for (const materialType of selectedMaterials) {
        const result = await createPickup({
          materialType,
          estimatedWeight: weight / selectedMaterials.length, // Distribute weight evenly
          address: formData.address,
          latitude: 0, // Mock GPS
          longitude: 0,
          notes: formData.notes || undefined,
        });
        totalPoints += result.ecoPoints;
      }

      toast.success(`Pickup completed! You earned ${totalPoints} EcoPoints! 🎉`, {
        description: `${formData.estimatedWeight}kg of ${selectedMaterials.join(", ")} recycled`,
      });
      navigate("/dashboard");
    } catch (error) {
      toast.error("Failed to create pickup request");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg">
      <nav className="glass border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <span className="ml-4 text-xl font-bold">Request Pickup</span>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass border-white/20">
            <CardHeader>
              <CardTitle>Schedule a Pickup</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label className="mb-3 block">Material Types (Select one or more)</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {MATERIAL_OPTIONS.map((material) => (
                      <div
                        key={material.id}
                        className={`flex items-center space-x-2 p-3 rounded-lg border-2 transition-all cursor-pointer ${
                          selectedMaterials.includes(material.id)
                            ? "border-primary bg-primary/10"
                            : "border-white/20 glass-dark"
                        }`}
                        onClick={() => handleMaterialToggle(material.id)}
                      >
                        <Checkbox
                          id={material.id}
                          checked={selectedMaterials.includes(material.id)}
                          onCheckedChange={() => handleMaterialToggle(material.id)}
                        />
                        <Label
                          htmlFor={material.id}
                          className="flex-1 cursor-pointer font-medium"
                        >
                          {material.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="estimatedWeight">Total Estimated Weight (kg)</Label>
                  <Input
                    id="estimatedWeight"
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={formData.estimatedWeight}
                    onChange={(e) => setFormData({ ...formData, estimatedWeight: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="address">Pickup Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Enter your address"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Any special instructions..."
                    rows={3}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing Pickup...
                    </>
                  ) : (
                    "Submit Request"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}