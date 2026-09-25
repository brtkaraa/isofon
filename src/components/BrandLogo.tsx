type Props = {
  compact?: boolean;
};

export default function BrandLogo({ compact = false }: Props) {
  return (
    <div className={`flex items-center gap-2 ${compact ? '' : 'flex-col'}`}>
      <div className={`flex items-center justify-center rounded-lg bg-[#ed1c24] ${compact ? 'h-9 w-9' : 'h-14 w-14'}`}>
        <span className={`font-extrabold leading-none text-white ${compact ? 'text-lg' : 'text-2xl'}`}>İ</span>
      </div>
      <div className={compact ? 'flex items-baseline' : 'flex flex-col items-center'}>
        <span className={`font-extrabold tracking-tight text-[#181818] dark:text-gray-100 ${compact ? 'text-lg' : 'text-3xl'}`}>
          İSO<span className="text-[#ed1c24]">FON</span>
        </span>
        {!compact && (
          <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-gray-400 mt-0.5">
            Yenilikçi Çözümler
          </span>
        )}
      </div>
    </div>
  );
}
