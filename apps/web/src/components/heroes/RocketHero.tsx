export const RocketHero = () => (
  <section className="min-h-screen bg-[#0B1C2D] flex items-center px-8">
    <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16">
      <div>
        <h1 className="text-6xl font-extrabold text-white">
          Launchpad 4 Success
        </h1>
        <p className="mt-6 text-xl text-gray-300">
          Build affiliate systems that actually lift off.
        </p>
        <button className="mt-10 bg-[#FF6A00] px-8 py-4 text-white rounded-xl">
          Start Your Launch
        </button>
      </div>
      <img
        src="/assets/rocket.png"
        className="w-full object-contain"
        alt="Rocket launch"
      />
    </div>
  </section>
);
