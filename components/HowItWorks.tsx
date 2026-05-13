import { CarFront, CheckCircle2, KeyRound, MailCheck, ParkingCircle, ScanLine } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      icon: <CarFront className="h-6 w-6 text-neutral-700" />,
      title: "Enter Registration",
      description: "Add your registration and start your search instantly.",
    },
    {
      icon: <ScanLine className="h-6 w-6 text-neutral-700" />,
      title: "We Detect Your Vehicle",
      description: "Our system identifies matching tyre sizes for your exact car.",
    },
    {
      icon: <CheckCircle2 className="h-6 w-6 text-neutral-700" />,
      title: "Choose & Book Tyres",
      description: "Compare trusted options and confirm your booking in moments.",
    },
  ];
  const appointmentSteps = [
    {
      icon: <MailCheck className="h-6 w-6 text-neutral-700" />,
      text: "In the morning, look out for a text message or email confirming your timeslot.",
    },
    {
      icon: <ParkingCircle className="h-6 w-6 text-neutral-700" />,
      text: "Please ensure your vehicle is parked in an accessible location with enough space for our technicians to complete the work safely.",
    },
    {
      icon: <KeyRound className="h-6 w-6 text-neutral-700" />,
      text: "Make sure you have your keys and locking wheel nut (if necessary) to hand.",
    },
  ];

  return (
    <section className="bg-transparent px-6 pt-20 pb-4 sm:px-10 sm:pb-6">
      <div className="mx-auto max-w-6xl space-y-10">
        <div className="rounded-xl border border-white/70 bg-gradient-to-br from-[#eef4ff]/90 via-[#f4f0ff]/90 to-[#ffeef7]/90 p-6 shadow-[0_18px_50px_-35px_rgba(53,88,223,0.6)] backdrop-blur-sm sm:p-8">
        <h2 className="text-center text-3xl font-semibold tracking-tight text-black sm:text-4xl">
          How It Works
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-neutral-600">
          From search to booking, every step is designed to be fast, clear, and reliable.
        </p>
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={index}
              className="rounded-xl border border-neutral-200 bg-white p-6 text-center shadow-[0_8px_24px_-20px_rgba(0,0,0,0.35)]"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-neutral-200 bg-white">
                {step.icon}
              </div>
              <div className="mt-4 border-t border-neutral-200 pt-3">
                <h3 className="text-2xl font-semibold text-neutral-900">{step.title}</h3>
                <p className="mt-2 text-sm text-neutral-700">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
        </div>

        <div className="rounded-xl border border-white/70 bg-gradient-to-br from-[#eef4ff]/90 via-[#f4f0ff]/90 to-[#ffeef7]/90 p-6 shadow-[0_18px_50px_-35px_rgba(53,88,223,0.6)] backdrop-blur-sm sm:p-8">
          <h3 className="text-center text-3xl font-semibold tracking-tight text-black">
              What happens on the day
          </h3>
          <p className="mx-auto mt-3 max-w-2xl text-center text-neutral-600">
            Here&apos;s what you need to do on the day of your appointment...
          </p>
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {appointmentSteps.map((item) => (
              <div
                key={item.text}
                className="rounded-xl border border-neutral-200 bg-white p-6 text-center shadow-[0_8px_24px_-20px_rgba(0,0,0,0.35)]"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-neutral-200 bg-white">
                  {item.icon}
                </div>
                <div className="mt-4 border-t border-neutral-200 pt-3">
                  <p className="text-sm leading-relaxed text-neutral-700">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
