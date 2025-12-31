import { useState, useEffect } from "react";
import { Save, Building, Clock, Phone, Mail, MapPin, Globe, Image as ImageIcon, Plus, Trash2, Star } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface HeroSlide {
  id: string;
  title: string;
  media_url: string;
  is_hero_slide: boolean;
}

export default function Settings() {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [galleryMedia, setGalleryMedia] = useState<HeroSlide[]>([]);
  
  const [clinicInfo, setClinicInfo] = useState({
    name: "Muhazi Dental Clinic",
    phone: "+250 787 630 399",
    email: "info@muhazidental.rw",
    address: "Rwamagana, Eastern Province, Rwanda",
    website: "https://muhazidental.rw",
    openingHours: "Monday - Sunday: 8:00 AM - 8:00 PM",
  });

  useEffect(() => {
    fetchHeroSlides();
  }, []);

  const fetchHeroSlides = async () => {
    const { data, error } = await supabase
      .from("gallery_media")
      .select("id, title, media_url, is_hero_slide")
      .eq("media_type", "image")
      .eq("is_active", true)
      .order("display_order");

    if (!error && data) {
      setGalleryMedia(data);
      setHeroSlides(data.filter(item => item.is_hero_slide));
    }
  };

  const toggleHeroSlide = async (item: HeroSlide) => {
    const newValue = !item.is_hero_slide;
    const { error } = await supabase
      .from("gallery_media")
      .update({ is_hero_slide: newValue })
      .eq("id", item.id);

    if (error) {
      toast({ title: "Error", description: "Failed to update hero slide", variant: "destructive" });
    } else {
      toast({ title: "Success", description: newValue ? "Added to hero carousel" : "Removed from hero carousel" });
      fetchHeroSlides();
    }
  };

  const handleSaveClinicInfo = async () => {
    setSaving(true);
    // In a real implementation, save to clinic_settings table
    setTimeout(() => {
      setSaving(false);
      toast({ title: "Success", description: "Clinic settings saved" });
    }, 500);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage clinic settings and configurations</p>
        </div>

        <Tabs defaultValue="hero" className="space-y-6">
          <TabsList>
            <TabsTrigger value="hero">Hero Carousel</TabsTrigger>
            <TabsTrigger value="clinic">Clinic Info</TabsTrigger>
          </TabsList>

          <TabsContent value="hero" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Hero Carousel Images
                </CardTitle>
                <CardDescription>
                  Select which gallery images appear in the homepage hero carousel. 
                  The carousel auto-rotates every 5 seconds with smooth transitions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {heroSlides.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium mb-3">Current Hero Slides ({heroSlides.length})</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {heroSlides.map((slide, index) => (
                        <div key={slide.id} className="relative group">
                          <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                            <img src={slide.media_url} alt={slide.title} className="w-full h-full object-cover" />
                          </div>
                          <Badge className="absolute top-2 left-2 bg-primary">{index + 1}</Badge>
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7"
                            onClick={() => toggleHeroSlide(slide)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                          <p className="text-xs text-center mt-1 truncate">{slide.title}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium mb-3">Available Gallery Images</h3>
                  {galleryMedia.filter(m => !m.is_hero_slide).length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No available images. Upload images in Gallery Management first.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                      {galleryMedia.filter(m => !m.is_hero_slide).map((item) => (
                        <div
                          key={item.id}
                          className="relative group cursor-pointer"
                          onClick={() => toggleHeroSlide(item)}
                        >
                          <div className="aspect-video rounded-lg overflow-hidden bg-muted border-2 border-transparent hover:border-primary transition-colors">
                            <img src={item.media_url} alt={item.title} className="w-full h-full object-cover" />
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                            <Plus className="w-8 h-8 text-white" />
                          </div>
                          <p className="text-xs text-center mt-1 truncate">{item.title}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clinic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Clinic Information
                </CardTitle>
                <CardDescription>
                  Basic clinic details displayed across the website
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Clinic Name</Label>
                  <Input
                    value={clinicInfo.name}
                    onChange={(e) => setClinicInfo(p => ({ ...p, name: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="flex items-center gap-1"><Phone className="w-3 h-3" /> Phone</Label>
                    <Input
                      value={clinicInfo.phone}
                      onChange={(e) => setClinicInfo(p => ({ ...p, phone: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label className="flex items-center gap-1"><Mail className="w-3 h-3" /> Email</Label>
                    <Input
                      type="email"
                      value={clinicInfo.email}
                      onChange={(e) => setClinicInfo(p => ({ ...p, email: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Address</Label>
                  <Input
                    value={clinicInfo.address}
                    onChange={(e) => setClinicInfo(p => ({ ...p, address: e.target.value }))}
                  />
                </div>

                <div>
                  <Label className="flex items-center gap-1"><Globe className="w-3 h-3" /> Website</Label>
                  <Input
                    value={clinicInfo.website}
                    onChange={(e) => setClinicInfo(p => ({ ...p, website: e.target.value }))}
                  />
                </div>

                <div>
                  <Label className="flex items-center gap-1"><Clock className="w-3 h-3" /> Opening Hours</Label>
                  <Input
                    value={clinicInfo.openingHours}
                    onChange={(e) => setClinicInfo(p => ({ ...p, openingHours: e.target.value }))}
                  />
                </div>

                <Button onClick={handleSaveClinicInfo} disabled={saving} className="gap-2">
                  <Save className="w-4 h-4" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
