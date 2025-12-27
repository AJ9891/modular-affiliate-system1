export const MeltdownHero = () => (
  <section className="min-h-screen bg-[#050A12] flex items-center justify-center text-center px-6">
    <div className="max-w-3xl">
      <img
        src="/assets/ai-meltdown.png"
        className="mx-auto rounded-xl mb-8"
        alt="AI meltdown"
      />
      <h1 className="text-5xl font-extrabold text-white">
        DO NOT CLICK THE LINK
      </h1>
      <p className="mt-6 text-lg text-cyan-300">
        An AI begging you not to repeat affiliate mistakes it has already
        simulated thousands of times.
      </p>
      <button className="mt-10 border border-cyan-400 px-8 py-4 text-cyan-300 rounded-xl">
        Fine. I'll Listen.
      </button>
    </div>
  </section>
);
