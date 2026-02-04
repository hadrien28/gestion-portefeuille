import { useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation } from '@/sections/Navigation';
import { PortfolioPage } from '@/sections/PortfolioPage';
import { StatsPage } from '@/sections/StatsPage';
import { CalculatorPage } from '@/sections/CalculatorPage';
import { AllocationPage } from '@/sections/AllocationPage';
import { useTheme } from '@/hooks/useTheme';
import { Target, Calendar, Wallet, TrendingDown, Download, Upload } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGoals } from '@/hooks/useGoals';
import { useInvestments } from '@/hooks/useInvestments';

type Page = 'portfolio' | 'allocation' | 'stats' | 'calculator';

function GoalsDialog() {
  const { goals, updateGoal, exportToJSON, importFromJSON } = useGoals();
  const { getGrandTotal, getTotalByAccount } = useInvestments();
  
  const totalPEA = getTotalByAccount('pea');
  const totalCTO = getTotalByAccount('cto');
  const grandTotal = getGrandTotal();
  
  // Current month investment simplified for header display
  const currentMonthInvestment = 0;
  
  const monthlyProgress = Math.min((currentMonthInvestment / goals.monthlyTarget) * 100, 100);
  const yearlyProgress = Math.min((grandTotal / goals.yearlyTarget) * 100, 100);
  const peaProgress = Math.min((totalPEA / goals.peaTarget) * 100, 100);
  const ctoProgress = Math.min((totalCTO / goals.ctoTarget) * 100, 100);

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
      }),
    []
  );
  const formatCurrency = (amount: number) => currencyFormatter.format(amount);

  const handleImport = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const content = readerEvent.target?.result as string;
        if (importFromJSON(content)) {
          alert('Objectifs importés avec succès.');
        } else {
          alert('Impossible d\'importer ce fichier.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <DialogContent className="glass-dialog sm:max-w-md rounded-3xl border-0 max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-3 text-2xl">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
            <Target className="w-5 h-5 text-primary-foreground" />
          </div>
          Mes objectifs
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-6 pt-4">
        <div className="flex flex-wrap gap-2">
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
            id="import-goals-file"
          />
          <label htmlFor="import-goals-file">
            <Button variant="outline" className="glass-button rounded-xl" asChild>
              <span>
                <Upload className="w-4 h-4 mr-2" />
                Importer
              </span>
            </Button>
          </label>
          <Button variant="outline" onClick={exportToJSON} className="glass-button rounded-xl">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
        </div>
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Calendar className="w-4 h-4 text-primary" />
            Objectif mensuel
          </Label>
          <div className="flex gap-2">
            <Input
              type="number"
              value={goals.monthlyTarget}
              onChange={(e) => updateGoal('monthlyTarget', Number(e.target.value))}
              className="glass-input h-12 rounded-xl"
            />
            <span className="flex items-center text-muted-foreground font-medium">€</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-primary to-primary/70"
              initial={{ width: 0 }}
              animate={{ width: `${monthlyProgress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Progression: {Math.round(monthlyProgress)}%
          </p>
        </div>

        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Target className="w-4 h-4 text-amber-500" />
            Objectif annuel
          </Label>
          <div className="flex gap-2">
            <Input
              type="number"
              value={goals.yearlyTarget}
              onChange={(e) => updateGoal('yearlyTarget', Number(e.target.value))}
              className="glass-input h-12 rounded-xl"
            />
            <span className="flex items-center text-muted-foreground font-medium">€</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-amber-500 to-amber-600"
              initial={{ width: 0 }}
              animate={{ width: `${yearlyProgress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {formatCurrency(grandTotal)} / {formatCurrency(goals.yearlyTarget)}
          </p>
        </div>

        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm font-medium text-emerald-500">
            <Wallet className="w-4 h-4" />
            Objectif PEA
          </Label>
          <div className="flex gap-2">
            <Input
              type="number"
              value={goals.peaTarget}
              onChange={(e) => updateGoal('peaTarget', Number(e.target.value))}
              className="glass-input h-12 rounded-xl"
            />
            <span className="flex items-center text-muted-foreground font-medium">€</span>
          </div>
          <div className="h-2 bg-emerald-500/20 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
              initial={{ width: 0 }}
              animate={{ width: `${peaProgress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {formatCurrency(totalPEA)} / {formatCurrency(goals.peaTarget)}
          </p>
        </div>

        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm font-medium text-blue-500">
            <TrendingDown className="w-4 h-4" />
            Objectif CTO
          </Label>
          <div className="flex gap-2">
            <Input
              type="number"
              value={goals.ctoTarget}
              onChange={(e) => updateGoal('ctoTarget', Number(e.target.value))}
              className="glass-input h-12 rounded-xl"
            />
            <span className="flex items-center text-muted-foreground font-medium">€</span>
          </div>
          <div className="h-2 bg-blue-500/20 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-blue-500 to-blue-400"
              initial={{ width: 0 }}
              animate={{ width: `${ctoProgress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {formatCurrency(totalCTO)} / {formatCurrency(goals.ctoTarget)}
          </p>
        </div>
      </div>
    </DialogContent>
  );
}

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('portfolio');
  const { isDark, toggleTheme } = useTheme();
  const [goalsOpen, setGoalsOpen] = useState(false);

  const renderPage = () => {
    switch (currentPage) {
      case 'portfolio':
        return <PortfolioPage />;
      case 'stats':
        return <StatsPage />;
      case 'calculator':
        return <CalculatorPage />;
      case 'allocation':
        return <AllocationPage />;
      default:
        return <PortfolioPage />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Background (static for better performance) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Gradient Orbs */}
        <div
          className="absolute top-0 left-1/4 w-[520px] h-[520px] rounded-full opacity-25 dark:opacity-20"
          style={{
            background: 'radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)',
            filter: 'blur(90px)',
          }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-[420px] h-[420px] rounded-full opacity-20 dark:opacity-15"
          style={{
            background: 'radial-gradient(circle, hsl(var(--secondary)) 0%, transparent 70%)',
            filter: 'blur(70px)',
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[640px] h-[640px] rounded-full opacity-10 dark:opacity-10"
          style={{
            background: 'radial-gradient(circle, hsl(var(--accent)) 0%, transparent 70%)',
            filter: 'blur(100px)',
          }}
        />
        
        {/* Noise Texture Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Main Content */}
      <main className="relative z-10 min-h-screen">
        <div className="container mx-auto px-4 py-4 sm:py-6 max-w-6xl">
          {/* Logo Header */}
          <motion.header 
            className="mb-6 sm:mb-8 flex items-center justify-between"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
                <svg 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground"
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  <path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 16l4-4 4 4 6-6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold">InvestTrack</h1>
                <p className="text-xs text-muted-foreground">Pro</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Goals Button - Mobile friendly */}
              <Dialog open={goalsOpen} onOpenChange={setGoalsOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="glass-button rounded-xl gap-2"
                  >
                    <Target className="w-4 h-4" />
                    <span className="hidden sm:inline">Objectifs</span>
                  </Button>
                </DialogTrigger>
                <GoalsDialog />
              </Dialog>

              {/* Page Indicator */}
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full glass-panel">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm text-muted-foreground">
                  {currentPage === 'portfolio' && 'Portefeuille'}
                  {currentPage === 'allocation' && 'Répartition'}
                  {currentPage === 'stats' && 'Statistiques'}
                  {currentPage === 'calculator' && 'Calculateur'}
                </span>
              </div>
            </div>
          </motion.header>

          {/* Page Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Navigation */}
      <Navigation 
        currentPage={currentPage} 
        onPageChange={setCurrentPage}
        isDark={isDark}
        onToggleTheme={toggleTheme}
      />
    </div>
  );
}

export default App;
