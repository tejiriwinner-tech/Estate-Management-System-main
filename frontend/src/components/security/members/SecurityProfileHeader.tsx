import { Camera, User } from "lucide-react";
import { cn } from "@/lib/security/utils";

interface Props {
  coverImageUrl?: string;
  avatarUrl?: string;
  name: string;
  unitId: string;
  email?: string;
  showEmail?: boolean;
}

export default function SecurityProfileHeader({
  coverImageUrl,
  avatarUrl,
  name,
  unitId,
  email,
  showEmail = false,
}: Props) {
  return (
    <div className="bg-white rounded-xl border border-[--color-border] overflow-hidden">
      {/* Cover */}
      <div className="relative h-44 bg-gray-800 overflow-hidden">
        {coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverImageUrl}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900">
            <Camera className="w-10 h-10 text-gray-500" />
          </div>
        )}
      </div>

      {/* Avatar + info row */}
      <div className="flex items-end gap-4 px-6 pb-5 -mt-10">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="w-20 h-20 rounded-full border-4 border-white bg-[--color-primary-light] flex items-center justify-center overflow-hidden shadow-md">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-9 h-9 text-[--color-primary]" />
            )}
          </div>
        </div>

        {/* Name + ID */}
        <div className="pb-1">
          <p className="text-base font-bold text-[--color-primary]">{name}</p>
          <p className="text-xs text-[--color-text-muted]">{unitId}</p>
          {showEmail && email && (
            <p className="text-xs text-[--color-text-muted] mt-0.5">{email}</p>
          )}
        </div>

        {showEmail && email && (
          <div className="ml-6 pb-1 hidden sm:block">
            <p className="text-xs text-[--color-text-muted] uppercase font-semibold tracking-wide">Email</p>
            <p className="text-sm font-medium text-[--color-text]">{email}</p>
          </div>
        )}
      </div>
    </div>
  );
}
