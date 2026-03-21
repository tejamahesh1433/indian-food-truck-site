import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import SignatureDishes from "@/components/SignatureDishes";
import Location from "@/components/Location";
import InstagramGrid from "@/components/InstagramGrid";
import ReviewsSection from "@/components/ReviewsSection";

export default function Home() {
  return (
    <main className="bg-black text-white">
      <Navbar />
      <Hero />
      <SignatureDishes />
      <Location />
      <ReviewsSection />
      <InstagramGrid />
    </main>
  );
}
