import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from './ui/dropdown-menu';
import { Globe, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage, availableLanguages } = useLanguage();
  
  const currentLang = availableLanguages.find(l => l.code === language) || availableLanguages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative flex items-center gap-2 rounded-xl border border-border/60 bg-white/80 dark:bg-black/80 px-3 py-2 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-4 focus:ring-primary/10 notranslate">
          <Globe className="h-4 w-4 text-primary" />
          <span className="hidden md:inline-block">{currentLang.nativeName}</span>
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-[280px] p-2 bg-background/95 backdrop-blur-xl border-border/60 shadow-xl rounded-xl mt-2 overflow-hidden notranslate">
        <DropdownMenuLabel className="text-xs text-muted-foreground font-semibold px-2 pb-2">
          Select Language
        </DropdownMenuLabel>
        <div className="grid grid-cols-1 gap-1 max-h-[300px] overflow-y-auto pr-1">
          {availableLanguages.map((lang) => {
            const isActive = lang.code === language;
            return (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`relative flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm transition-colors cursor-pointer group ${
                  isActive 
                    ? 'bg-primary/10 text-primary font-medium' 
                    : 'hover:bg-accent hover:text-accent-foreground text-foreground'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeLang"
                    className="absolute inset-0 bg-primary/10 rounded-lg -z-10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="text-xl shadow-sm rounded-sm overflow-hidden">{lang.flag}</span>
                <div className="flex flex-col items-start leading-tight flex-1">
                  <span className="font-semibold">{lang.nativeName}</span>
                  <span className="text-[10px] opacity-70 group-hover:opacity-100 transition-opacity">{lang.name}</span>
                </div>
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-primary"
                  >
                    <Check className="h-3 w-3" />
                  </motion.div>
                )}
              </DropdownMenuItem>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
