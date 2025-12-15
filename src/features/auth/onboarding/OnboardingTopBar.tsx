// OnboardingTopBar.tsx
import React from "react";
import imglogo from "@/assets/onboarding/fAIshion-logo.png";
import pinlogo from "@/assets/onboarding/pin.png";
import sizelogo from "@/assets/onboarding/Size.png";
import chatlogo from "@/assets/onboarding/Chatbot-logo.png";
import historylogo from "@/assets/onboarding/History-Logo.png";
import imagelogo from "@/assets/onboarding/Image-logo.png";
import tryonlogo from "@/assets/onboarding/Tryon-logo.png";
import fbuttonlogo from "@/assets/onboarding/Fbutton-logo.png";

interface OnboardingHeaderProps {
  showNavbar?: boolean;
  /** Which logical step is active (e.g. "howItWorks") */
  activeStepId?: string;
  /** Whether to show the center control area (back/next row) */
  showControls?: boolean;
  /** Whether to show the multi-step progress bar */
  showStepper?: boolean;
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  rightSlot?: React.ReactNode; 
  onStepClick?: (stepId: string) => void;
}

const STEPS: { id: string; label: string; icon?: string }[] = [
  { id: "pinToolbar", label: "Pin", icon: pinlogo},
  { id: "chooseViewer", label: "Photo", icon: imagelogo},
  { id: "howItWorks", label: "Try On", icon: tryonlogo },
  { id: "SizeHowItWorksStep", label: "Size", icon: sizelogo },
  { id: "chatbot", label: "Chatbot", icon:  chatlogo},
  { id: "AllinOnePlaceProps", label: "History", icon:historylogo },
  { id: "ShortcutProps", label: "Menu", icon:fbuttonlogo},
];

export const OnboardingHeader: React.FC<OnboardingHeaderProps> = ({
  showNavbar = true,
  activeStepId,
  showControls = false,
  showStepper = true,
  onBack,
  onNext,
  nextLabel = "Next",
  rightSlot,
  onStepClick,
}) => {
  const currentStepIndex = activeStepId
    ? STEPS.findIndex((s) => s.id === activeStepId)
    : 0;

  const safeIndex = currentStepIndex >= 0 ? currentStepIndex : 0;

  const hasStepper = showStepper && safeIndex >= 0 && safeIndex < STEPS.length;



  const circleClass = (i: number) => {
    const isDone = i < safeIndex;
    const isActive = i === safeIndex; 

    return [
      "h-7 w-7 md:h-8 md:w-8 rounded-full flex items-center justify-center",
      "text-[12px] md:text-[13px] font-bold",
      "z-10 transition-all duration-200",
        isDone ? "bg-[#675BC5] text-[#675BC5] border border-[#A1AEBE]" : "",
            isActive ? "bg-white text-[#675BC5] border-2 border-[#A1AEBE]" : "",
      !isDone && !isActive ? "bg-white text-[#767676] border-2 border-[#E5E5E5]" : "",
      onStepClick ? "cursor-pointer hover:scale-[1.04]" : "",
    ].join(" ");
  };

  return (
    <div className="w-full sticky top-0 z-50 bg-white">
      {/* Top logo nav */}
      {showNavbar && (
        <header
          className="
            w-full
            flex items-center justify-between
            bg-white
            border-b-[2px] border-[#E5E5E5]
            h-[44px] md:h-[48px] lg:h-[52px]
            pl-[16px] pr-[16px]
            md:pl-[24px] md:pr-[20px]
            lg:pl-[32px] lg:pr-[28px]
          "
        >
          <div className="flex items-center">
            <img
              src={imglogo}
              alt="fAIshion.ai"
              className="h-[18px] md:h-[20px] lg:h-[24px] w-auto object-contain select-none"
              draggable={false}
            />
          </div>
          {rightSlot ? rightSlot : <div className="w-6" />}
        </header>
      )}

      {showControls && (
        <div className="w-full bg-white">
          <div
            className="
                flex items-center justify-between
  h-[80px] md:h-[90px] lg:h-[100px]
  px-[16px] md:px-[24px] lg:px-[32px]
            "
          >
            {/* Back button (left) */}
            <button
              type="button"
              onClick={onBack}
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 shrink-0"
              aria-label="Back"
            >
              <span
                aria-hidden
                className="inline-block h-3 w-3 border-l-[3.5px] border-b-[3.5px] border-[#767676] rotate-45 translate-x-[1px]"
              />
            </button>

            {hasStepper && (
  <div className="w-full flex justify-center">
    <div className="w-full max-w-[1106px] px-6 md:px-10 lg:px-14">
      <div className="w-full flex items-start justify-between">



        {STEPS.map((step, i) => {
          const isActive = i === safeIndex;

          const circleCls = [
  "h-7 w-7 md:h-8 md:w-8 rounded-full flex items-center justify-center",
  "z-10 transition-all duration-200",
  isActive ?"bg-[#675BC5] border-2 border-[#675BC5]" : "bg-white border-2 border-[#A1AEBE]",
  onStepClick ? "cursor-pointer hover:scale-[1.04]" : "",
].join(" ");

          const labelCls = [
            "mt-2 text-[11px] md:text-[12px] leading-none text-center select-none",
            isActive ? "text-[#675BC5] font-bold" : "text-[#A1AEBE] font-bold",
          ].join(" ");

          return (
  <React.Fragment key={step.id}>
    {/* Step */}
    <div className="flex flex-col items-center">
      <button
        type="button"
        className={circleCls}
        aria-label={`Step ${i + 1}: ${step.label}`}
        onClick={() => onStepClick?.(step.id)}
      >
        <img
          src={step.icon}
          alt={step.label}
          className={[
            "h-4 w-4 md:h-5 md:w-5 object-contain",
            isActive ? "brightness-0 invert" : "opacity-60",
          ].join(" ")}
          draggable={false}
        />
      </button>

      <div className={labelCls}>{step.label}</div>
    </div>

    {i !== STEPS.length - 1 && (
      <div className="flex-1 flex justify-center">
        <div className="mt-[14px] md:mt-[15px] h-[2px] w-full max-w-[70px] md:max-w-[90px] lg:max-w-[100px] bg-[#A1AEBE]" />
      </div>
    )}
  </React.Fragment>
);

        })}
      </div>
    </div>
  </div>
)}


            {/* Next / Skip (right) */}
            {onNext &&
              (() => {
                const isSkip = (nextLabel || "").toLowerCase() === "skip";

                return (
                  <button
                    type="button"
                    onClick={onNext}
                    className={`
                      inline-flex items-center justify-center
                      h-8
                      px-3
                      rounded-[8px]
                      text-[12px] md:text-[13px]
                      font-semibold
                      min-w-[72px]
                      transition-all duration-200
                      shrink-0
                      ${
                        isSkip
                          ? "bg-transparent text-[#767676] shadow-none hover:bg-gray-50"
                          : "bg-[#2C2C2C] text-white shadow-sm hover:bg-black/80"
                      }
                    `}
                  >
                    <span className="mr-1">
                      {isSkip ? "Skip" : nextLabel || "Next"}
                    </span>

                    {!isSkip && (
                      <span
                        aria-hidden
                        className="
                          inline-block h-2 w-2
                          border-r-[2px] border-b-[2px] border-white
                          rotate-[-45deg] translate-y-[1px]
                        "
                      />
                    )}
                  </button>
                );
              })()}
          </div>
        </div>
      )}
    </div>
  );
};
