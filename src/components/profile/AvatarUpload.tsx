
import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, Loader2 } from "lucide-react";
import { uploadProfileImage } from "@/services/fileStorageService";
import { useToast } from "@/hooks/use-toast";

interface AvatarUploadProps {
  photoURL?: string;
  displayName?: string;
  initials: string;
  userId: string;
  onImageUploaded: (imageUrl: string) => void;
}

export function AvatarUpload({ photoURL, displayName, initials, userId, onImageUploaded }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      
      const downloadUrl = await uploadProfileImage(userId, file, (progress) => {
        console.log(`Upload progress: ${progress}%`);
      });
      
      onImageUploaded(downloadUrl);
      
      toast({
        title: "Profile picture updated",
        description: "Your profile picture has been updated successfully",
      });
    } catch (error) {
      console.error("Error uploading profile image:", error);
      toast({
        title: "Upload failed",
        description: "There was a problem uploading your profile picture",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="relative group">
      <Avatar className="h-20 w-20 border-2 border-primary/10">
        <AvatarImage src={photoURL || ""} alt={displayName} className="object-cover" />
        <AvatarFallback className="bg-primary text-primary-foreground text-xl">
          {initials}
        </AvatarFallback>
      </Avatar>
      
      <Button
        size="icon"
        variant="outline"
        className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-background shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={triggerFileSelect}
        disabled={isUploading}
      >
        {isUploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Camera className="h-4 w-4" />
        )}
      </Button>
      
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileSelect}
      />
    </div>
  );
}
