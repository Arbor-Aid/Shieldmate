import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Testimonial = {
  name: string;
  role: string;
  quote: string;
  image: string;
};

const defaultTestimonials: Testimonial[] = [
  {
    name: "Samira Hill",
    role: "Veteran Advocate",
    quote:
      "ShieldMate made our support pipeline feel human again. Every case gets eyes, context, and accountability.",
    image:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "Marcus Lee",
    role: "Program Lead",
    quote:
      "Our team finally has a shared system of record and a faster way to route veteran requests.",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "Ariana Brooks",
    role: "Community Partner",
    quote:
      "It’s the first platform that respects how a nonprofit actually operates—secure, fast, and clear.",
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=800&auto=format&fit=crop",
  },
];

export function AnimatedTestimonials({
  testimonials = defaultTestimonials,
  intervalMs = 5000,
}: {
  testimonials?: Testimonial[];
  intervalMs?: number;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % testimonials.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, testimonials.length]);

  const active = testimonials[index];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={active.name}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.4 }}
          className="grid gap-6 md:grid-cols-[140px_1fr]"
        >
          <div className="flex items-center justify-center">
            <img
              src={active.image}
              alt={active.name}
              className="h-28 w-28 rounded-full object-cover shadow-md"
            />
          </div>
          <div>
            <p className="text-lg font-medium text-foreground">{active.quote}</p>
            <div className="mt-4">
              <p className="text-sm font-semibold">{active.name}</p>
              <p className="text-xs text-muted-foreground">{active.role}</p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="mt-6 flex gap-2">
        {testimonials.map((_, dotIndex) => (
          <button
            key={dotIndex}
            type="button"
            onClick={() => setIndex(dotIndex)}
            className={`h-2 w-2 rounded-full ${
              dotIndex === index ? "bg-primary" : "bg-border"
            }`}
            aria-label={`Go to testimonial ${dotIndex + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
