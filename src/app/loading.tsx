export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="skeleton h-10 w-64 rounded-lg" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="skeleton h-44 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
