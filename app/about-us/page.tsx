export const metadata = {
  title: "About Us | Matrix",
  description: "Learn more about Matrix, your trusted tyre provider.",
};

export default function AboutUsPage() {
  return (
    <main className="min-h-screen bg-neutral-50 flex flex-col font-sans">
      <div className="bg-black text-white py-20 px-6 sm:px-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
            About Matrix
          </h1>
          <p className="text-lg sm:text-xl text-neutral-400 max-w-2xl mx-auto">
            Your trusted provider for the best tyres tailored to your vehicle.
          </p>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-6 sm:px-10 py-16 space-y-8 text-neutral-800 text-lg leading-relaxed">
        <h2 className="text-3xl font-bold text-black border-b pb-4">Our Story</h2>
        <p>
          At Matrix, we believe that finding the right tyres for your car should be as easy and seamless as a Sunday drive. 
          Founded with a passion for automotive excellence and a commitment to customer satisfaction, we set out to build a platform that simplifies the tyre-buying process.
        </p>
        <p>
          Whether you&apos;re looking for high-performance summer tyres or reliable all-season treads, our extensive inventory and intelligent matching system guarantee that you get exactly what your vehicle needs to perform safely and optimally.
        </p>
        
        <h2 className="text-3xl font-bold text-black border-b pb-4 mt-12">Why Choose Us?</h2>
        <ul className="list-disc pl-6 space-y-3">
          <li><strong>Instant Recommendations:</strong> Just enter your registration number and we handle the rest.</li>
          <li><strong>Premium Quality:</strong> We partner with top brands like Michelin, Pirelli, and Bridgestone.</li>
          <li><strong>Expert Support:</strong> Our team of tyre specialists is always ready to guide you.</li>
          <li><strong>Competitive Pricing:</strong> Great deals and transparent pricing on every product.</li>
        </ul>
      </div>
    </main>
  );
}
