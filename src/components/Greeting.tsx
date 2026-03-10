import { motion } from 'framer-motion';

export interface GreetingSettings {
  text: string;
}

interface GreetingProps {
  settings: GreetingSettings;
}

const Greeting = ({ settings }: GreetingProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
      className="flex flex-col items-center justify-center py-4 w-full"
    >
      <h2 className="text-5xl md:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-emerald-400 to-teal-500 drop-shadow-sm">
        {settings.text || "Ciao!"}
      </h2>
    </motion.div>
  );
};

export default Greeting;
