import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import TodaysSpecial from "@/components/TodaysSpecial";
import Location from "@/components/Location";
import InstagramGrid from "@/components/InstagramGrid";
import ReviewsSection from "@/components/ReviewsSection";

export default function Home() {
  return (
    <main className="bg-black text-white">
      <Navbar />
      <Hero />
      <TodaysSpecial />
      <Location />
      <ReviewsSection />
      <InstagramGrid />
    </main>
  );
}
