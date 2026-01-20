import { DownloadCategory, DownloadItem } from "@/app/(pages)/downloads/page";
import { StoreBadge } from "../StoreBadge";

interface DownloadCardProps {
  category: DownloadCategory;
}

export const DownloadCard = ({ category }: DownloadCardProps) => {
  return (
    <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
      <div className="mb-8">
        <div className="flex gap-4 mb-4 text-slate-400">{category.headerIcons}</div>
        <h3 className="text-2xl font-bold text-slate-900 mb-2">{category.title}</h3>
        <p className="text-slate-500 text-sm leading-relaxed">{category.description}</p>
      </div>

      <div className="space-y-4 mt-auto">
        {category.items.map((item) => (
          <DownloadButton key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};

interface DownloadButtonProps {
  item: DownloadItem;
}
export const DownloadButton = ({ item }: DownloadButtonProps) => {
  return (
    <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:border-slate-300 transition-all shadow-sm">
      <span className="font-semibold text-slate-800">{item.name}</span>
      <StoreBadge type={item.storeIconType} storeName={item.storeName} />
    </div>
  );
};
