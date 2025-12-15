import React from "react";
import chatbotVideo from "@/assets/onboarding/Chatbot-Video.mp4";

interface ChatbotStepProps {
  onBack: () => void;
  onNext: () => void;
}

const QuoteBubble: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    className="
      rounded-[8px]
      bg-white
      border border-black/5
      shadow-[0_4px_8px_rgba(0,0,0,0.08)]
      p-[8px]
      text-[14px] sm:text-[13px]
      text-center text-[#111827]
      font-semibold
    "
  >
    {children}
  </div>
);

const CurlyConnector: React.FC<{ side: "left" | "right" }> = ({ side }) => {
  // stroke-only SVG so it matches the screenshot
  return (
    <svg
      viewBox="0 0 120 70"
      className={[
        "w-[72px] h-[44px] md:w-[92px] md:h-[54px] lg:w-[110px] lg:h-[60px]",
        side === "right" ? "rotate-0" : "scale-x-[-1]",
      ].join(" ")}
      fill="none"
    >
      <path
        d="M10 10
           C 55 10, 55 35, 25 35
           C 5 35, 5 60, 35 60
           C 70 60, 70 35, 105 35"
        stroke="white"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M105 35 L92 28 M105 35 L92 42"
        stroke="white"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* arrow head */}
    </svg>
  );
};


const QuoteRow: React.FC<{
  side: "left" | "right";
  children: React.ReactNode;
}> = ({ side, children }) => {
  const isLeft = side === "left";


   return (
    <div className={["flex items-center", isLeft ? "justify-end" : "justify-start"].join(" ")}>
      {isLeft ? (
        <>
          <div className="ml-3 md:ml-4">
            <CurlyConnector side="left" />
          </div>
          <QuoteBubble>{children}</QuoteBubble>
        </>
      ) : (
        <>
         
          <QuoteBubble>{children}</QuoteBubble>
          <div className="mr-3 md:mr-4">
            <CurlyConnector side="right" />
          </div>
        </>
      )}
    </div>
  );
};




export const ChatbotStep: React.FC<ChatbotStepProps> = () => {
  
  return (
    <div className="flex flex-col w-full h-full ">
     <section className="w-full flex flex-col items-center">
  <div className="w-full max-w-[710px] flex flex-col items-center text-center gap-[22px]">
    <h2 className="text-[40px] md:text-[48px] font-bold text-[#000000]">
      AI Stylist Chatbot
    </h2>
    <p className="text-[18px] font-normal text-[#000000] leading-[1.2]">
      Ask for outfit ideas, explore new looks, or get help styling for any occasion, instantly
    </p>
  </div>

       
               <div className="mt-10 w-full flex justify-center">
          <div className="w-full max-w-[1200px] flex items-center justify-between px-6 lg:px-10">
            {/* LEFT QUOTES – hidden on small screens */}
            <div className="hidden md:flex flex-col gap-10 w-[320px] font-bold">
              <QuoteRow  side="right">
                Find sporty outfits with white sneakers 👟
              </QuoteRow >
              <QuoteRow  side="right">
                Style a satin midi dress 👗
              </QuoteRow >
              <QuoteRow  side="right">
                Outfits for all-black look
              </QuoteRow >
            </div>

            {/* ORIGINAL VIDEO CARD – unchanged */}
            <div className="flex justify-center flex-1">
              <div
                className="
                  w-full
                  max-w-[340px]
                  sm:max-w-[400px]
                  md:max-w-[460px]
                  lg:max-w-[520px]
                  aspect-[602/486]
                  rounded-[18px]
                  border-[7px] border-[#6A5ACD]
                  shadow-[0_4px_14.7px_rgba(0,0,0,0.25)]
                  overflow-hidden bg-white relative
                "
              >
                <video
                  src={chatbotVideo}
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls
                />
              </div>
            </div>

            {/* RIGHT QUOTES – hidden on small screens */}
            <div className="hidden md:flex flex-col gap-10 w-[320px] font-bold">
              <QuoteRow side="left">
                Outfits for job interviews
              </QuoteRow>
              <QuoteRow side="left">
                Make outfits with Aritzia Effortless Pants
              </QuoteRow>
              <QuoteRow side="left">
                Make a y2k inspired outfit
              </QuoteRow>
            </div>
          </div>
        </div>


      </section>
      </div>
  
  );
};
