import { useState } from 'react';
import { Plus, X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCryptoStore, FilterCondition } from '@/stores/cryptoStore';
import { motion, AnimatePresence } from 'framer-motion';

export function FilterBuilder() {
  const { filters, addFilter, removeFilter, updateFilter, clearFilters } = useCryptoStore();
  const [newFilter, setNewFilter] = useState<Partial<FilterCondition>>({
    field: 'price',
    operator: 'gt',
    value: 0
  });

  const fieldOptions = [
    { value: 'price', label: 'Price' },
    { value: 'change24h', label: '24h Change %' },
    { value: 'volume24h', label: '24h Volume' },
    { value: 'rsi', label: 'RSI' },
    { value: 'macd', label: 'MACD' },
    { value: 'ma', label: 'Moving Average' },
  ];

  const operatorOptions = [
    { value: 'gt', label: '>' },
    { value: 'gte', label: '>=' },
    { value: 'lt', label: '<' },
    { value: 'lte', label: '<=' },
    { value: 'eq', label: '=' },
  ];

  const handleAddFilter = () => {
    if (newFilter.field && newFilter.operator && newFilter.value !== undefined) {
      addFilter(newFilter as FilterCondition);
      setNewFilter({ field: 'price', operator: 'gt', value: 0 });
    }
  };

  const getFieldLabel = (field: string) => {
    return fieldOptions.find(opt => opt.value === field)?.label || field;
  };

  const getOperatorLabel = (operator: string) => {
    return operatorOptions.find(opt => opt.value === operator)?.label || operator;
  };

  return (
    <Card className="crypto-card">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Advanced Filters</h3>
          </div>
          {filters.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="text-destructive hover:text-destructive"
            >
              Clear All
            </Button>
          )}
        </div>

        {/* Active Filters */}
        <AnimatePresence>
          {filters.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4"
            >
              <div className="flex flex-wrap gap-2">
                {filters.map((filter, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <Badge
                      variant="secondary"
                      className="flex items-center space-x-2 pr-1 border-primary/20 bg-primary/10"
                    >
                      <span>
                        {getFieldLabel(filter.field)} {getOperatorLabel(filter.operator)} {filter.value}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 hover:bg-destructive/20"
                        onClick={() => removeFilter(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filter Builder */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Select
            value={newFilter.field}
            onValueChange={(value) => setNewFilter({ ...newFilter, field: value as any })}
          >
            <SelectTrigger className="border-glow">
              <SelectValue placeholder="Field" />
            </SelectTrigger>
            <SelectContent>
              {fieldOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={newFilter.operator}
            onValueChange={(value) => setNewFilter({ ...newFilter, operator: value as any })}
          >
            <SelectTrigger className="border-glow">
              <SelectValue placeholder="Operator" />
            </SelectTrigger>
            <SelectContent>
              {operatorOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="number"
            placeholder="Value"
            value={newFilter.value || ''}
            onChange={(e) => setNewFilter({ ...newFilter, value: parseFloat(e.target.value) || 0 })}
            className="border-glow"
          />

          <Button
            onClick={handleAddFilter}
            className="bg-gradient-neon hover:glow-primary"
            disabled={!newFilter.field || !newFilter.operator || newFilter.value === undefined}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Filter
          </Button>
        </div>

        {filters.length > 0 && (
          <div className="mt-4 p-3 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Showing results matching <strong>ALL</strong> conditions
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}