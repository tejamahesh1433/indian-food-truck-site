"use client";

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const SPICE_TYPES = [
    { label: '🌶️', size: 10, speed: 0.5 }, // chili (rare)
    { label: '•', size: 4, speed: 1.2 },    // mustard seed
    { label: '●', size: 6, speed: 0.8 },    // peppercorn
    { label: '*', size: 8, speed: 0.6 },    // star anise fragment
];

export default function SpiceParticles() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        const particles: HTMLDivElement[] = [];
        const count = 60;

        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            const type = SPICE_TYPES[Math.floor(Math.random() * SPICE_TYPES.length)];
            
            particle.innerHTML = type.label;
            particle.className = 'absolute pointer-events-none select-none opacity-60 text-orange-400';
            particle.style.fontSize = `${type.size * 1.5}px`;
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            particle.style.filter = 'blur(0.5px)';
            
            container.appendChild(particle);
            particles.push(particle);

            // Initial random movement
            gsap.to(particle, {
                x: `random(-200, 200)`,
                y: `random(-200, 200)`,
                rotation: `random(-720, 720)`,
                duration: `random(15, 30)`,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
        }

        const handleMouseMove = (e: MouseEvent) => {
            particles.forEach((p, i) => {
                const dx = e.clientX - (p.offsetLeft + container.offsetLeft);
                const dy = e.clientY - (p.offsetTop + container.offsetTop);
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 200) {
                    gsap.to(p, {
                        x: `+=${dx * 0.1}`,
                        y: `+=${dy * 0.1}`,
                        duration: 0.6,
                        ease: "power2.out"
                    });
                }
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            particles.forEach(p => p.remove());
        };
    }, []);

    return (
        <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-40" />
    );
}
