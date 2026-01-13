
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Settings, User, Edit } from "lucide-react";
import { Link } from "react-router-dom";

interface ProfileHeaderProps {
  displayName: string | null | undefined;
  photoURL: string | null | undefined;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ displayName, photoURL }) => {
  const { currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const userInitials = displayName ? getInitials(displayName) : "VA";

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16 border-2 border-gray-100">
            <AvatarImage src={photoURL || ""} alt={displayName || "User"} />
            <AvatarFallback className="bg-navy text-white text-lg">{userInitials}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-semibold text-navy">{displayName}</h2>
            <p className="text-gray-500">{currentUser?.email}</p>
          </div>
        </div>
        <Link to="/profile/edit">
          <Button className="w-full sm:w-auto bg-navy hover:bg-navy-light gap-2">
            <Edit className="h-4 w-4" />
            Edit Profile
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ProfileHeader;
