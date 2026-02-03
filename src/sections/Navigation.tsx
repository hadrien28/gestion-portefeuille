import { Wallet, BarChart3, Calculator, Moon, Sun, PieChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

type Page = 'portfolio' | 'allocation' | 'stats' | 'calculator';

interface NavigationProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export function Navigation({ currentPage, onPageChange, isDark, onToggleTheme }: NavigationProps) {
  const navItems: { id: Page; label: string; icon: React.ElementType }[] = [
    { id: 'portfolio', label: 'Portefeuille', icon: Wallet },
    { id: 'allocation', label: 'Répartition', icon: PieChart },
    { id: 'stats', label: 'Statistiques', icon: BarChart3 },
    { id: 'calculator', label: 'Calculateur', icon: Calculator },
  ];

  return (
    <nav className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md sm:w-auto">
      <div className="glass-panel rounded-2xl sm:rounded-full px-2 py-2 flex items-center justify-between sm:justify-center gap-1 shadow-2xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`
                relative flex items-center gap-2 px-3 sm:px-4 py-3 rounded-xl sm:rounded-full transition-all duration-300
                ${isActive 
                  ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span className={`text-sm font-medium transition-all duration-300 ${isActive ? 'max-w-[100px] opacity-100' : 'max-w-0 sm:max-w-0 opacity-0 overflow-hidden'}`}>
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 rounded-xl sm:rounded-full -z-10"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          );
        })}
        
        <div className="w-px h-6 bg-border mx-1 sm:mx-2" />
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleTheme}
          className="rounded-xl sm:rounded-full w-10 h-10 text-muted-foreground hover:text-foreground hover:bg-white/5"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>
      </div>
    </nav>
  );
}
