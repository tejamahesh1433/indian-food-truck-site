import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Catering | Catch the Cravings",
    description: "Book Catch the Cravings for your next event. We cater for offices, birthdays, weddings, campus events and more.",
};

export default function CateringLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
