import { motion } from "framer-motion";
import { MessageSquare, Eye, Mail, Zap } from "lucide-react";

const features = [
  {
    title: "Instant Answers",
    description: "Ask anything, get context-aware responses without switching tabs.",
    icon: MessageSquare,
    color: "#F59E0B", // Amber
    gradient: "from-amber-400 to-amber-600",
  },
  {
    title: "Undetectable Overlay",
    description: "Movable UI stays hidden from screen shares and participants.",
    icon: Eye,
    color: "#7C3AED", // Violet
    gradient: "from-violet-400 to-violet-600",
  },
  {
    title: "Smart Follow-Ups",
    description: "Generate emails and action items post-meeting.",
    icon: Mail,
    color: "#EC4899", // Pink
    gradient: "from-pink-400 to-pink-600",
  },
];
type FeatureProps = { id?: string };
const FeatureSection = ({ id }: FeatureProps) => {
  return (
    <section className="py-20 px-4 sm:px-6 bg-bg-light overflow-hidden" id={id}>
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row items-center lg:items-end justify-between mb-16 gap-8">
          <div className="max-w-2xl text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-100 text-orange-600 text-sm font-medium mb-6"
            >
              <Zap size={14} fill="currentColor" />
              <span>Explore Features</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-3xl sm:text-5xl md:text-6xl font-bold text-[#1A1F36] leading-[1.1] mb-6 tracking-tight"
            >
              Qluely runs locally on your{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-pink-400 to-orange-400">
                device
              </span>{" "}
              seamlessly
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg text-gray-500 max-w-lg mb-8 leading-relaxed"
            >
              It listens, understands, and responds instantly.
            </motion.p>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            // Determine if the card should be offset (staggered effect)
            // For a 4-item grid, we might not want a heavy stagger, but here is a subtle delay
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group relative bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-300 flex flex-col overflow-hidden"
              >
                {/* Top Half: Grid Pattern & Icon */}
                <div className="h-48 relative w-full bg-gray-50/50 overflow-hidden border-b border-gray-100">
                  {/* CSS Grid Pattern Background */}
                  <div
                    className="absolute inset-0 opacity-[0.4]"
                    style={{
                      backgroundImage: `linear-gradient(#E2E8F0 1px, transparent 1px), linear-gradient(90deg, #E2E8F0 1px, transparent 1px)`,
                      backgroundSize: "24px 24px",
                    }}
                  />

                  {/* Fading overlay to blend grid into white at the bottom */}
                  <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-white/80" />

                  {/* Icon Container */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                      {/* Decorative colored blur behind icon */}
                      <div
                        className="absolute inset-0 blur-2xl opacity-20 transform scale-150"
                        style={{ backgroundColor: feature.color }}
                      />

                      {/* The White Box */}
                      <div className="relative w-20 h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center bg-linear-to-br ${
                            feature.gradient || "from-gray-700 to-black"
                          }`}
                        >
                          <Icon size={24} className="text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Half: Text Content */}
                <div className="p-6 pt-8 text-center grow flex flex-col">
                  <h3 className="text-[#1A1F36] font-bold text-xl mb-3">{feature.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
