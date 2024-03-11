export const FederalRegisterDocumentsSkeleton = () => {
  return (
    <div className="flex flex-col gap-2 pb-4 mb-4 overflow-y-scroll text-sm sm:flex-row">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="flex flex-col gap-2 p-2 text-left bg-zinc-900 rounded-lg cursor-pointer hover:bg-zinc-800 sm:w-52"
        >
          <div className="w-full h-4 bg-zinc-700 rounded-md animate-pulse"></div>
          <div className="w-2/3 h-3 bg-zinc-700 rounded-md animate-pulse"></div>
          <div className="w-1/2 h-3 bg-zinc-700 rounded-md animate-pulse"></div>
        </div>
      ))}
    </div>
  );
};
