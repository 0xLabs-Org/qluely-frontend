import React from "react";
import { Globe, Apple, Play, ShoppingBag, Cpu } from "lucide-react";

interface StoreBadgeProps {
  type: "microsoft" | "apple" | "snap" | "playstore" | "galaxy" | "firefox" | "chrome" | "opera";
  storeName: string;
  comingSoon?: boolean;
}

export const StoreBadge: React.FC<StoreBadgeProps> = ({ type, storeName, comingSoon }) => {
  const getIcon = () => {
    switch (type) {
      case "microsoft":
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M0 0v11.408h11.408V0H0zm12.592 0v11.408H24V0h-11.408zM0 12.592V24h11.408V12.592H0zm12.592 0V24H24V12.592h-11.408z" />
          </svg>
        );
      case "apple":
        return <Apple className="w-5 h-5 fill-current" />;
      case "snap":
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0L2.5 5.5v13L12 24l9.5-5.5v-13z" />
          </svg>
        );
      case "playstore":
        return <Play className="w-4 h-4 fill-current" />;
      case "galaxy":
        return <ShoppingBag className="w-5 h-5" />;
      case "firefox":
        return <Globe className="w-5 h-5" />;
      case "chrome":
        return <Globe className="w-5 h-5" />;
      case "opera":
        return <Cpu className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getLabel = () => {
    if (comingSoon) return "COMING SOON";
    if (type === "chrome" || type === "firefox" || type === "opera") return "GET THE";
    return "Get it from";
  };

  return (
    <div className="flex items-center bg-black text-white px-3 py-1.5 rounded-md min-w-[120px] transition-transform hover:scale-105 cursor-pointer">
      <div className="mr-2">{getIcon()}</div>
      <div className="flex flex-col items-start leading-none">
        <span className="text-[9px] font-medium uppercase opacity-80">{getLabel()}</span>
        {!comingSoon && <span className="text-xs font-bold whitespace-nowrap">{storeName}</span>}
      </div>
    </div>
  );
};
