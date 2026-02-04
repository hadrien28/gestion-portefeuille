import { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Calculator, Percent, TrendingUp, TrendingDown, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CalculationResult {
  percentage: number;
  result: number;
  remaining: number;
}

export function CalculatorPage() {
  const [amount, setAmount] = useState<string>('');
  const [percentage, setPercentage] = useState<number>(80);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [calcAccumulator, setCalcAccumulator] = useState<number | null>(null);
  const [calcOperator, setCalcOperator] = useState<string | null>(null);
  const [calcWaitingForNew, setCalcWaitingForNew] = useState(false);

  // Quick calculations history - can be used for future feature
  // const [history, setHistory] = useState<CalculationResult[]>([]);

  useEffect(() => {
    const numAmount = parseFloat(amount);
    if (!isNaN(numAmount) && numAmount > 0) {
      const calcResult = {
        percentage,
        result: (numAmount * percentage) / 100,
        remaining: numAmount - (numAmount * percentage) / 100,
      };
      setResult(calcResult);
    } else {
      setResult(null);
    }
  }, [amount, percentage]);

  const handleCopy = (value: number) => {
    navigator.clipboard.writeText(value.toFixed(2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const quickPercentages = [10, 25, 50, 75, 80, 90, 100];

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    []
  );
  const formatCurrency = (value: number) => currencyFormatter.format(value);

  const handleCalcDigit = (digit: string) => {
    if (calcWaitingForNew) {
      setCalcDisplay(digit);
      setCalcWaitingForNew(false);
      return;
    }

    setCalcDisplay((prev) => (prev === '0' ? digit : `${prev}${digit}`));
  };

  const handleCalcDecimal = () => {
    if (calcWaitingForNew) {
      setCalcDisplay('0.');
      setCalcWaitingForNew(false);
      return;
    }

    if (!calcDisplay.includes('.')) {
      setCalcDisplay((prev) => `${prev}.`);
    }
  };

  const handleCalcClear = () => {
    setCalcDisplay('0');
    setCalcAccumulator(null);
    setCalcOperator(null);
    setCalcWaitingForNew(false);
  };

  const handleCalcBackspace = () => {
    if (calcWaitingForNew) {
      setCalcDisplay('0');
      setCalcWaitingForNew(false);
      return;
    }

    setCalcDisplay((prev) => {
      if (prev.length <= 1) return '0';
      if (prev.length === 2 && prev.startsWith('-')) return '0';
      return prev.slice(0, -1);
    });
  };

  const handleCalcToggleSign = () => {
    if (calcDisplay === '0') return;
    setCalcDisplay((prev) => (prev.startsWith('-') ? prev.slice(1) : `-${prev}`));
  };

  const handleCalcPercent = () => {
    const currentValue = parseFloat(calcDisplay);
    if (Number.isNaN(currentValue)) return;
    setCalcDisplay((currentValue / 100).toString());
  };

  const performCalcOperation = (current: number, next: number, operator: string) => {
    switch (operator) {
      case '+':
        return current + next;
      case '-':
        return current - next;
      case '×':
        return current * next;
      case '÷':
        return next === 0 ? 0 : current / next;
      default:
        return next;
    }
  };

  const handleCalcOperator = (nextOperator: string) => {
    const nextValue = parseFloat(calcDisplay);
    if (Number.isNaN(nextValue)) return;

    if (calcAccumulator === null) {
      setCalcAccumulator(nextValue);
    } else if (calcOperator) {
      const resultValue = performCalcOperation(calcAccumulator, nextValue, calcOperator);
      setCalcAccumulator(resultValue);
      setCalcDisplay(resultValue.toString());
    }

    setCalcOperator(nextOperator);
    setCalcWaitingForNew(true);
  };

  const handleCalcEquals = () => {
    const nextValue = parseFloat(calcDisplay);
    if (Number.isNaN(nextValue) || calcAccumulator === null || !calcOperator) return;

    const resultValue = performCalcOperation(calcAccumulator, nextValue, calcOperator);
    setCalcDisplay(resultValue.toString());
    setCalcAccumulator(null);
    setCalcOperator(null);
    setCalcWaitingForNew(true);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      const { key } = event;

      if (key >= '0' && key <= '9') {
        event.preventDefault();
        handleCalcDigit(key);
        return;
      }

      if (key === '.' || key === ',') {
        event.preventDefault();
        handleCalcDecimal();
        return;
      }

      if (key === '+' || key === '-' || key === '*' || key === '/') {
        event.preventDefault();
        const operator = key === '*' ? '×' : key === '/' ? '÷' : key;
        handleCalcOperator(operator);
        return;
      }

      if (key === 'Backspace' || key === 'Delete') {
        event.preventDefault();
        handleCalcBackspace();
        return;
      }

      if (key === 'Enter' || key === '=') {
        event.preventDefault();
        handleCalcEquals();
        return;
      }

      if (key === 'Escape') {
        event.preventDefault();
        handleCalcClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handleCalcBackspace,
    handleCalcClear,
    handleCalcDecimal,
    handleCalcDigit,
    handleCalcEquals,
    handleCalcOperator,
  ]);

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Calculateur
        </h1>
        <p className="text-muted-foreground mt-1">
          Calculez rapidement vos pourcentages d'investissement
        </p>
      </div>

      {/* Main Calculator + Calculator */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Calculateur de pourcentage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Amount Input */}
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-lg">Montant total</Label>
              <div className="relative">
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Entrez un montant (ex: 1000)"
                  className="glass-input text-lg h-14 pl-4"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  €
                </span>
              </div>
            </div>

            {/* Percentage Slider */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg flex items-center gap-2">
                  <Percent className="w-4 h-4" />
                  Pourcentage
                </Label>
                <span className="text-2xl font-bold text-primary">{percentage}%</span>
              </div>
              <Slider
                value={[percentage]}
                onValueChange={(value) => setPercentage(value[0])}
                min={0}
                max={100}
                step={1}
                className="py-4"
              />
              <div className="flex flex-wrap gap-2">
                {quickPercentages.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPercentage(p)}
                    className={`
                      px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200
                      ${percentage === p
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      }
                    `}
                  >
                    {p}%
                  </button>
                ))}
              </div>
            </div>

            {/* Result */}
            {result && (
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Main Result */}
                  <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/20">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          Résultat ({percentage}%)
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleCopy(result.result)}
                        >
                          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                      <div className="text-3xl font-bold text-primary">
                        {formatCurrency(result.result)}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Remaining */}
                  <Card className="bg-secondary/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <TrendingDown className="w-4 h-4" />
                          Reste ({100 - percentage}%)
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleCopy(result.remaining)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="text-3xl font-bold">
                        {formatCurrency(result.remaining)}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Visual Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                  <div className="h-4 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-primary font-medium">
                      {formatCurrency(result.result)} ({percentage}%)
                    </span>
                    <span className="text-muted-foreground">
                      {formatCurrency(result.remaining)} ({100 - percentage}%)
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Calculatrice
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-border/60 bg-secondary/30 px-4 py-6 text-right">
              <div className="text-sm text-muted-foreground">Affichage</div>
              <div className="text-3xl font-bold tracking-tight text-foreground truncate">
                {calcDisplay}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <Button variant="secondary" onClick={handleCalcClear} className="h-12">AC</Button>
              <Button variant="secondary" onClick={handleCalcBackspace} className="h-12">DEL</Button>
              <Button variant="secondary" onClick={handleCalcToggleSign} className="h-12">±</Button>
              <Button variant="secondary" onClick={handleCalcPercent} className="h-12">%</Button>

              <Button variant="outline" onClick={() => handleCalcDigit('7')} className="h-12">7</Button>
              <Button variant="outline" onClick={() => handleCalcDigit('8')} className="h-12">8</Button>
              <Button variant="outline" onClick={() => handleCalcDigit('9')} className="h-12">9</Button>
              <Button onClick={() => handleCalcOperator('÷')} className="h-12">÷</Button>

              <Button variant="outline" onClick={() => handleCalcDigit('4')} className="h-12">4</Button>
              <Button variant="outline" onClick={() => handleCalcDigit('5')} className="h-12">5</Button>
              <Button variant="outline" onClick={() => handleCalcDigit('6')} className="h-12">6</Button>
              <Button onClick={() => handleCalcOperator('×')} className="h-12">×</Button>

              <Button variant="outline" onClick={() => handleCalcDigit('1')} className="h-12">1</Button>
              <Button variant="outline" onClick={() => handleCalcDigit('2')} className="h-12">2</Button>
              <Button variant="outline" onClick={() => handleCalcDigit('3')} className="h-12">3</Button>
              <Button onClick={() => handleCalcOperator('-')} className="h-12">-</Button>

              <Button variant="outline" onClick={() => handleCalcDigit('0')} className="h-12 col-span-2">0</Button>
              <Button variant="outline" onClick={handleCalcDecimal} className="h-12">.</Button>
              <Button onClick={() => handleCalcOperator('+')} className="h-12">+</Button>
              <Button className="h-12 col-span-4" onClick={handleCalcEquals}>=</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Reference Table */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Table de référence rapide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {[5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90, 95, 100].map((pct) => {
              const numAmount = parseFloat(amount) || 100;
              const value = (numAmount * pct) / 100;
              return (
                <button
                  key={pct}
                  onClick={() => {
                    setPercentage(pct);
                    if (!amount) setAmount('100');
                  }}
                  className="p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors text-left"
                >
                  <div className="text-sm text-muted-foreground">{pct}%</div>
                  <div className="font-semibold">{formatCurrency(value)}</div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Investment Split Calculator */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Répartition PEA / CTO suggérée</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Basé sur votre montant de {formatCurrency(parseFloat(amount) || 0)}, voici une répartition suggérée :
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="bg-emerald-500/10 border-emerald-500/20">
                <CardContent className="p-4 text-center">
                  <div className="text-sm text-emerald-600 dark:text-emerald-400 mb-1">PEA (60%)</div>
                  <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency((parseFloat(amount) || 0) * 0.6)}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-blue-500/10 border-blue-500/20">
                <CardContent className="p-4 text-center">
                  <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">CTO (30%)</div>
                  <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {formatCurrency((parseFloat(amount) || 0) * 0.3)}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-amber-500/10 border-amber-500/20">
                <CardContent className="p-4 text-center">
                  <div className="text-sm text-amber-600 dark:text-amber-400 mb-1">Liquidité (10%)</div>
                  <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
                    {formatCurrency((parseFloat(amount) || 0) * 0.1)}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
