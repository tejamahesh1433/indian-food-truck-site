/**
 * Minimal layout for transactional email verification pages.
 * This suppresses the global site footer, cart, and chat to keep
 * the user's focus on the verification result.
 */
export default function VerifyEmailLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
