"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

export default function Reveal({
    children,
    delay = 0,
}: {
    children: ReactNode;
    delay?: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, delay }}
        >
            {children}
        </motion.div>
    );
}
