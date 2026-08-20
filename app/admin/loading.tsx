export default function AdminLoading() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6" aria-busy="true" aria-label="Loading bookings">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {Array.from({ length: 5 }, (_, index) => <div key={index} className="h-28 animate-pulse rounded-2xl bg-white shadow-sm" />)}
        </div>
        <div className="h-24 animate-pulse rounded-2xl bg-white shadow-sm" />
        <div className="h-96 animate-pulse rounded-[2rem] bg-white shadow-sm" />
      </div>
    </main>
  );
}
