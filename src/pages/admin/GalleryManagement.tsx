import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, Upload, Image, Video, Eye, X, Play } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  { id: "all", label: "All Media" },
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
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [previewItem, setPreviewItem] = useState<GalleryItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<GalleryItem | null>(null);
  const [isDragging, setIsDragging] = useState(false);
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

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const isVideo = file.type.startsWith("video/");

    const { error } = await supabase.storage
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
        title: prev.title || file.name.replace(/\.[^/.]+$/, ""),
      }));
      toast({ title: "Upload successful", description: "File uploaded successfully" });
    }
    setUploading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type.startsWith("image/") || file.type.startsWith("video/"))) {
      handleFileUpload(file);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.media_url) {
      toast({ title: "Error", description: "Please upload or enter a media URL", variant: "destructive" });
      return;
    }

    if (!formData.title.trim()) {
      toast({ title: "Error", description: "Please enter a title", variant: "destructive" });
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
        toast({ title: "Success", description: "Media added to gallery" });
        fetchMedia();
        resetForm();
      }
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;

    const { error } = await supabase.from("gallery_media").delete().eq("id", deleteItem.id);

    if (error) {
      toast({ title: "Error", description: "Failed to delete media", variant: "destructive" });
    } else {
      toast({ title: "Deleted", description: "Media removed from gallery" });
      fetchMedia();
    }
    setDeleteItem(null);
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

  const toggleActive = async (item: GalleryItem) => {
    const { error } = await supabase
      .from("gallery_media")
      .update({ is_active: !item.is_active })
      .eq("id", item.id);

    if (error) {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    } else {
      fetchMedia();
    }
  };

  const filteredMedia = selectedCategory === "all" 
    ? media 
    : media.filter(item => item.category === selectedCategory);

  const imageCount = media.filter(m => m.media_type === "image").length;
  const videoCount = media.filter(m => m.media_type === "video").length;

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gallery Management</h1>
            <p className="text-muted-foreground">
              {imageCount} images • {videoCount} videos
            </p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Add Media
          </Button>
        </div>

        {/* Category Filter Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="flex-wrap h-auto gap-1">
            {categories.map(cat => (
              <TabsTrigger key={cat.id} value={cat.id} className="text-sm">
                {cat.label}
                {cat.id !== "all" && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {media.filter(m => m.category === cat.id).length}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Media Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-square bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : filteredMedia.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Image className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-medium mb-2">No media found</h3>
              <p className="text-muted-foreground mb-4">
                {selectedCategory === "all" 
                  ? "Start by adding your first photo or video" 
                  : "No media in this category"}
              </p>
              <Button onClick={() => setIsDialogOpen(true)} variant="outline" className="gap-2">
                <Plus className="w-4 h-4" /> Add Media
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredMedia.map((item) => (
              <Card 
                key={item.id} 
                className={`group overflow-hidden cursor-pointer transition-all hover:ring-2 hover:ring-primary/50 ${!item.is_active ? "opacity-60" : ""}`}
              >
                <div 
                  className="aspect-square relative bg-muted"
                  onClick={() => setPreviewItem(item)}
                >
                  {item.media_type === "video" ? (
                    <>
                      <video 
                        src={item.media_url} 
                        className="w-full h-full object-cover"
                        muted
                        preload="metadata"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                          <Play className="w-6 h-6 text-foreground ml-1" />
                        </div>
                      </div>
                    </>
                  ) : (
                    <img src={item.media_url} alt={item.title} className="w-full h-full object-cover" />
                  )}
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Eye className="w-8 h-8 text-white" />
                  </div>
                  
                  {/* Status badge */}
                  {!item.is_active && (
                    <Badge variant="secondary" className="absolute top-2 left-2 text-xs">
                      Hidden
                    </Badge>
                  )}
                  
                  {/* Type indicator */}
                  <div className="absolute bottom-2 left-2">
                    <Badge variant="secondary" className="text-xs bg-black/60 text-white border-0">
                      {item.media_type === "video" ? <Video className="w-3 h-3" /> : <Image className="w-3 h-3" />}
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-3 space-y-2">
                  <p className="font-medium text-sm truncate">{item.title}</p>
                  <div className="flex gap-1">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="flex-1 h-8"
                      onClick={(e) => { e.stopPropagation(); handleEdit(item); }}
                    >
                      <Pencil className="w-3 h-3 mr-1" /> Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-8 text-destructive hover:text-destructive"
                      onClick={(e) => { e.stopPropagation(); setDeleteItem(item); }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) resetForm(); setIsDialogOpen(open); }}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit Media" : "Add New Media"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Drag & Drop Upload Area */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  isDragging ? "border-primary bg-primary/5" : "border-border"
                } ${formData.media_url ? "pb-4" : ""}`}
              >
                {formData.media_url ? (
                  <div className="space-y-3">
                    <div className="aspect-video rounded-lg overflow-hidden bg-muted relative">
                      {formData.media_type === "video" ? (
                        <video src={formData.media_url} controls className="w-full h-full object-contain" />
                      ) : (
                        <img src={formData.media_url} alt="Preview" className="w-full h-full object-contain" />
                      )}
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        className="absolute top-2 right-2"
                        onClick={() => setFormData(prev => ({ ...prev, media_url: "", media_type: "image" }))}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <label htmlFor="file-upload" className="cursor-pointer text-sm text-primary hover:underline">
                      Replace file
                    </label>
                  </div>
                ) : (
                  <label htmlFor="file-upload" className="cursor-pointer block">
                    <Upload className={`w-10 h-10 mx-auto mb-3 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
                    <p className="text-sm font-medium mb-1">
                      {uploading ? "Uploading..." : "Drop file here or click to upload"}
                    </p>
                    <p className="text-xs text-muted-foreground">Supports images and videos</p>
                  </label>
                )}
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleInputChange}
                  className="hidden"
                  id="file-upload"
                  disabled={uploading}
                />
              </div>

              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter a title for this media"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description"
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
                    {categories.filter(c => c.id !== "all").map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <Label>Show on website</Label>
                  <p className="text-xs text-muted-foreground">Make visible to visitors</p>
                </div>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={uploading || !formData.media_url}>
                  {editingItem ? "Save Changes" : "Add to Gallery"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Preview Dialog */}
        <Dialog open={!!previewItem} onOpenChange={() => setPreviewItem(null)}>
          <DialogContent className="max-w-4xl p-0 overflow-hidden">
            {previewItem && (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white"
                  onClick={() => setPreviewItem(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
                {previewItem.media_type === "video" ? (
                  <video 
                    src={previewItem.media_url} 
                    controls 
                    autoPlay
                    className="w-full max-h-[80vh]"
                  />
                ) : (
                  <img 
                    src={previewItem.media_url} 
                    alt={previewItem.title} 
                    className="w-full max-h-[80vh] object-contain bg-black"
                  />
                )}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <h3 className="text-white font-medium">{previewItem.title}</h3>
                  {previewItem.description && (
                    <p className="text-white/70 text-sm mt-1">{previewItem.description}</p>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this media?</AlertDialogTitle>
              <AlertDialogDescription>
                "{deleteItem?.title}" will be permanently removed from the gallery. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
};

export default GalleryManagement;
