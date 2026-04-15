export default function AdminLoading() {
    return (
        <div className="mx-auto max-w-6xl px-6 py-12 animate-pulse">
            {/* Page title area */}
            <div className="mb-8 space-y-2">
                <div className="h-3 w-20 rounded bg-white/10" />
                <div className="h-8 w-56 rounded-lg bg-white/10" />
                <div className="h-3 w-40 rounded bg-white/5" />
            </div>

            {/* Card rows */}
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                    <div
                        key={i}
                        className="rounded-3xl border border-white/10 bg-white/5 p-8"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-2 flex-1">
                                <div className="h-5 w-32 rounded bg-white/10" />
                                <div className="h-3 w-64 rounded bg-white/5" />
                            </div>
                            <div className="h-8 w-20 rounded-full bg-white/10 shrink-0" />
                        </div>
                        <div className="mt-6 space-y-2">
                            <div className="h-3 w-full rounded bg-white/5" />
                            <div className="h-3 w-4/5 rounded bg-white/5" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
