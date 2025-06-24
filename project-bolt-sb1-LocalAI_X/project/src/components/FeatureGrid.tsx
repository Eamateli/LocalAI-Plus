import React from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Brain, 
  Code, 
  Search, 
  Shield, 
  Puzzle,
  Zap,
  Database
} from 'lucide-react';

const features = [
  {
    icon: MessageSquare,
    title: 'OpenAI-Compatible Chat API',
    description: 'Drop-in replacement for OpenAI\'s chat completions API with full compatibility for existing applications.',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Brain,
    title: 'Function Calling',
    description: 'Structured tool use with JSON schema definitions. Enable your models to interact with external tools and APIs.',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: Database,
    title: 'Vector Embeddings & RAG',
    description: 'Built-in embeddings API with Qdrant integration for semantic search and retrieval augmented generation.',
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: Code,
    title: 'Secure Code Interpreter',
    description: 'Execute Python code in a sandboxed environment with safety controls, resource limits, and timeout protection.',
    color: 'from-orange-500 to-red-500'
  },
  {
    icon: Puzzle,
    title: 'Plugin System',
    description: 'Extensible architecture for custom tools. Build and register your own plugins with easy-to-use APIs.',
    color: 'from-indigo-500 to-purple-500'
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'API key authentication, input sanitization, resource limiting, and comprehensive logging for production use.',
    color: 'from-teal-500 to-blue-500'
  },
  {
    icon: Zap,
    title: 'High Performance',
    description: 'Optimized for speed with async processing, streaming responses, and efficient model management.',
    color: 'from-yellow-500 to-orange-500'
  },
  {
    icon: Search,
    title: 'Developer Experience',
    description: 'Complete OpenAPI docs, interactive playground, comprehensive examples, and detailed guides.',
    color: 'from-rose-500 to-pink-500'
  }
];

function FeatureGrid() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-6">
            Everything You Need for Local AI
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            LocalAI+ provides all the tools and APIs you need to build production-ready AI applications 
            without relying on cloud services.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ 
                scale: 1.05, 
                boxShadow: "0 20px 40px rgba(0,0,0,0.3)" 
              }}
              className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-300"
            >
              {/* Gradient background on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}></div>
              
              <div className="relative z-10">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                
                <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-white transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors">
                  {feature.description}
                </p>
              </div>

              {/* Hover glow effect */}
              <div className={`absolute -inset-0.5 bg-gradient-to-r ${feature.color} rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-300 -z-10`}></div>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {[
            { number: '100%', label: 'OpenAI Compatible', sublabel: 'Drop-in replacement' },
            { number: '<50ms', label: 'Response Latency', sublabel: 'Optimized for speed' },
            { number: '99.9%', label: 'Uptime', sublabel: 'Production ready' }
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
                {stat.number}
              </div>
              <div className="text-white font-semibold text-lg mb-1">{stat.label}</div>
              <div className="text-gray-400 text-sm">{stat.sublabel}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default FeatureGrid;