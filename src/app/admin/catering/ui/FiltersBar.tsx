"use client";

export type FiltersState = {
    q: string;
    status: "ALL" | "NEW" | "CONTACTED" | "DONE";
    sort: "CREATED_DESC" | "CREATED_ASC" | "EVENT_ASC" | "GUESTS_DESC";
};

export default function FiltersBar({
    value,
    onChange,
    totalShown,
}: {
    value: FiltersState;
    onChange: (v: FiltersState) => void;
    totalShown: number;
}) {
    const hasActive =
        value.q.trim() !== "" || value.status !== "ALL" || value.sort !== "CREATED_DESC";

    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div className="flex flex-col gap-4 md:flex-row md:items-end flex-wrap">
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Search</label>
                        <input
                            className="w-full md:w-72 rounded-xl border border-white/10 bg-black/40 p-2.5 text-sm text-white placeholder:text-gray-600 focus:border-orange-500 outline-none transition"
                            placeholder="Name, email, phone, location..."
                            value={value.q}
                            onChange={(e) => onChange({ ...value, q: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Status</label>
                        <select
                            className="w-full md:w-40 rounded-xl border border-white/10 bg-black/40 p-2.5 text-sm text-white outline-none focus:border-orange-500 transition appearance-none cursor-pointer"
                            value={value.status}
                            onChange={(e) => onChange({ ...value, status: e.target.value as any })}
                        >
                            <option value="ALL">All Status</option>
                            <option value="NEW">New</option>
                            <option value="CONTACTED">Contacted</option>
                            <option value="DONE">Done</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Sort By</label>
                        <select
                            className="w-full md:w-48 rounded-xl border border-white/10 bg-black/40 p-2.5 text-sm text-white outline-none focus:border-orange-500 transition appearance-none cursor-pointer"
                            value={value.sort}
                            onChange={(e) => onChange({ ...value, sort: e.target.value as any })}
                        >
                            <option value="CREATED_DESC">Newest First</option>
                            <option value="CREATED_ASC">Oldest First</option>
                            <option value="EVENT_ASC">Event Date (Soonest)</option>
                            <option value="GUESTS_DESC">Guests (High to Low)</option>
                        </select>
                    </div>

                    {hasActive && (
                        <button
                            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/10 transition"
                            onClick={() =>
                                onChange({ q: "", status: "ALL", sort: "CREATED_DESC" })
                            }
                        >
                            Reset Focus
                        </button>
                    )}
                </div>

                <div className="text-sm font-medium text-gray-400 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                    Showing {totalShown} Result{totalShown === 1 ? "" : "s"}
                </div>
            </div>
        </div>
    );
}
