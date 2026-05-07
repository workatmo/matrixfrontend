import { BadgeCheck, Clock3, MapPinned, Wrench } from "lucide-react";

const items = [
  {
    icon: Clock3,
    title: "Convenient",
    description: "We can come to you 7 days a week between 8am and 8pm, at home or at work.",
  },
  {
    icon: Wrench,
    title: "Best availability",
    description: "We offer same day fitting services on selected tyres.",
  },
  {
    icon: BadgeCheck,
    title: "Trusted service",
    description: "Our mobile fitting service is highly rated by customers.",
  },
  {
    icon: MapPinned,
    title: "Coverage",
    description: "We provide fast 24/7 mobile tyre fitting within a 15-mile radius of Coventry.",
  },
];
const testimonials = [
  {
    quote:
      "Booked in the morning and had two new tyres fitted on my driveway by lunchtime. Super easy and no garage waiting around.",
    name: "Daniel Harper",
    role: "Verified customer, Coventry",
  },
  {
    quote:
      "Great communication from start to finish. The fitter called ahead, arrived on time, and got everything done quickly.",
    name: "Amelia Khan",
    role: "Verified customer, Kenilworth",
  },
  {
    quote:
      "Fair prices, quality tyres, and a friendly technician. I will definitely use this mobile service again.",
    name: "Liam Bennett",
    role: "Verified customer, Leamington Spa",
  },
  {
    quote:
      "I had a puncture at work and they came the same day. Really professional service and very convenient.",
    name: "Sophie Walker",
    role: "Verified customer, Rugby",
  },
  {
    quote:
      "The online booking was straightforward and the fitter explained everything clearly before starting the job.",
    name: "Ethan Collins",
    role: "Verified customer, Nuneaton",
  },
  {
    quote:
      "Reliable, punctual, and hassle-free. It is exactly what you want when you need tyres fitted at home.",
    name: "Olivia Turner",
    role: "Verified customer, Warwick",
  },
];

export function WhyChooseUs() {
  return (
    <section className="bg-transparent px-6 pb-6 pt-1 sm:px-10 sm:pt-2">
      <div className="mx-auto max-w-6xl space-y-10">
        <div className="rounded-xl border border-white/70 bg-gradient-to-br from-[#eef4ff]/90 via-[#f4f0ff]/90 to-[#ffeef7]/90 p-6 shadow-[0_18px_50px_-35px_rgba(53,88,223,0.6)] backdrop-blur-sm sm:p-8">
          <h2 className="text-center text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
            Why choose our mobile tyre fitting service?
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.title}
                  className="rounded-xl border border-neutral-200 bg-white p-6 text-center shadow-[0_8px_24px_-20px_rgba(0,0,0,0.35)]"
                >
                  <span className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="mt-4 border-t border-neutral-200 pt-3">
                    <h3 className="text-2xl font-semibold text-neutral-900">{item.title}</h3>
                    <p className="mt-2 text-sm text-neutral-700">{item.description}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-white/70 bg-gradient-to-br from-[#eef4ff]/90 via-[#f4f0ff]/90 to-[#ffeef7]/90 p-6 shadow-[0_18px_50px_-35px_rgba(53,88,223,0.6)] backdrop-blur-sm sm:p-8">
          <h3 className="text-center text-3xl font-semibold tracking-tight text-black sm:text-5xl">
            What our customers say
          </h3>
          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {testimonials.map((item) => (
              <article
                key={item.name}
                className="rounded-xl border border-neutral-200 bg-white p-6 shadow-[0_8px_24px_-20px_rgba(0,0,0,0.35)]"
              >
                <p className="text-4xl leading-none text-indigo-400">&ldquo;</p>
                <p className="mt-3 text-sm leading-relaxed text-neutral-700">{item.quote}</p>
                <div className="mt-6 flex items-center gap-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-pink-100 text-xs font-semibold text-neutral-700">
                    {item.name
                      .split(" ")
                      .slice(0, 2)
                      .map((part) => part[0])
                      .join("")}
                  </span>
                  <div>
                    <p className="text-lg font-semibold text-neutral-900">{item.name}</p>
                    <p className="text-xs text-neutral-500">{item.role}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
