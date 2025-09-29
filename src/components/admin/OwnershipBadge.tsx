import { Badge } from "@/components/ui/badge";
import { UserCheck, User, Shield, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface OwnershipBadgeProps {
  assignedTo?: string;
  assignedAdminName?: string;
  assignedAdminRole?: string;
  showIcon?: boolean;
  size?: 'sm' | 'default';
}

export const OwnershipBadge = ({ 
  assignedTo, 
  assignedAdminName, 
  assignedAdminRole,
  showIcon = true,
  size = 'default'
}: OwnershipBadgeProps) => {
  const { user } = useAuth();
  
  if (!assignedTo) {
    return (
      <Badge 
        variant="outline" 
        className={`bg-gray-50 text-gray-600 border-gray-200 ${size === 'sm' ? 'text-xs' : ''}`}
      >
        {showIcon && <User className={`${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} mr-1`} />}
        Unassigned
      </Badge>
    );
  }

  const isCurrentUser = assignedTo === user?.id;
  const isSuperAdmin = assignedAdminRole === 'super_admin';

  return (
    <Badge 
      variant="outline" 
      className={`${
        isCurrentUser 
          ? 'bg-green-50 text-green-700 border-green-200' 
          : 'bg-blue-50 text-blue-700 border-blue-200'
      } ${size === 'sm' ? 'text-xs' : ''}`}
    >
      {showIcon && (
        <>
          {isSuperAdmin ? (
            <Shield className={`${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} mr-1 text-amber-500`} />
          ) : (
            <UserCheck className={`${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} mr-1`} />
          )}
        </>
      )}
      {isCurrentUser ? 'You' : (assignedAdminName || 'Assigned')}
      {!isCurrentUser && assignedAdminName && (
        <Lock className={`${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} ml-1 opacity-60`} />
      )}
    </Badge>
  );
};