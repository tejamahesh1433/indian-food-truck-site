export default function Loading() {
    return (
        <main className="min-h-screen bg-black text-white flex items-center justify-center">
            <div className="card px-8 py-6 flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                <div className="text-gray-300">Loading…</div>
            </div>
        </main>
    );
}
