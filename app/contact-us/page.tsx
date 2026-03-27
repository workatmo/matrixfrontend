export const metadata = {
  title: "Contact Us | Matrix",
  description: "Get in touch with the Matrix team for any inquiries or support.",
};

export default function ContactUsPage() {
  return (
    <main className="min-h-screen bg-neutral-50 flex flex-col font-sans">
      <div className="bg-black text-white py-20 px-6 sm:px-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
            Contact Us
          </h1>
          <p className="text-lg sm:text-xl text-neutral-400 max-w-2xl mx-auto">
            We are here to help. Reach out to us with any questions or support requests.
          </p>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-6 sm:px-10 py-16 grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-6 text-neutral-800 text-lg">
          <h2 className="text-3xl font-bold text-black border-b pb-4">Get in Touch</h2>
          <p>
            Have a question about which tyre is right for you? Want an update on your order?
            We&apos;re always happy to assist. Fill out the form or use our contact details below.
          </p>
          <div className="space-y-4 font-medium text-black pt-4">
            <p className="flex items-center gap-2">
              <span className="bg-neutral-200 p-2 rounded-full">📞</span> +44 123 456 7890
            </p>
            <p className="flex items-center gap-2">
              <span className="bg-neutral-200 p-2 rounded-full">✉️</span> support@matrix-tyres.com
            </p>
            <p className="flex items-center gap-2">
              <span className="bg-neutral-200 p-2 rounded-full">📍</span> 123 Matrix Road, London, UK
            </p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-neutral-200">
          <form className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-1">Full Name</label>
              <input 
                type="text" 
                id="name" 
                className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-black placeholder:text-neutral-400 text-black bg-white" 
                placeholder="John Doe" 
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">Email Address</label>
              <input 
                type="email" 
                id="email" 
                className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-black placeholder:text-neutral-400 text-black bg-white" 
                placeholder="john@example.com" 
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-neutral-700 mb-1">Message</label>
              <textarea 
                id="message" 
                rows={4} 
                className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-black placeholder:text-neutral-400 text-black bg-white" 
                placeholder="How can we help you?"
              ></textarea>
            </div>
            <button 
              type="submit"
              className="w-full py-3 px-4 bg-black text-white font-medium text-lg rounded-lg hover:bg-neutral-800 transition-colors"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
