
const LandingPageHero = () => {
  return (
    <section className="bg-black py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight text-foreground">
            Your Website Is Leaking Cash.
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-gray-300">
            What if you could find out—in 2 minutes—exactly how much?
          </h2>
          
          <p className="text-xl text-gray-400 mb-6">
            This free report runs your real traffic data and shows:
          </p>
          
          <div className="max-w-2xl mx-auto mb-8">
            <ul className="text-left space-y-3 text-lg text-gray-300">
              <li className="flex items-start">
                <span className="text-accent mr-3 mt-1">•</span>
                How many buyers are slipping through your fingers
              </li>
              <li className="flex items-start">
                <span className="text-accent mr-3 mt-1">•</span>
                What those lost sales are worth in $$$
              </li>
              <li className="flex items-start">
                <span className="text-accent mr-3 mt-1">•</span>
                How to fix it starting today
              </li>
            </ul>
          </div>
          
          <p className="text-xl font-semibold text-destructive mb-8">
            Don't spend another dollar on ads until you see this.
          </p>
        </div>
      </div>
    </section>
  );
};

export default LandingPageHero;
