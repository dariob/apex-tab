import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Quote as QuoteIcon } from 'lucide-react';

interface QuoteData {
  content: string;
  author: string;
  timestamp: number;
}

const ITALIAN_QUOTES = [
  { content: "La vita è quello che ti succede mentre sei impegnato a fare altri progetti.", author: "John Lennon" },
  { content: "Non è vero che abbiamo poco tempo: la verità è che ne perdiamo molto.", author: "Lucio Anneo Seneca" },
  { content: "Sii il cambiamento che vuoi vedere nel mondo.", author: "Mahatma Gandhi" },
  { content: "La logica vi porterà da A a B. L'immaginazione vi porterà dappertutto.", author: "Albert Einstein" },
  { content: "Il successo non è definitivo, il fallimento non è fatale: ciò che conta è il coraggio di andare avanti.", author: "Winston Churchill" },
  { content: "Non smettere mai di sognare, solo chi sogna può volare.", author: "Peter Pan" },
  { content: "Follia è fare sempre la stessa cosa aspettandosi risultati diversi.", author: "Albert Einstein" },
  { content: "Il modo migliore per predire il tuo futuro è crearlo.", author: "Abraham Lincoln" },
  { content: "Le grandi menti parlano di idee, le menti mediocri parlano di fatti, le menti piccole parlano di persone.", author: "Eleanor Roosevelt" },
  { content: "Non ho fallito. Ho solo trovato 10.000 modi che non funzioneranno.", author: "Thomas A. Edison" },
  { content: "Scegli un lavoro che ami, e non dovrai lavorare neppure un giorno in vita tua.", author: "Confucio" },
  { content: "La misura dell'intelligenza è la capacità di cambiare.", author: "Albert Einstein" },
  { content: "Rischia più di quanto gli altri considerino sicuro. Sogna più di quanto gli altri considerino pratico.", author: "Howard Schultz" },
  { content: "L'unico limite alle nostre realizzazioni di domani saranno i nostri dubbi di oggi.", author: "Franklin D. Roosevelt" },
  { content: "Sii te stesso; tutti gli altri sono già stati presi.", author: "Oscar Wilde" }
];

const Quote = () => {
  const [quote, setQuote] = useState<QuoteData | null>(null);

  useEffect(() => {
    const CACHE_MINUTES = 5;
    const CACHE_KEY = 'startpage_quote_cache';
    
    // Simulate an async fetch but use a super reliable local database to guarantee Italian language and zero CORS/latency
    const fetchQuote = async () => {
      const cached = localStorage.getItem(CACHE_KEY);
      const now = Date.now();

      if (cached) {
        try {
          const parsed = JSON.parse(cached) as QuoteData;
          // Check if cache is still valid
          if (now - parsed.timestamp < CACHE_MINUTES * 60 * 1000) {
            setQuote(parsed);
            return;
          }
        } catch {
          // ignore parsing error
        }
      }

      // Generate a new random quote
      const randomIndex = Math.floor(Math.random() * ITALIAN_QUOTES.length);
      const selected = ITALIAN_QUOTES[randomIndex];
      
      const newQuote: QuoteData = {
        content: selected.content,
        author: selected.author,
        timestamp: now
      };
      
      setQuote(newQuote);
      localStorage.setItem(CACHE_KEY, JSON.stringify(newQuote));
    };
    
    fetchQuote();
  }, []);

  if (!quote) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center text-center p-6 bg-slate-800/30 border border-slate-700/50 rounded-3xl backdrop-blur-md shadow-lg group hover:bg-slate-800/40 transition-colors w-full h-full min-h-[140px]"
    >
      <QuoteIcon className="w-8 h-8 text-blue-400/50 mb-4 group-hover:text-blue-400 transition-colors" />
      <p className="text-lg md:text-xl text-slate-200 font-medium italic mb-4 leading-relaxed">
        "{quote.content}"
      </p>
      <span className="text-sm font-semibold text-slate-400 tracking-wider uppercase">
        — {quote.author}
      </span>
    </motion.div>
  );
};

export default Quote;
