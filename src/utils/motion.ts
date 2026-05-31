export const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.8 } },
  whileInView: { opacity: 1, y: 0, transition: { duration: 0.8 } },
  viewport: { once: true, margin: "-100px" },
};

export const staggerContainer = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { staggerChildren: 0.15 } },
  whileInView: { opacity: 1, transition: { staggerChildren: 0.15 } },
  viewport: { once: true, margin: "-100px" },
};

export const fadeReveal = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 1 } },
  whileInView: { opacity: 1, transition: { duration: 1 } },
  viewport: { once: true, margin: "-50px" },
};

export const softZoom = {
  initial: { scale: 1.05, opacity: 0 },
  animate: { scale: 1, opacity: 1, transition: { duration: 1.2 } },
  whileInView: { scale: 1, opacity: 1, transition: { duration: 1.2 } },
  viewport: { once: true },
};
