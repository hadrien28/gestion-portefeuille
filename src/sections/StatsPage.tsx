import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, PieChart as PieChartIcon, BarChart3, Calendar, Target, Wallet, TrendingDown } from 'lucide-react';
import { useInvestments } from '@/hooks/useInvestments';
import { useGoals } from '@/hooks/useGoals';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Colors for charts
const PEA_COLOR = '#10b981';
const CTO_COLOR = '#3b82f6';
const ACTION_COLOR = '#f59e0b';
const ETF_COLOR = '#8b5cf6';

export function StatsPage() {
  const {
    getMonthlyData,
    investments,
  } = useInvestments();

  const { goals, updateGoal } = useGoals();

  const monthlyData = useMemo(() => getMonthlyData(), [getMonthlyData]);

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

  const formatMonthLabel = (value: string | number | undefined) => {
    if (value === undefined || value === null) return '';
    const raw = String(value);
    if (!raw.includes('-')) return raw;
    const [year, month] = raw.split('-');
    const date = new Date(Number(year), Number(month) - 1, 1);
    if (Number.isNaN(date.getTime())) return raw;
    const formatted = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  const ChartTooltip = ({
    active,
    payload,
    label,
    labelFormatter,
  }: {
    active?: boolean;
    payload?: Array<{ name?: string; value?: number; color?: string; fill?: string; dataKey?: string }>;
    label?: string | number;
    labelFormatter?: (value: string | number | undefined) => string;
  }) => {
    if (!active || !payload || payload.length === 0) return null;

    const formattedLabel = labelFormatter ? labelFormatter(label) : label ? String(label) : '';
    const heading = formattedLabel || payload[0]?.name || payload[0]?.dataKey || '';

    return (
      <div className="rounded-2xl border border-white/30 bg-white/85 px-4 py-3 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-black/70">
        {heading && <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{heading}</div>}
        <div className="mt-2 space-y-1.5">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-3 text-sm">
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: entry.color ?? entry.fill ?? 'currentColor' }}
                />
                <span className="text-muted-foreground">{entry.name ?? entry.dataKey}</span>
              </div>
              <span className="font-semibold">{formatCurrency(entry.value ?? 0)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderTooltip =
    (labelFormatter?: (value: string | number | undefined) => string) => (props: any) =>
      <ChartTooltip {...props} labelFormatter={labelFormatter} />;

  const totals = useMemo(() => {
    let pea = 0;
    let cto = 0;
    let actions = 0;
    let etfs = 0;
    let peaActions = 0;
    let peaEtfs = 0;
    let ctoActions = 0;
    let ctoEtfs = 0;

    for (const inv of investments) {
      if (inv.account === 'pea') {
        pea += inv.amount;
        if (inv.type === 'action') {
          peaActions += inv.amount;
        } else {
          peaEtfs += inv.amount;
        }
      } else {
        cto += inv.amount;
        if (inv.type === 'action') {
          ctoActions += inv.amount;
        } else {
          ctoEtfs += inv.amount;
        }
      }

      if (inv.type === 'action') {
        actions += inv.amount;
      } else {
        etfs += inv.amount;
      }
    }

    return {
      pea,
      cto,
      actions,
      etfs,
      peaActions,
      peaEtfs,
      ctoActions,
      ctoEtfs,
      grandTotal: pea + cto,
    };
  }, [investments]);

  const totalPEA = totals.pea;
  const totalCTO = totals.cto;
  const totalActions = totals.actions;
  const totalETFs = totals.etfs;
  const grandTotal = totals.grandTotal;
  const peaActions = totals.peaActions;
  const peaEtfs = totals.peaEtfs;
  const ctoActions = totals.ctoActions;
  const ctoEtfs = totals.ctoEtfs;

  // Calculate current month investment
  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentMonthInvestment = useMemo(() => {
    return investments
      .filter(inv => inv.date.startsWith(currentMonth))
      .reduce((sum, inv) => sum + inv.amount, 0);
  }, [investments, currentMonth]);

  // Calculate cumulative data for area chart with separate PEA/CTO lines
  const cumulativeData = useMemo(() => {
    let cumulativePEA = 0;
    let cumulativeCTO = 0;
    
    // Group by month and calculate cumulative
    const monthMap = new Map<string, { pea: number; cto: number }>();
    
    investments.forEach(inv => {
      const month = inv.date.slice(0, 7);
      const existing = monthMap.get(month) || { pea: 0, cto: 0 };
      if (inv.account === 'pea') {
        existing.pea += inv.amount;
      } else {
        existing.cto += inv.amount;
      }
      monthMap.set(month, existing);
    });

    const sortedMonths = Array.from(monthMap.entries()).sort(([a], [b]) => a.localeCompare(b));
    
    return sortedMonths.map(([month, data]) => {
      cumulativePEA += data.pea;
      cumulativeCTO += data.cto;
      return {
        month,
        pea: cumulativePEA,
        cto: cumulativeCTO,
        total: cumulativePEA + cumulativeCTO,
      };
    });
  }, [investments]);

  // Get top investments
  const topInvestments = useMemo(() => {
    return [...investments]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [investments]);

  // Calculate goal progress
  const monthlyProgress = Math.min((currentMonthInvestment / goals.monthlyTarget) * 100, 100);
  const yearlyProgress = Math.min((grandTotal / goals.yearlyTarget) * 100, 100);
  const peaProgress = Math.min((totalPEA / goals.peaTarget) * 100, 100);
  const ctoProgress = Math.min((totalCTO / goals.ctoTarget) * 100, 100);

  // Prepare data for pie charts with proper labels
  const accountPieData = [
    { name: 'PEA', value: totalPEA, color: PEA_COLOR },
    { name: 'CTO', value: totalCTO, color: CTO_COLOR },
  ].filter(item => item.value > 0);

  const typePieData = [
    { name: 'Actions', value: totalActions, color: ACTION_COLOR },
    { name: 'ETFs', value: totalETFs, color: ETF_COLOR },
  ].filter(item => item.value > 0);

  const peaTypePieData = [
    { name: 'Actions', value: peaActions, color: ACTION_COLOR },
    { name: 'ETFs', value: peaEtfs, color: ETF_COLOR },
  ].filter(item => item.value > 0);

  const ctoTypePieData = [
    { name: 'Actions', value: ctoActions, color: ACTION_COLOR },
    { name: 'ETFs', value: ctoEtfs, color: ETF_COLOR },
  ].filter(item => item.value > 0);

  const monthlyTotals = useMemo(() => {
    if (!monthlyData.length) return [];
    return monthlyData.slice(-6).reverse();
  }, [monthlyData]);

  return (
    <div className="space-y-6 pb-28">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Statistiques
          </h1>
          <p className="text-muted-foreground mt-1">
            Analysez la performance de vos investissements
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="glass-button gap-2">
              <Target className="w-4 h-4" />
              Objectifs
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-dialog sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Mes objectifs d'investissement
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 pt-4">
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Objectif mensuel
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={goals.monthlyTarget}
                    onChange={(e) => updateGoal('monthlyTarget', Number(e.target.value))}
                    className="glass-input"
                  />
                  <span className="flex items-center text-muted-foreground">€</span>
                </div>
                <Progress value={monthlyProgress} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(currentMonthInvestment)} / {formatCurrency(goals.monthlyTarget)}
                </p>
              </div>

              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Objectif annuel
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={goals.yearlyTarget}
                    onChange={(e) => updateGoal('yearlyTarget', Number(e.target.value))}
                    className="glass-input"
                  />
                  <span className="flex items-center text-muted-foreground">€</span>
                </div>
                <Progress value={yearlyProgress} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(grandTotal)} / {formatCurrency(goals.yearlyTarget)}
                </p>
              </div>

              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-emerald-500">
                  <Wallet className="w-4 h-4" />
                  Objectif PEA
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={goals.peaTarget}
                    onChange={(e) => updateGoal('peaTarget', Number(e.target.value))}
                    className="glass-input"
                  />
                  <span className="flex items-center text-muted-foreground">€</span>
                </div>
                <Progress value={peaProgress} className="h-2 bg-emerald-500/20" />
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(totalPEA)} / {formatCurrency(goals.peaTarget)}
                </p>
              </div>

              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-blue-500">
                  <TrendingDown className="w-4 h-4" />
                  Objectif CTO
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={goals.ctoTarget}
                    onChange={(e) => updateGoal('ctoTarget', Number(e.target.value))}
                    className="glass-input"
                  />
                  <span className="flex items-center text-muted-foreground">€</span>
                </div>
                <Progress value={ctoProgress} className="h-2 bg-blue-500/20" />
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(totalCTO)} / {formatCurrency(goals.ctoTarget)}
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Goals Progress Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Monthly Goal */}
        <Card className="glass-card overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">Ce mois-ci</span>
              </div>
              <span className="text-xs font-bold text-primary">{Math.round(monthlyProgress)}%</span>
            </div>
            <div className="text-2xl font-bold mb-2">{formatCurrency(currentMonthInvestment)}</div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500"
                style={{ width: `${monthlyProgress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Objectif: {formatCurrency(goals.monthlyTarget)}
            </p>
          </CardContent>
        </Card>

        {/* Yearly Goal */}
        <Card className="glass-card overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                  <Target className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">Objectif annuel</span>
              </div>
              <span className="text-xs font-bold text-amber-500">{Math.round(yearlyProgress)}%</span>
            </div>
            <div className="text-2xl font-bold mb-2">{formatCurrency(grandTotal)}</div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-500"
                style={{ width: `${yearlyProgress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Objectif: {formatCurrency(goals.yearlyTarget)}
            </p>
          </CardContent>
        </Card>

        {/* PEA Goal */}
        <Card className="glass-card overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">PEA</span>
              </div>
              <span className="text-xs font-bold text-emerald-500">{Math.round(peaProgress)}%</span>
            </div>
            <div className="text-2xl font-bold text-emerald-500 mb-2">{formatCurrency(totalPEA)}</div>
            <div className="h-2 bg-emerald-500/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${peaProgress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Objectif: {formatCurrency(goals.peaTarget)}
            </p>
          </CardContent>
        </Card>

        {/* CTO Goal */}
        <Card className="glass-card overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <TrendingDown className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">CTO</span>
              </div>
              <span className="text-xs font-bold text-blue-500">{Math.round(ctoProgress)}%</span>
            </div>
            <div className="text-2xl font-bold text-blue-500 mb-2">{formatCurrency(totalCTO)}</div>
            <div className="h-2 bg-blue-500/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500"
                style={{ width: `${ctoProgress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Objectif: {formatCurrency(goals.ctoTarget)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Evolution Chart - Two Lines */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Évolution du portefeuille
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cumulativeData}>
                <defs>
                  <linearGradient id="colorPEA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PEA_COLOR} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={PEA_COLOR} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCTO" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CTO_COLOR} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={CTO_COLOR} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="month"
                  tickFormatter={(value) => {
                    const [year, month] = value.split('-');
                    return `${month}/${year.slice(2)}`;
                  }}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                />
                <YAxis
                  tickFormatter={(value) => formatCurrency(value)}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  width={70}
                />
                <Tooltip
                  content={renderTooltip(formatMonthLabel)}
                  cursor={{ fill: 'transparent' }}
                  allowEscapeViewBox={{ x: false, y: false }}
                  wrapperStyle={{ outline: 'none' }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="pea"
                  name="PEA"
                  stroke={PEA_COLOR}
                  fillOpacity={1}
                  fill="url(#colorPEA)"
                  strokeWidth={3}
                  isAnimationActive={false}
                />
                <Area
                  type="monotone"
                  dataKey="cto"
                  name="CTO"
                  stroke={CTO_COLOR}
                  fillOpacity={1}
                  fill="url(#colorCTO)"
                  strokeWidth={3}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Investment Chart */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Investissements mensuels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="month"
                  tickFormatter={(value) => {
                    const [year, month] = value.split('-');
                    return `${month}/${year.slice(2)}`;
                  }}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                />
                <YAxis
                  tickFormatter={(value) => formatCurrency(value)}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  width={70}
                />
                <Tooltip
                  content={renderTooltip(formatMonthLabel)}
                  cursor={{ fill: 'transparent' }}
                  allowEscapeViewBox={{ x: false, y: false }}
                  wrapperStyle={{ outline: 'none' }}
                />
                <Legend />
                <Bar dataKey="pea" name="PEA" fill={PEA_COLOR} radius={[6, 6, 0, 0]} isAnimationActive={false} />
                <Bar dataKey="cto" name="CTO" fill={CTO_COLOR} radius={[6, 6, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Totals */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Totaux mensuels
          </CardTitle>
        </CardHeader>
        <CardContent>
          {monthlyTotals.length === 0 ? (
            <div className="text-sm text-muted-foreground">Aucune donnée disponible</div>
          ) : (
            <div className="space-y-3">
              {monthlyTotals.map((item) => (
                <div
                  key={item.month}
                  className="flex items-center justify-between rounded-2xl border border-white/30 bg-white/70 px-4 py-3 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/5"
                >
                  <span className="text-sm font-semibold">{formatMonthLabel(item.month)}</span>
                  <span className="text-sm font-semibold">{formatCurrency(item.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Distribution */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="w-5 h-5" />
              Répartition PEA / CTO
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              {accountPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={accountPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                      isAnimationActive={false}
                    >
                      {accountPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={renderTooltip()} />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      formatter={(value) => <span className="text-foreground">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Aucune donnée disponible
                </div>
              )}
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="text-center p-3 rounded-xl bg-emerald-500/10">
                <div className="text-2xl font-bold text-emerald-500">{formatCurrency(totalPEA)}</div>
                <div className="text-sm text-muted-foreground">PEA</div>
              </div>
              <div className="text-center p-3 rounded-xl bg-blue-500/10">
                <div className="text-2xl font-bold text-blue-500">{formatCurrency(totalCTO)}</div>
                <div className="text-sm text-muted-foreground">CTO</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Type Distribution */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="w-5 h-5" />
              Répartition Actions / ETFs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              {typePieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={typePieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                      isAnimationActive={false}
                    >
                      {typePieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={renderTooltip()} />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      formatter={(value) => <span className="text-foreground">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Aucune donnée disponible
                </div>
              )}
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="text-center p-3 rounded-xl bg-amber-500/10">
                <div className="text-2xl font-bold text-amber-500">{formatCurrency(totalActions)}</div>
                <div className="text-sm text-muted-foreground">Actions</div>
              </div>
              <div className="text-center p-3 rounded-xl bg-purple-500/10">
                <div className="text-2xl font-bold text-purple-500">{formatCurrency(totalETFs)}</div>
                <div className="text-sm text-muted-foreground">ETFs</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions/ETFs by Account */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="w-5 h-5" />
            Répartition Actions / ETFs par compte
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-emerald-500">PEA</span>
                <span className="text-xs text-muted-foreground">{formatCurrency(totalPEA)}</span>
              </div>
              <div className="h-[220px]">
                {peaTypePieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={peaTypePieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                        isAnimationActive={false}
                      >
                        {peaTypePieData.map((entry, index) => (
                          <Cell key={`pea-cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={renderTooltip()} />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value) => <span className="text-foreground">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    Aucune donnée disponible
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-blue-500">CTO</span>
                <span className="text-xs text-muted-foreground">{formatCurrency(totalCTO)}</span>
              </div>
              <div className="h-[220px]">
                {ctoTypePieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={ctoTypePieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                        isAnimationActive={false}
                      >
                        {ctoTypePieData.map((entry, index) => (
                          <Cell key={`cto-cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={renderTooltip()} />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value) => <span className="text-foreground">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    Aucune donnée disponible
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Investments */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Top 5 investissements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topInvestments.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Aucun investissement</p>
            ) : (
              topInvestments.map((inv, index) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-secondary/50 to-secondary/30 hover:from-secondary/70 hover:to-secondary/50 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-sm font-bold text-primary-foreground shadow-lg">
                      #{index + 1}
                    </div>
                    <div>
                      <div className="font-semibold">{inv.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <span className={inv.type === 'action' ? 'text-amber-500' : 'text-purple-500'}>
                          {inv.type === 'action' ? 'Action' : 'ETF'}
                        </span>
                        <span>•</span>
                        <span className={inv.account === 'pea' ? 'text-emerald-500' : 'text-blue-500'}>
                          {inv.account.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">{formatCurrency(inv.amount)}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(inv.date).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
