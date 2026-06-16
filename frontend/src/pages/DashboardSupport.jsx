import { useState } from "react";
import { ChevronRight } from "lucide-react";

export default function DashboardSupport() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "How do I upload files?",
      answer:
        "Go to My Files and click on the Upload button to add your files securely.",
    },
    {
      question: "How do I upgrade my plan?",
      answer:
        "Navigate to Subscription and select the plan you want to upgrade to.",
    },
    {
      question: "How do I share files with someone?",
      answer:
        "Click on the Share button next to any uploaded file and copy the link.",
    },
    {
      question: "Why has my share link expired?",
      answer:
        "Share links expire based on security settings. You can regenerate it anytime.",
    },
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="p-8 bg-[#F6F7FB] min-h-screen">

      {/* Header */}
      <div className="flex items-stretch gap-5 mb-10">
        <div className="w-2 bg-orange-500 rounded-md"></div>

        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Support
          </h1>
          <p className="text-gray-500 mt-2">
            We're here to help.Find answers or contact our team anytime
          </p>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="space-y-5 mb-8">

        {/* FAQ Heading Card */}
        <div className="relative bg-white rounded-md shadow-md overflow-hidden">
          <div className="absolute left-0 top-0 h-full w-1.5 bg-orange-500"></div>
          <div className="px-6 py-4">
            <h2 className="text-gray-700 font-semibold text-base">
              FAQ
            </h2>
          </div>
        </div>

        {faqs.map((faq, index) => (
          <div
            key={index}
            onClick={() => toggleFAQ(index)}
            className="relative bg-white rounded-md shadow-md cursor-pointer overflow-hidden transition-all"
          >
            {/* Left Orange Bar */}
            <div className="absolute left-0 top-0 h-full w-1.5 bg-orange-500"></div>

            {/* Question */}
            <div className="flex justify-between items-center px-6 py-4">
              <span className="text-gray-700 font-semibold text-base">
                {faq.question}
              </span>

              <ChevronRight
                size={20}
                className={`text-gray-500 transition-transform duration-200 ${
                  openIndex === index ? "rotate-90" : ""
                }`}
              />
            </div>

            {/* Answer */}
            {openIndex === index && (
              <div className="px-6 pb-4 text-sm text-gray-500">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Contact Us */}
      <div className="relative bg-white rounded-md shadow-md mb-5 overflow-hidden flex justify-between items-center px-6 py-4 cursor-pointer">
        <div className="absolute left-0 top-0 h-full w-1.5 bg-orange-500"></div>
        <span className="text-base font-bold text-gray-900">
          Contact Us
        </span>
        <ChevronRight size={20} className="text-gray-500" />
      </div>

      {/* Quick Links */}
      <div className="relative bg-white rounded-md shadow-md overflow-hidden flex justify-between items-center px-6 py-4 cursor-pointer">
        <div className="absolute left-0 top-0 h-full w-1.5 bg-orange-500"></div>
        <span className="text-base font-bold text-gray-900">
          Quick Links
        </span>
        <ChevronRight size={20} className="text-gray-500" />
      </div>

    </div>
  );
}
