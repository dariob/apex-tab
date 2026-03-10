import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

const SearchBar = () => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus automatically when new tab opens
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputRef.current?.value.trim()) {
      window.location.href = `https://www.google.com/search?q=${encodeURIComponent(inputRef.current.value)}`;
    }
  };

  return (
    <motion.form 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.1, type: "spring" }}
      onSubmit={handleSubmit}
      className="w-full max-w-2xl relative group"
    >
      <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
        <Search className="h-6 w-6 text-slate-400 group-focus-within:text-blue-400 transition-colors duration-300" />
      </div>
      <input
        ref={inputRef}
        type="text"
        placeholder="Cerca su Google o digita un URL..."
        className="block w-full pl-16 pr-6 py-5 text-xl bg-slate-800/50 border border-slate-700/50 rounded-full text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 backdrop-blur-xl shadow-lg transition-all duration-300 hover:bg-slate-800/70"
        autoComplete="off"
      />
    </motion.form>
  );
};

export default SearchBar;
