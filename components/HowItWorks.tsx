import { Keyboard, Car, Disc } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      icon: <Keyboard className="h-8 w-8 text-black" />,
      title: "Enter Registration",
      description: "Provide your car's registration number.",
    },
    {
      icon: <Car className="h-8 w-8 text-black" />,
      title: "We Detect Your Car",
      description: "We instantly fetch your exact vehicle details.",
    },
    {
      icon: <Disc className="h-8 w-8 text-black" />,
      title: "Get Best Tyres",
      description: "Choose from tailored, premium tyre recommendations.",
    },
  ];

  return (
    <section className="py-20 px-6 sm:px-10 bg-white">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {steps.map((step, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center">
                {step.icon}
              </div>
              <h3 className="text-xl font-semibold">{step.title}</h3>
              <p className="text-neutral-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
