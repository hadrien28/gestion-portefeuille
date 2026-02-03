import { useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Download, Upload, TrendingUp, Building2, PieChart, X, Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { Investment, InvestmentType, AccountType } from '@/types';
import { useInvestments } from '@/hooks/useInvestments';
import { motion, AnimatePresence } from 'framer-motion';

interface InvestmentFormProps {
  investment?: Investment;
  onSubmit: (data: Omit<Investment, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

function InvestmentForm({ investment, onSubmit, onCancel }: InvestmentFormProps) {
  const [name, setName] = useState(investment?.name || '');
  const [isin, setIsin] = useState(investment?.isin || '');
  const [amount, setAmount] = useState(investment?.amount.toString() || '');
  const [type, setType] = useState<InvestmentType>(investment?.type || 'action');
  const [account, setAccount] = useState<AccountType>(investment?.account || 'pea');
  const [date, setDate] = useState(investment?.date || new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate a brief animation
    await new Promise(resolve => setTimeout(resolve, 300));
    
    onSubmit({
      name,
      isin: isin || undefined,
      amount: parseFloat(amount),
      type,
      account,
      date,
    });
    setIsSubmitting(false);
  };

  return (
    <motion.form 
      onSubmit={handleSubmit} 
      className="space-y-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
    >
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
          Nom de l'action/ETF *
        </Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Apple, MSCI World..."
          required
          className="glass-input h-12 rounded-xl text-base"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="isin" className="text-sm font-medium flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground"></span>
          Code ISIN <span className="text-muted-foreground text-xs">(optionnel)</span>
        </Label>
        <Input
          id="isin"
          value={isin}
          onChange={(e) => setIsin(e.target.value)}
          placeholder="Ex: US0378331005"
          className="glass-input h-12 rounded-xl text-base"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <motion.div 
          className="space-y-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <Label htmlFor="amount" className="text-sm font-medium flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Montant investi *
          </Label>
          <div className="relative">
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="1000"
              required
              className="glass-input h-12 rounded-xl text-base pr-10"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
              €
            </span>
          </div>
        </motion.div>

        <motion.div 
          className="space-y-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
          <Label htmlFor="date" className="text-sm font-medium flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            Date *
          </Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="glass-input h-12 rounded-xl text-base"
          />
        </motion.div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <motion.div 
          className="space-y-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <Label className="text-sm font-medium flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Type *
          </Label>
          <Select value={type} onValueChange={(v) => setType(v as InvestmentType)}>
            <SelectTrigger className="glass-input h-12 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="glass-dialog rounded-xl">
              <SelectItem value="action" className="rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  Action
                </div>
              </SelectItem>
              <SelectItem value="etf" className="rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  ETF
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        <motion.div 
          className="space-y-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
        >
          <Label className="text-sm font-medium flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Compte *
          </Label>
          <Select value={account} onValueChange={(v) => setAccount(v as AccountType)}>
            <SelectTrigger className="glass-input h-12 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="glass-dialog rounded-xl">
              <SelectItem value="pea" className="rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  PEA
                </div>
              </SelectItem>
              <SelectItem value="cto" className="rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  CTO
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </motion.div>
      </div>

      <motion.div 
        className="flex gap-3 pt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel} 
          className="flex-1 h-12 rounded-xl glass-button"
        >
          <X className="w-4 h-4 mr-2" />
          Annuler
        </Button>
        <Button 
          type="submit" 
          className="flex-1 h-12 rounded-xl bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/25"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
            />
          ) : (
            <>
              <Check className="w-4 h-4 mr-2" />
              {investment ? 'Modifier' : 'Ajouter'}
            </>
          )}
        </Button>
      </motion.div>
    </motion.form>
  );
}

export function PortfolioPage() {
  const {
    investments,
    addInvestment,
    updateInvestment,
    deleteInvestment,
    exportToJSON,
    importFromJSON,
  } = useInvestments();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
  const [filter, setFilter] = useState<'all' | 'pea' | 'cto'>('all');
  const currentMonthKey = new Date().toISOString().slice(0, 7);
  const [openMonths, setOpenMonths] = useState<Set<string>>(() => new Set([currentMonthKey]));

  const handleAdd = (data: Omit<Investment, 'id' | 'createdAt'>) => {
    addInvestment(data);
    setIsAddDialogOpen(false);
  };

  const handleEdit = (data: Omit<Investment, 'id' | 'createdAt'>) => {
    if (editingInvestment) {
      updateInvestment(editingInvestment.id, data);
      setEditingInvestment(null);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet investissement ?')) {
      deleteInvestment(id);
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (importFromJSON(content)) {
          alert('Import réussi !');
        } else {
          alert('Erreur lors de l\'import');
        }
      };
      reader.readAsText(file);
    }
  };

  const toggleMonth = (month: string) => {
    setOpenMonths((prev) => {
      const next = new Set(prev);
      if (next.has(month)) {
        next.delete(month);
      } else {
        next.add(month);
      }
      return next;
    });
  };

  const filteredInvestments = useMemo(() => {
    if (filter === 'all') return investments;
    return investments.filter((inv) => inv.account === filter);
  }, [investments, filter]);

  const groupedByMonth = useMemo(() => {
    const monthMap = new Map<string, { items: Investment[]; total: number }>();

    filteredInvestments.forEach((inv) => {
      const month = inv.date.slice(0, 7);
      const entry = monthMap.get(month) || { items: [], total: 0 };
      entry.items.push(inv);
      entry.total += inv.amount;
      monthMap.set(month, entry);
    });

    return Array.from(monthMap.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([month, data]) => ({
        month,
        total: data.total,
        items: data.items.sort((a, b) => b.date.localeCompare(a.date)),
      }));
  }, [filteredInvestments]);

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
      }),
    []
  );
  const formatCurrency = (amount: number) => currencyFormatter.format(amount);

  const totals = useMemo(() => {
    let grandTotal = 0;
    let peaTotal = 0;
    let ctoTotal = 0;

    for (const inv of investments) {
      grandTotal += inv.amount;
      if (inv.account === 'pea') {
        peaTotal += inv.amount;
      } else {
        ctoTotal += inv.amount;
      }
    }

    return { grandTotal, peaTotal, ctoTotal };
  }, [investments]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatMonthLabel = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(Number(year), Number(month) - 1, 1);
    const formatted = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  return (
    <div className="space-y-6 pb-28">
      {/* Header */}
      <motion.div 
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Portefeuille
          </h1>
          <p className="text-muted-foreground mt-1">
            Gérez vos investissements PEA et CTO
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
            id="import-file"
          />
          <label htmlFor="import-file">
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
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-primary to-primary/80 rounded-xl shadow-lg shadow-primary/25">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-dialog sm:max-w-lg rounded-3xl border-0">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                    <Plus className="w-5 h-5 text-primary-foreground" />
                  </div>
                  Nouvel investissement
                </DialogTitle>
              </DialogHeader>
              <InvestmentForm
                onSubmit={handleAdd}
                onCancel={() => setIsAddDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div 
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <Card className="glass-card overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg group-hover:shadow-primary/30 transition-shadow">
                <TrendingUp className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Total investi</span>
            </div>
            <div className="text-2xl font-bold">{formatCurrency(totals.grandTotal)}</div>
          </CardContent>
        </Card>

        <Card className="glass-card overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg group-hover:shadow-emerald-500/30 transition-shadow">
                <PieChart className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">PEA</span>
            </div>
            <div className="text-2xl font-bold text-emerald-500">
              {formatCurrency(totals.peaTotal)}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:shadow-blue-500/30 transition-shadow">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">CTO</span>
            </div>
            <div className="text-2xl font-bold text-blue-500">
              {formatCurrency(totals.ctoTotal)}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg group-hover:shadow-amber-500/30 transition-shadow">
                <span className="text-white font-bold text-sm">#</span>
              </div>
              <span className="text-sm font-medium text-muted-foreground">Investissements</span>
            </div>
            <div className="text-2xl font-bold">{investments.length}</div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filter */}
      <motion.div 
        className="flex gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {(['all', 'pea', 'cto'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`
              px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300
              ${filter === f
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }
            `}
          >
            {f === 'all' ? 'Tous' : f.toUpperCase()}
          </button>
        ))}
      </motion.div>

      {/* Investments List */}
      <div className="space-y-4">
        {groupedByMonth.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Card className="glass-card p-12 text-center">
              <div className="text-muted-foreground">
                <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">Aucun investissement</p>
                <p className="text-sm">Commencez par ajouter votre premier investissement</p>
              </div>
            </Card>
          </motion.div>
        ) : (
          groupedByMonth.map((group) => {
            const isOpen = openMonths.has(group.month);
            return (
              <Collapsible
                key={group.month}
                open={isOpen}
                onOpenChange={() => toggleMonth(group.month)}
              >
                <Card className="glass-card overflow-hidden">
                  <CollapsibleTrigger asChild>
                    <button className="w-full px-4 sm:px-5 py-4 flex items-center justify-between text-left">
                      <div>
                        <div className="text-sm font-semibold">{formatMonthLabel(group.month)}</div>
                        <div className="text-xs text-muted-foreground">
                          {group.items.length} investissement{group.items.length > 1 ? 's' : ''}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">Total</div>
                          <div className="font-semibold">{formatCurrency(group.total)}</div>
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 text-muted-foreground transition-transform ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-3 sm:px-4 pb-4 space-y-3">
                    <AnimatePresence mode="popLayout">
                      {group.items.map((investment) => (
                        <motion.div
                          key={investment.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -100 }}
                          transition={{ duration: 0.25 }}
                        >
                          <Card className="glass-card investment-card group hover:shadow-xl transition-all duration-300">
                            <CardContent className="p-4 sm:p-5">
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4 min-w-0">
                                  <div className={`
                                    w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold shrink-0
                                    ${investment.type === 'action' 
                                      ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/25' 
                                      : 'bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/25'
                                    }
                                  `}>
                                    {investment.type === 'action' ? 'A' : 'E'}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-semibold truncate">{investment.name}</span>
                                      <Badge 
                                        variant={investment.account === 'pea' ? 'default' : 'secondary'} 
                                        className={`text-xs rounded-lg ${
                                          investment.account === 'pea' 
                                            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/30' 
                                            : 'bg-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-500/30'
                                        }`}
                                      >
                                        {investment.account.toUpperCase()}
                                      </Badge>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                                      {investment.isin && <span className="font-mono text-xs">{investment.isin}</span>}
                                      {investment.isin && <span>?</span>}
                                      <span>{formatDate(investment.date)}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4 shrink-0">
                                  <div className="text-right hidden sm:block">
                                    <div className="font-bold text-lg">{formatCurrency(investment.amount)}</div>
                                    <div className="text-xs text-muted-foreground capitalize">{investment.type}</div>
                                  </div>
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity sm:flex">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-9 w-9 rounded-xl hover:bg-primary/10"
                                      onClick={() => setEditingInvestment(investment)}
                                    >
                                      <Pencil className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-9 w-9 rounded-xl hover:bg-destructive/10 text-destructive"
                                      onClick={() => handleDelete(investment.id)}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                              {/* Mobile amount display */}
                              <div className="sm:hidden mt-3 pt-3 border-t border-border/50">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-muted-foreground capitalize">{investment.type}</span>
                                  <span className="font-bold text-lg">{formatCurrency(investment.amount)}</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            );
          })
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingInvestment} onOpenChange={() => setEditingInvestment(null)}>
        <DialogContent className="glass-dialog sm:max-w-lg rounded-3xl border-0">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                <Pencil className="w-5 h-5 text-primary-foreground" />
              </div>
              Modifier l'investissement
            </DialogTitle>
          </DialogHeader>
          {editingInvestment && (
            <InvestmentForm
              investment={editingInvestment}
              onSubmit={handleEdit}
              onCancel={() => setEditingInvestment(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
