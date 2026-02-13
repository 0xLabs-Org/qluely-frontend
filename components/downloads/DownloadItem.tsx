import { DownloadCategory, DownloadItem } from "@/app/(pages)/downloads/page";
import { StoreBadge } from "../StoreBadge";

interface DownloadCardProps {
  category: DownloadCategory;
}

export const DownloadCard = ({ category }: DownloadCardProps) => {
  return (
    <div className="group relative bg-white/70 backdrop-blur-2xl border border-white/50 rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/50 to-blue-50/30 pointer-events-none" />

      <div className="relative z-10 flex flex-col h-full">
        <div className="mb-10">
          <div className="flex gap-4 mb-6 text-blue-600/80 bg-blue-50/50 w-fit p-3 rounded-2xl backdrop-blur-sm">
            {category.headerIcons}
          </div>
          <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
            {category.title}
          </h3>
          <p className="text-slate-500 text-lg leading-relaxed max-w-md">
            {category.description}
          </p>
        </div>

        <div className="space-y-4 mt-auto">
          {category.items.map((item) => (
            <DownloadButton key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
};

interface DownloadButtonProps {
  item: DownloadItem;
}
export const DownloadButton = ({ item }: DownloadButtonProps) => {
  return (
    <a
      href={item.comingSoon ? undefined : item.href}
      className={`group/btn flex items-center justify-between p-4 bg-white/60 border border-slate-200/60 rounded-2xl transition-all duration-300 shadow-sm ${item.comingSoon
          ? "cursor-not-allowed opacity-70 grayscale"
          : "hover:border-purple-300/50 hover:bg-white hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-xl hover:shadow-purple-900/10 cursor-pointer"
        }`}
    >
      <div className="flex items-center gap-5">
        <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-50 group-hover/btn:bg-gradient-to-br from-blue-50 to-purple-50 transition-all duration-300 text-slate-600 group-hover/btn:text-blue-600">
          {item.icon}
        </div>
        <span className="font-semibold text-slate-700 text-lg group-hover/btn:text-slate-900 transition-colors">
          {item.name}
        </span>
      </div>
      <div className="transform transition-transform duration-300 group-hover/btn:scale-110 group-hover/btn:rotate-1">
        <StoreBadge type={item.storeIconType} storeName={item.storeName} comingSoon={item.comingSoon} />
      </div>
    </a>
  );
};
