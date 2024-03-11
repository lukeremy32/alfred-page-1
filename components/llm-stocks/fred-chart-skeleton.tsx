export const FredChartSkeleton = () => {
  return (
    <div className="p-4 border rounded-xl bg-zinc-950 text-green-400 border-zinc-900">
      <div className="text-lg mb-1 text-transparent bg-zinc-700 rounded-md w-fit">
        xxxx
      </div>
      <div className="text-3xl font-bold text-transparent bg-zinc-700 rounded-md w-fit">
        xxxx
      </div>
      <div className="mt-1 text-xs text-transparent bg-zinc-700 rounded-md w-fit">
        xxxxxx xxx xx xxxx xx xxx
      </div>

      <div className="relative -mx-4 cursor-crosshair">
        <div style={{ height: 150 }}></div>
      </div>
    </div>
  );
};
