
import React from 'react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
  index: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon, index }) => {
  // Calculate delay for staggered animation based on index
  const animationDelay = `${index * 0.1}s`;
  
  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700"
      style={{ animationDelay }}
    >
      <div className="mb-4 w-12 h-12 rounded-full bg-hakata-light-purple/10 flex items-center justify-center">
        <span className="text-2xl">{icon}</span>
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
};

const Features = () => {
  const features = [
    {
      title: "On-Chain Single-Stock Perpetuals",
      description: "Trade Apple stock ($AAPL) and soon other major equities with high leverage, near-instant settlement, and zero custodial risk.",
      icon: "📈"
    },
    {
      title: "AI-Powered Event & Sentiment Radar",
      description: "Get market-moving news, earnings events, and sentiment shifts visualized directly in your trading interface.",
      icon: "🧠"
    },
    {
      title: "Real-Time Visual Trading",
      description: "See critical events pinned directly onto your live chart — gain instant context behind every price move.",
      icon: "👁️"
    },
    {
      title: "Permissionless, Self-Custody",
      description: "Total asset control. Trade directly from your Solana wallet. No intermediaries, ever.",
      icon: "🔒"
    },
    {
      title: "Lightning Fast & Affordable",
      description: "Experience sub-second settlements and minimal fees, powered by Solana's unmatched speed.",
      icon: "⚡"
    },
    {
      title: "Compressed-XP Rewards (cXP)",
      description: "Be among the first to earn cXP! Get on-chain, lightweight experience tokens with your first trade.",
      icon: "🏆"
    }
  ];

  return (
    <section id="features" className="section-padding">
      <div className="container-tight">
        <h2 className="heading-lg text-center mb-4">
          Unlock Next-Generation Trading Features
        </h2>
        <p className="paragraph text-center max-w-2xl mx-auto mb-12">
          Hakata combines the best of traditional finance with Solana's speed and security
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
