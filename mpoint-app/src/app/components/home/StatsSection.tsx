import React from "react";

// Optional: CountUp als eigene Komponente, falls du sie mehrfach brauchst
const CountUp = ({ end, duration = 2000 }: { end: number; duration?: number }) => {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    let startTime: number;
    const animateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animateCount);
    };
    requestAnimationFrame(animateCount);
  }, [end, duration]);

  return <span>{count.toLocaleString("de-DE")}</span>;
};

export default function StatsSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-4xl lg:text-5xl font-bold text-gray-900 mb-2">
              <CountUp end={350000} />+
            </div>
            <p className="text-gray-600">Unternehmen in Hamburg</p>
          </div>
          <div className="text-center">
            <div className="text-4xl lg:text-5xl font-bold text-gray-900 mb-2">
              <CountUp end={95} />%
            </div>
            <p className="text-gray-600">Match-Erfolgsquote</p>
          </div>
          <div className="text-center">
            <div className="text-4xl lg:text-5xl font-bold text-gray-900 mb-2">
              <CountUp end={500} />+
            </div>
            <p className="text-gray-600">Events pro Jahr</p>
          </div>
          <div className="text-center">
            <div className="text-4xl lg:text-5xl font-bold text-gray-900 mb-2">
              <CountUp end={24} />h
            </div>
            <p className="text-gray-600">Antwortzeit Ø</p>
          </div>
        </div>
      </div>
    </section>
  );
}