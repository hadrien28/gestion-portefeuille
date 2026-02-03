import { useMemo, type ReactNode } from 'react';
import { Plus, Trash2, PieChart, Wallet, Building2, Pencil } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { useAllocationPlan } from '@/hooks/useAllocationPlan';
import type { AccountType, AllocationItem, InvestmentType } from '@/types';

const clampPercent = (value: number) => Math.min(100, Math.max(0, Math.round(value)));

export function AllocationPage() {
  const { plan, setMonthlyAmount, setPeaPercent, addItem, updateItem, removeItem, setGroupPercent } =
    useAllocationPlan();

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

  const monthlyAmount = plan.monthlyAmount;
  const peaPercent = plan.peaPercent;
  const ctoPercent = 100 - peaPercent;
  const peaAmount = (monthlyAmount * peaPercent) / 100;
  const ctoAmount = (monthlyAmount * ctoPercent) / 100;

  const handleMonthlyChange = (value: string) => {
    const parsed = Number(value);
    setMonthlyAmount(Number.isFinite(parsed) ? parsed : 0);
  };

  const handlePeaPercentChange = (value: number) => {
    setPeaPercent(clampPercent(value));
  };

  const handleCtoPercentChange = (value: number) => {
    setPeaPercent(clampPercent(100 - value));
  };

  const renderItemRow = (
    account: AccountType,
    item: AllocationItem,
    groupItems: AllocationItem[],
    groupAmount: number
  ) => {
    const sumOther = groupItems.reduce((sum, current) => (current.id === item.id ? sum : sum + current.percent), 0);
    const maxPercent = Math.max(0, 100 - sumOther);
    const itemAmount = (groupAmount * item.percent) / 100;

    const isConfirmed = Boolean(item.isConfirmed);
    const canConfirm = item.name.trim().length > 0;

    return (
      <div
        key={item.id}
        className="rounded-2xl border border-white/30 bg-white/70 px-4 py-3 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/5"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex-1 space-y-2">
            {isConfirmed ? (
              <div className="text-base font-semibold text-foreground break-words leading-snug">
                {item.name || 'Sans nom'}
              </div>
            ) : (
              <Input
                value={item.name}
                onChange={(event) => updateItem(account, item.id, { name: event.target.value })}
                placeholder="Nom de l'action ou ETF"
                className="h-9 rounded-none border-0 border-b border-border/60 bg-transparent px-0 shadow-none text-base focus-visible:ring-0 focus-visible:border-primary/60"
              />
            )}
            <div className="text-xs text-muted-foreground">Montant: {formatCurrency(itemAmount)}</div>
          </div>

          <div className="flex items-center gap-2 sm:shrink-0">
            <Input
              type="number"
              min={0}
              max={maxPercent}
              step={1}
              value={item.percent}
              onChange={(event) => {
                const nextValue = Number(event.target.value);
                updateItem(account, item.id, {
                  percent: Math.min(maxPercent, clampPercent(Number.isFinite(nextValue) ? nextValue : 0)),
                });
              }}
              className="glass-input h-9 w-20 text-right"
            />
            <span className="text-sm text-muted-foreground">%</span>
          </div>

          <div className="flex items-center gap-2 sm:ml-auto">
            <Button
              variant="outline"
              size="icon"
              className="glass-button rounded-xl"
              disabled={!isConfirmed && !canConfirm}
              onClick={() => updateItem(account, item.id, { isConfirmed: !isConfirmed })}
              title={isConfirmed ? 'Modifier' : 'Valider'}
              aria-label={isConfirmed ? 'Modifier' : 'Valider'}
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive"
              onClick={() => removeItem(account, item.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="pt-3">
          <Slider
            value={[item.percent]}
            onValueChange={(value) =>
              updateItem(account, item.id, {
                percent: Math.min(maxPercent, clampPercent(value[0])),
              })
            }
            min={0}
            max={maxPercent}
            step={1}
            className="py-2"
          />
        </div>
      </div>
    );
  };

  const renderGroup = (
    account: AccountType,
    label: string,
    type: InvestmentType,
    items: AllocationItem[],
    accountAmount: number,
    accentClass: string
  ) => {
    const groupPercent = plan.accounts[account].groupPercents[type];
    const otherType: InvestmentType = type === 'action' ? 'etf' : 'action';
    const otherPercent = plan.accounts[account].groupPercents[otherType];
    const maxGroupPercent = Math.max(0, 100 - otherPercent);
    const groupAmount = (accountAmount * groupPercent) / 100;

    const handleGroupPercentChange = (value: number) => {
      setGroupPercent(account, type, Math.min(maxGroupPercent, clampPercent(value)));
    };

    return (
      <div className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${accentClass}`} />
            <span className="font-semibold">{label}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex w-full items-center gap-2 rounded-xl border border-white/30 bg-white/70 px-3 py-1.5 backdrop-blur-md dark:border-white/10 dark:bg-white/5 sm:w-auto">
              <Input
                type="number"
                min={0}
                max={maxGroupPercent}
                step={1}
                value={groupPercent}
                onChange={(event) => handleGroupPercentChange(Number(event.target.value))}
                className="h-7 w-16 rounded-none border-0 border-b border-border/60 bg-transparent px-0 shadow-none text-right text-sm focus-visible:ring-0 focus-visible:border-primary/60"
              />
              <span className="text-xs text-muted-foreground">%</span>
              <span className="text-xs text-muted-foreground">{formatCurrency(groupAmount)}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="glass-button rounded-xl w-full sm:w-auto"
              onClick={() => addItem(account, type)}
            >
              <Plus className="w-4 h-4" />
              Ajouter
            </Button>
          </div>
        </div>
        <Slider
          value={[groupPercent]}
          onValueChange={(value) => handleGroupPercentChange(value[0])}
          min={0}
          max={maxGroupPercent}
          step={1}
          className="py-2"
        />
        {items.length === 0 ? (
          <div className="text-sm text-muted-foreground italic">Aucun élément pour l'instant.</div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => renderItemRow(account, item, items, groupAmount))}
          </div>
        )}
      </div>
    );
  };

  const renderAccountSection = (
    account: AccountType,
    title: string,
    percent: number,
    amount: number,
    accentClass: string,
    icon: ReactNode
  ) => {
    const accountItems = plan.accounts[account].items;
    const groupPercents = plan.accounts[account].groupPercents;
    const actions = accountItems.filter((item) => item.type === 'action');
    const etfs = accountItems.filter((item) => item.type === 'etf');
    const totalPercent = groupPercents.action + groupPercents.etf;
    const remainingPercent = Math.max(0, 100 - totalPercent);
    const remainingAmount = (amount * remainingPercent) / 100;

    return (
      <Card className="glass-card">
        <CardHeader className="space-y-2">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${accentClass}`}>
                {icon}
              </span>
              <span>{title}</span>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">{percent}%</div>
              <div className="font-semibold">{formatCurrency(amount)}</div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {renderGroup(account, 'Actions', 'action', actions, amount, 'bg-amber-500')}
          {renderGroup(account, 'ETFs', 'etf', etfs, amount, 'bg-purple-500')}

          <div className="flex items-center justify-between rounded-xl bg-secondary/40 border border-border/50 px-4 py-3">
            <span className="text-sm text-muted-foreground">Reste non alloué</span>
            <div className="text-right">
              <div className="text-sm font-semibold">{remainingPercent}%</div>
              <div className="text-xs text-muted-foreground">{formatCurrency(remainingAmount)}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderRecapList = (
    account: AccountType,
    title: string,
    amount: number,
    accentClass: string,
    icon: ReactNode
  ) => {
    const items = plan.accounts[account].items;
    const groupPercents = plan.accounts[account].groupPercents;
    const actions = items.filter((item) => item.type === 'action');
    const etfs = items.filter((item) => item.type === 'etf');

    const renderCategory = (label: string, list: AllocationItem[]) => {
      const categoryPercent = label === 'Actions' ? groupPercents.action : groupPercents.etf;
      const categoryAmount = (amount * categoryPercent) / 100;

      return (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm font-semibold tracking-wide text-foreground">{label}</div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{list.length} élément(s)</span>
              <span className="rounded-full border border-border/60 bg-secondary/60 px-2.5 py-1 text-xs font-semibold text-foreground">
                {categoryPercent}%
              </span>
              <span className="rounded-full border border-border/60 bg-secondary/60 px-2.5 py-1 text-xs font-semibold text-foreground">
                {formatCurrency(categoryAmount)}
              </span>
            </div>
          </div>
          {list.length === 0 ? (
            <div className="text-sm text-muted-foreground italic">Aucun élément.</div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-white/30 bg-white/70 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/5">
              <div className="min-w-[320px]">
                <div className="grid grid-cols-[minmax(0,2fr)_auto_auto] items-center bg-secondary/40 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <span>Nom</span>
                  <span className="text-right">Part</span>
                </div>
                <div className="divide-y divide-border/40">
                  {list.map((item) => {
                    const itemAmount = (categoryAmount * item.percent) / 100;
                    return (
                      <div
                        key={item.id}
                        className="grid grid-cols-[minmax(0,2fr)_auto_auto] items-center px-4 py-3"
                      >
                        <span className="text-sm font-medium break-words leading-snug">
                          {item.name || 'Sans nom'}
                        </span>
                        <span className="justify-self-end rounded-full border border-border/60 bg-secondary/60 px-2.5 py-1 text-xs font-semibold text-foreground">
                          {item.percent}%
                        </span>
                        <span className="justify-self-end rounded-full border border-border/60 bg-secondary/60 px-2.5 py-1 text-xs font-semibold text-foreground">
                          {formatCurrency(itemAmount)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      );
    };

    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${accentClass}`}>
              {icon}
            </span>
            <span>Récapitulatif {title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {renderCategory('Actions', actions)}
          {renderCategory('ETFs', etfs)}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6 pb-28">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Répartition
        </h1>
        <p className="text-muted-foreground mt-1">
          Planifiez la répartition mensuelle entre PEA, CTO et vos actifs
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Montant mensuel
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Label htmlFor="monthly-amount">Somme à investir chaque mois</Label>
            <div className="rounded-2xl border border-white/30 bg-white/70 px-4 py-3 backdrop-blur-md dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center gap-3">
                <Input
                  id="monthly-amount"
                  type="number"
                  min={0}
                  step={1}
                  value={monthlyAmount}
                  onChange={(event) => handleMonthlyChange(event.target.value)}
                  className="glass-input h-11 text-lg"
                />
                <span className="text-muted-foreground font-medium">€</span>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                Montant total réparti: <span className="font-semibold">{formatCurrency(monthlyAmount)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Répartition PEA / CTO
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Part du PEA</Label>
              <Slider
                value={[peaPercent]}
                onValueChange={(value) => handlePeaPercentChange(value[0])}
                min={0}
                max={100}
                step={1}
                className="py-2"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-2 shadow-sm backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">PEA</span>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      step={1}
                      value={peaPercent}
                      onChange={(event) => handlePeaPercentChange(Number(event.target.value))}
                      className="glass-input h-9 w-20 text-right"
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(peaAmount)}
                </div>
              </div>

              <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4 space-y-2 shadow-sm backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-blue-600 dark:text-blue-400">CTO</span>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      step={1}
                      value={ctoPercent}
                      onChange={(event) => handleCtoPercentChange(Number(event.target.value))}
                      className="glass-input h-9 w-20 text-right"
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(ctoAmount)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderAccountSection(
          'pea',
          'PEA',
          peaPercent,
          peaAmount,
          'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
          <Wallet className="w-5 h-5" />
        )}
        {renderAccountSection(
          'cto',
          'CTO',
          ctoPercent,
          ctoAmount,
          'bg-blue-500/15 text-blue-600 dark:text-blue-400',
          <Building2 className="w-5 h-5" />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderRecapList(
          'pea',
          'PEA',
          peaAmount,
          'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
          <Wallet className="w-5 h-5" />
        )}
        {renderRecapList(
          'cto',
          'CTO',
          ctoAmount,
          'bg-blue-500/15 text-blue-600 dark:text-blue-400',
          <Building2 className="w-5 h-5" />
        )}
      </div>
    </div>
  );
}
