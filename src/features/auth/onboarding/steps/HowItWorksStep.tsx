import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import step1Img from "@/assets/onboarding/Try-on-Step1.mp4";
import step2Img from "@/assets/onboarding/Try-on-Step2.mp4";
import step3Img from "@/assets/onboarding/Try-on-Step3.mp4";

const videoVariants = {
  initial: { opacity: 0, y: 10 },
  enter:   { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -10 },
};

const textVariants = {
  initial: { opacity: 0, y: 6 },
  enter:   { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -6 },
};

const smoothTransition = {
  duration: 0.5,
  ease: [0.42, 0, 0.58, 1] as [number, number, number, number],
};


interface HowItWorksStepProps {
  onNext: () => void;
  onBack?: () => void;
  onSkip?: () => void;
  onReachBottom?: (atBottom: boolean) => void;
}



const HOW_IT_WORKS_STEPS = [
  {
    id: 1,
    label: "01 / 03",
    title: "1. Find",
    descriptionLines: [
      "Scroll through your favorite fashion sites and spot a piece you love.",
      "Find what inspires your next look.",
    ],
    videoSrc: step1Img,
  },
  {
    id: 2,
    label: "02 / 03",
    title: "2. Right Click",
    descriptionLines: [
      "Right-click the clothing image and select “Try On Now | fAIshion”.",
      "Your try-on will start instantly, no extra steps.",
    ],
    videoSrc: step2Img,
  },
  {
    id: 3,
    label: "03 / 03",
    title: "3. See your look",
    descriptionLines: [
      "Your personalized try-on is ready!",
      "View your personalized try-on and shine with confidence.",
    ],
    videoSrc: step3Img,
  },
];

export const HowItWorksStep: React.FC<HowItWorksStepProps> = ({
  onReachBottom,
}) => {
  const total = HOW_IT_WORKS_STEPS.length;
  const isScrollingRef = useRef(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
  const el = rootRef.current;
  if (!el) return;

  const onWheel = (e: WheelEvent) => {
    e.preventDefault();

    if (isScrollingRef.current) return;

    isScrollingRef.current = true;

    setActiveIndex((prev) => {
      if (e.deltaY > 0) {
        return Math.min(prev + 1, total - 1);
      } else {
        return Math.max(prev - 1, 0);
      }
    });

    setTimeout(() => {
      isScrollingRef.current = false;
    }, 700); 
  };

  el.addEventListener("wheel", onWheel, { passive: false });

  return () => {
    el.removeEventListener("wheel", onWheel);
  };
}, [total]);


useEffect(() => {
  const onKey = (e: KeyboardEvent) => {
    if (isScrollingRef.current) return;

    if (e.key === "ArrowDown") {
      setActiveIndex((i) => Math.min(i + 1, total - 1));
    }
    if (e.key === "ArrowUp") {
      setActiveIndex((i) => Math.max(i - 1, 0));
    }
  };

  window.addEventListener("keydown", onKey);
  return () => window.removeEventListener("keydown", onKey);
}, [total]);


  // Notify parent when user reaches bottom of section
  useEffect(() => {
    if (!onReachBottom) return;

    const checkBottom = () => {
      const el = rootRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const thresholdPx = 8;
      const atBottom = rect.bottom <= window.innerHeight + thresholdPx;
      onReachBottom(atBottom);
    };

    checkBottom();
    window.addEventListener("scroll", checkBottom, { passive: true });
    window.addEventListener("resize", checkBottom);

    return () => {
      window.removeEventListener("scroll", checkBottom);
      window.removeEventListener("resize", checkBottom);
    };
  }, [onReachBottom]);

  const activeStep = HOW_IT_WORKS_STEPS[activeIndex];

  return (
    <div ref={rootRef} className="relative w-full bg-white">
      {/* Sticky / fixed-feeling layout */}
      <section className="sticky top-[80px] z-10 flex min-h-[calc(100vh-80px)] items-center">
        <div
          className="
            w-full
            max-w-[1054px]
            lg:max-w-[1200px]
            xl:max-w-[1320px]
            mx-auto
            px-4 md:px-8 lg:px-10
            py-8 md:py-10 lg:py-12
          "
        >
          {/* Title */}
          <div className="text-center mb-8 md:mb-10">
            <h1
              className="
                mx-auto
                max-w-[638px]
                text-[22px] md:text-[30px] lg:text-[36px] xl:text-[40px]
                leading-[1.15]
                font-bold
                text-[#0A0A0A]
              "
            >
              Generate Your Virtual Try-On
            </h1>
          </div>

          {/* Main two-column content */}
          <div className="flex flex-col md:flex-row md:items-center gap-8 md:gap-10 lg:gap-14">
            {/* LEFT: Video */}
            <div className="w-full md:w-1/2 flex justify-center md:justify-start">
              <div
                className="
                  w-full
                  max-w-[340px]
                  sm:max-w-[400px]
                  md:max-w-[460px]
                  lg:max-w-[520px]
                  xl:max-w-[580px]
                  aspect-[508/310]
                  rounded-[32px]
                  overflow-hidden
                  bg-black
                "
              >
                <AnimatePresence mode="wait">
                  <motion.video
                     key={activeStep.videoSrc}
    src={activeStep.videoSrc}
    autoPlay
    loop
    muted
    playsInline
    className="w-full h-full object-cover"
    variants={videoVariants}
    initial="initial"
    animate="enter"
    exit="exit"
    transition={smoothTransition}
    controls
                  />
                </AnimatePresence>
              </div>
            </div>

            {/* RIGHT: Text */}
            <div className="w-full md:w-1/2 flex flex-col justify-center md:items-start items-center text-center md:text-left">
              {/* 01 / 03 */}
              <motion.p
                key={`label-${activeStep.id}`}
                className="text-[13px] md:text-[14px] lg:text-[16px] leading-[24px] font-bold text-[#6A5ACD]"
                variants={textVariants}
                initial="initial"
                animate="enter"
                exit="exit"
                transition={smoothTransition}
              >
                {activeStep.label}
              </motion.p>

              {/* Step title */}
              <AnimatePresence mode="wait">
                <motion.h2
                    key={`title-${activeStep.id}`}
    className="mt-2 text-[22px] sm:text-[24px] md:text-[26px] lg:text-[30px] leading-[48px] font-inter font-bold tracking-[0.35px] text-[#0A0A0A] max-w-[460px]"
    variants={textVariants}
    initial="initial"
    animate="enter"
    exit="exit"
    transition={smoothTransition}
                >
                  {activeStep.title}
                </motion.h2>
              </AnimatePresence>

              {/* Body text */}
              <AnimatePresence mode="wait">
                <motion.div
    key={`body-${activeStep.id}`}
    className="mt-3 text-[14px] sm:text-[15px] md:text-[16px] lg:text-[18px] xl:text-[19px] leading-[1.3] font-inter font-medium text-[#3B3B3B] max-w-[500px] whitespace-pre-line"
    variants={textVariants}
    initial="initial"
    animate="enter"
    exit="exit"
    transition={smoothTransition}
  >
    {activeStep.descriptionLines.map((line, idx) => (
      <p key={`${activeStep.id}-${idx}`}>{line}</p>
    ))}
  </motion.div>
              </AnimatePresence>

              {/* Progress indicator (3 bars) */}
              <div className="mt-8 flex items-center gap-2">
                {HOW_IT_WORKS_STEPS.map((step, i) => (
                  <span
                    key={step.id}
                    className={`h-[4px] rounded-full transition-all cursor-pointer ${
                      i === activeIndex
                        ? "w-[32px] bg-black"
                        : "w-[18px] bg-[#DADADA]"
                    }`}

                     onClick={() => {
        const targetEl = triggerRefs.current[i];
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }}
                  />
                ))}
              </div>

              {/* Scroll hint */}
              <div
                className="
                  mt-6 md:mt-8
                  flex items-center gap-2
                  text-[11px] md:text-[13px] lg:text-[14px]
                  leading-[20px]
                  text-[#6A7282]
                "
              >
                <span>Scroll to continue</span>
                
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Invisible scroll triggers driving the animation */}
      <div className="flex flex-col">
        {HOW_IT_WORKS_STEPS.map((step, index) => (
          <div
            key={step.id}
            data-index={index}
            ref={(el) => {
              triggerRefs.current[index] = el;
            }}
            className="h-[80vh] md:h-[90vh]"
          />
        ))}
      </div>
    </div>
  );
};
