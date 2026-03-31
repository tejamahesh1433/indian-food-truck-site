import Link from "next/link";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
    baseUrl: string;
}

export default function Pagination({ currentPage, totalPages, totalCount, pageSize, baseUrl }: PaginationProps) {
    if (totalPages <= 1) return null;

    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, totalCount);

    // Helper to generate page numbers with ellipses
    const getPageNumbers = () => {
        const pages = [];
        const delta = 2; // Number of pages to show on either side of current

        for (let i = 1; i <= totalPages; i++) {
            if (
                i === 1 || 
                i === totalPages || 
                (i >= currentPage - delta && i <= currentPage + delta)
            ) {
                pages.push(i);
            } else if (pages[pages.length - 1] !== "...") {
                pages.push("...");
            }
        }
        return pages;
    };

    return (
        <div className="mt-12 flex flex-col items-center gap-6">
            <div className="text-xs uppercase tracking-widest font-black text-gray-500 italic">
                Showing <span className="text-orange-500">{start}</span>–<span className="text-orange-500">{end}</span> of <span className="text-white">{totalCount}</span> historical orders
            </div>

            <div className="flex items-center gap-2">
                {/* Previous Button */}
                <Link
                    href={`${baseUrl}?page=${currentPage - 1}`}
                    className={`h-10 w-10 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 transition hover:bg-white/10 ${currentPage <= 1 ? "pointer-events-none opacity-20" : ""}`}
                    aria-label="Previous Page"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                    </svg>
                </Link>

                {/* Page Numbers */}
                <div className="flex items-center gap-1.5 px-2">
                    {getPageNumbers().map((p, i) => (
                        p === "..." ? (
                            <span key={`ellipsis-${i}`} className="px-2 text-gray-600 font-black">...</span>
                        ) : (
                            <Link
                                key={`page-${p}`}
                                href={`${baseUrl}?page=${p}`}
                                className={`h-10 min-w-[40px] px-3 flex items-center justify-center rounded-xl border font-black text-xs transition ${
                                    p === currentPage
                                        ? "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20 px-4"
                                        : "border-white/10 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                                }`}
                            >
                                {p}
                            </Link>
                        )
                    ))}
                </div>

                {/* Next Button */}
                <Link
                    href={`${baseUrl}?page=${currentPage + 1}`}
                    className={`h-10 w-10 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 transition hover:bg-white/10 ${currentPage >= totalPages ? "pointer-events-none opacity-20" : ""}`}
                    aria-label="Next Page"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                    </svg>
                </Link>
            </div>
        </div>
    );
}
