"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface FAQItem {
    question: string;
    answer: React.ReactNode;
}

const FAQ_DATA: { category: string; items: FAQItem[] }[] = [
    {
        category: "General",
        items: [
            {
                question: "Where can I find the food truck?",
                answer: (
                    <p>
                        We update our location daily! You can find our current stop on the <Link href="/" className="text-orange-500 hover:underline">Home Page</Link> or by clicking the location link in the navigation menu.
                    </p>
                )
            },
            {
                question: "Do you accept cash?",
                answer: (
                    <p>
                        Yes, we accept cash at the truck! We also take all major credit cards, Apple Pay, and Google Pay for your convenience.
                    </p>
                )
            },
            {
                question: "Do you offer delivery?",
                answer: (
                    <p>
                        Currently, we focus on on-site service and pre-orders for pickup. For large events or office lunches, please check our <Link href="/catering" className="text-orange-500 hover:underline">Catering</Link> options.
                    </p>
                )
            }
        ]
    },
    {
        category: "Menu & Dietary",
        items: [
            {
                question: "What are your vegetarian options?",
                answer: (
                    <p>
                        We love our vegetarian customers! Many of our most popular dishes like Paneer Tikka Wraps and Veggie Samosas are 100% vegetarian. Look for the &quot;VEG&quot; badge on our <Link href="/menu" className="text-orange-500 hover:underline">Menu</Link>.
                    </p>
                )
            },
            {
                question: "Is your food very spicy?",
                answer: (
                    <p>
                        We cater to all palates! While some traditional dishes have a kick, most can be adjusted to your preference. Items marked with a &quot;Spicy&quot; tag are for those who enjoy a bit more heat.
                    </p>
                )
            }
        ]
    },
    {
        category: "Orders & Support",
        items: [
            {
                question: "How do I cancel an order?",
                answer: (
                    <p>
                        For immediate cancellations, please call the truck directly at the number provided in your order confirmation. Please note that orders already being prepared cannot be cancelled.
                    </p>
                )
            },
            {
                question: "Do you cater for special events?",
                answer: (
                    <p>
                        Absolutely! From weddings and birthdays to corporate events, we bring the flavor to you. Head over to our <Link href="/catering" className="text-orange-500 hover:underline">Catering</Link> page to request a custom quote.
                    </p>
                )
            }
        ]
    }
];

function AccordionItem({ item, isOpen, onClick }: { item: FAQItem; isOpen: boolean; onClick: () => void }) {
    return (
        <div className="border-b border-white/10 last:border-0">
            <button
                onClick={onClick}
                className="w-full py-6 flex items-center justify-between text-left group"
            >
                <span className={`text-lg font-semibold transition-colors ${isOpen ? "text-orange-500" : "text-gray-200 group-hover:text-white"}`}>
                    {item.question}
                </span>
                <span className={`ml-4 flex-shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180 text-orange-500" : "text-gray-500"}`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </span>
            </button>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="pb-6 text-gray-400 leading-relaxed">
                            {item.answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function FaqClient() {
    const [openIndex, setOpenIndex] = useState<string | null>("0-0");

    return (
        <>
            <div className="space-y-12">
                {FAQ_DATA.map((section, sIdx) => (
                    <div key={section.category} className="space-y-2">
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-orange-500/60 mb-6">
                            {section.category}
                        </h2>
                        <div className="bg-white/[0.03] border border-white/5 rounded-3xl px-8 overflow-hidden">
                            {section.items.map((item, iIdx) => {
                                const id = `${sIdx}-${iIdx}`;
                                return (
                                    <AccordionItem
                                        key={item.question}
                                        item={item}
                                        isOpen={openIndex === id}
                                        onClick={() => setOpenIndex(openIndex === id ? null : id)}
                                    />
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-20 p-10 rounded-3xl bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20 text-center">
                <h3 className="text-2xl font-bold mb-4">Still have questions?</h3>
                <p className="text-gray-400 mb-8 max-w-lg mx-auto">
                    Our team is here to help! Send us a message through our live chat and we&apos;ll get back to you as soon as possible.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                        onClick={() => {
                            const btn = document.querySelector('[layoutid="support-btn"]') as HTMLButtonElement;
                            btn?.click();
                        }}
                        className="bg-orange-500 text-black px-8 py-4 rounded-full font-bold hover:bg-orange-400 transition shadow-xl shadow-orange-500/20"
                    >
                        Start Live Chat
                    </button>
                    <Link
                        href="/menu"
                        className="px-8 py-4 rounded-full border border-white/10 hover:bg-white/5 transition font-bold"
                    >
                        View Menu
                    </Link>
                </div>
            </div>
        </>
    );
}
