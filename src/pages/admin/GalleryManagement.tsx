import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Upload, Image, Video, GripVertical } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface GalleryItem {
  id: string;
  title: string;
  description: string | null;
  category: string;
  media_type: string;
  media_url: string;
  thumbnail_url: string | null;
  display_order: number;
  is_active: boolean;
}

const categories = [
  { id: "clinic_tour", label: "Clinic Tour" },
  { id: "procedures", label: "Procedures" },
  { id: "team_in_action", label: "Team in Action" },
  { id: "facilities", label: "Facilities" },
];

const GalleryManagement = () => {
  const [media, setMedia] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "clinic_tour",
    media_type: "image",
    media_url: "",
    is_active: true,
  });

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("gallery_media")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      toast({ title: "Error", description: "Failed to fetch gallery media", variant: "destructive" });
    } else {
      setMedia(data || []);
    }
    setIsLoading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const isVideo = file.type.startsWith("video/");

    const { data, error } = await supabase.storage
      .from("gallery")
      .upload(fileName, file);

    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } else {
      const { data: { publicUrl } } = supabase.storage.from("gallery").getPublicUrl(fileName);
      setFormData(prev => ({
        ...prev,
        media_url: publicUrl,
        media_type: isVideo ? "video" : "image",
      }));
      toast({ title: "Upload successful", description: "File uploaded successfully" });
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.media_url) {
      toast({ title: "Error", description: "Please upload or enter a media URL", variant: "destructive" });
      return;
    }

    if (editingItem) {
      const { error } = await supabase
        .from("gallery_media")
        .update({
          title: formData.title,
          description: formData.description || null,
          category: formData.category,
          media_type: formData.media_type,
          media_url: formData.media_url,
          is_active: formData.is_active,
        })
        .eq("id", editingItem.id);

      if (error) {
        toast({ title: "Error", description: "Failed to update media", variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Media updated successfully" });
        fetchMedia();
        resetForm();
      }
    } else {
      const { error } = await supabase
        .from("gallery_media")
        .insert({
          title: formData.title,
          description: formData.description || null,
          category: formData.category,
          media_type: formData.media_type,
          media_url: formData.media_url,
          is_active: formData.is_active,
          display_order: media.length,
        });

      if (error) {
        toast({ title: "Error", description: "Failed to add media", variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Media added successfully" });
        fetchMedia();
        resetForm();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this media?")) return;

    const { error } = await supabase.from("gallery_media").delete().eq("id", id);

    if (error) {
      toast({ title: "Error", description: "Failed to delete media", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Media deleted successfully" });
      fetchMedia();
    }
  };

  const handleEdit = (item: GalleryItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || "",
      category: item.category,
      media_type: item.media_type,
      media_url: item.media_url,
      is_active: item.is_active,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      title: "",
      description: "",
      category: "clinic_tour",
      media_type: "image",
      media_url: "",
      is_active: true,
    });
    setIsDialogOpen(false);
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gallery Management</h1>
            <p className="text-muted-foreground">Manage clinic photos and videos</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) resetForm(); setIsDialogOpen(open); }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" /> Add Media
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingItem ? "Edit Media" : "Add New Media"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Upload Media</Label>
                  <div className="mt-2 border-2 border-dashed border-border rounded-lg p-4 text-center">
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {uploading ? "Uploading..." : "Click to upload image or video"}
                      </p>
                    </label>
                  </div>
                </div>

                <div>
                  <Label htmlFor="media_url">Or Enter URL</Label>
                  <Input
                    id="media_url"
                    value={formData.media_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, media_url: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>

                {formData.media_url && (
                  <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                    {formData.media_type === "video" ? (
                      <video src={formData.media_url} controls className="w-full h-full object-cover" />
                    ) : (
                      <img src={formData.media_url} alt="Preview" className="w-full h-full object-cover" />
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label>Active (visible on website)</Label>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    {editingItem ? "Update" : "Add"} Media
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : media.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Image className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No gallery media yet. Add your first photo or video.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {media.map((item) => (
              <Card key={item.id} className={`overflow-hidden ${!item.is_active ? "opacity-50" : ""}`}>
                <div className="aspect-video relative bg-muted">
                  {item.media_type === "video" ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Video className="w-12 h-12 text-muted-foreground" />
                    </div>
                  ) : (
                    <img src={item.media_url} alt={item.title} className="w-full h-full object-cover" />
                  )}
                  <div className="absolute top-2 left-2">
                    <span className="text-xs bg-black/60 text-white px-2 py-1 rounded">
                      {categories.find(c => c.id === item.category)?.label}
                    </span>
                  </div>
                </div>
                <CardContent className="p-3">
                  <h3 className="font-medium truncate">{item.title}</h3>
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(item)} className="flex-1">
                      <Pencil className="w-3 h-3 mr-1" /> Edit
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default GalleryManagement;
