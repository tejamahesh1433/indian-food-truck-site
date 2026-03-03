import { useSite } from "@/components/SiteProvider";

export default function StickyCall() {
    const site = useSite();
    return (
        <div className="fixed bottom-5 left-0 right-0 z-50 px-4 md:hidden">
            <div className="mx-auto max-w-md rounded-full border border-white/10 bg-black/70 backdrop-blur px-3 py-3">
                <a
                    href={`tel:${site.contact.phoneE164}`}
                    className="block w-full text-center bg-orange-500 text-black font-semibold rounded-full py-3"
                >
                    Call the Truck
                </a>
            </div>
        </div>
    );
}
