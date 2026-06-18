export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-clinic-bg flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-clinic-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 text-sm">Loading your dashboard…</p>
      </div>
    </div>
  );
}
