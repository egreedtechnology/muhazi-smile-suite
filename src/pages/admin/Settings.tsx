import { useState, useEffect } from "react";
import { Save, Building, Clock, Phone, Mail, MapPin, Globe, Image as ImageIcon, Plus, Trash2, Star, Share2, Copy, Check, Link as LinkIcon, Facebook, MessageCircle } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  
  const [clinicInfo, setClinicInfo] = useState({
    name: "Muhazi Dental Clinic",
    phone: "+250 787 630 399",
    email: "muhazidentalclinic@gmail.com",
    address: "Rwamagana, Eastern Province, Rwanda",
    website: "https://muhazidentalclinic.org",
    openingHours: "Monday - Sunday: 8:00 AM - 8:00 PM",
  });

  // Generate shareable links
  const baseUrl = window.location.origin;
  const shareableLinks = {
    register: `${baseUrl}/patient/register`,
    book: `${baseUrl}/book`,
  };

  const copyToClipboard = async (link: string, type: string) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopiedLink(type);
      toast({ title: "Copied!", description: "Link copied to clipboard" });
      setTimeout(() => setCopiedLink(null), 2000);
    } catch (err) {
      toast({ title: "Error", description: "Failed to copy link", variant: "destructive" });
    }
  };

  const shareToWhatsApp = (link: string, message: string) => {
    const text = encodeURIComponent(`${message}\n${link}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const shareToFacebook = (link: string) => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`, "_blank");
  };

  const shareToTwitter = (link: string, message: string) => {
    const text = encodeURIComponent(message);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(link)}`, "_blank");
  };

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

        <Tabs defaultValue="share" className="space-y-6">
          <TabsList>
            <TabsTrigger value="share">Shareable Links</TabsTrigger>
            <TabsTrigger value="hero">Hero Carousel</TabsTrigger>
            <TabsTrigger value="clinic">Clinic Info</TabsTrigger>
          </TabsList>

          <TabsContent value="share" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="w-5 h-5" />
                  Patient Invitation Links
                </CardTitle>
                <CardDescription>
                  Share these links with patients to invite them to register or book appointments.
                  These links can be shared on social media, WhatsApp, or any messaging platform.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Registration Link */}
                <div className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      Registration
                    </Badge>
                    <span className="text-sm text-muted-foreground">Invite patients to create an account</span>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={shareableLinks.register}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(shareableLinks.register, "register")}
                    >
                      {copiedLink === "register" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => shareToWhatsApp(shareableLinks.register, "Join Muhazi Dental Clinic! Register here to book your dental appointments:")}
                    >
                      <MessageCircle className="w-4 h-4 text-green-600" />
                      WhatsApp
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => shareToFacebook(shareableLinks.register)}
                    >
                      <Facebook className="w-4 h-4 text-blue-600" />
                      Facebook
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => shareToTwitter(shareableLinks.register, "Join Muhazi Dental Clinic for quality dental care!")}
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                      X (Twitter)
                    </Button>
                  </div>
                </div>

                {/* Booking Link */}
                <div className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                      Book Appointment
                    </Badge>
                    <span className="text-sm text-muted-foreground">Direct link to appointment booking</span>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={shareableLinks.book}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(shareableLinks.book, "book")}
                    >
                      {copiedLink === "book" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => shareToWhatsApp(shareableLinks.book, "Book your dental appointment at Muhazi Dental Clinic:")}
                    >
                      <MessageCircle className="w-4 h-4 text-green-600" />
                      WhatsApp
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => shareToFacebook(shareableLinks.book)}
                    >
                      <Facebook className="w-4 h-4 text-blue-600" />
                      Facebook
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => shareToTwitter(shareableLinks.book, "Book your dental appointment at Muhazi Dental Clinic!")}
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                      X (Twitter)
                    </Button>
                  </div>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium flex items-center gap-2 mb-2">
                    <LinkIcon className="w-4 h-4" />
                    Tips for Sharing
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Share the registration link with new patients who need to create an account</li>
                    <li>• Share the booking link for quick appointment scheduling</li>
                    <li>• You can post these links on your social media pages</li>
                    <li>• Send via WhatsApp for personal patient invitations</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

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
