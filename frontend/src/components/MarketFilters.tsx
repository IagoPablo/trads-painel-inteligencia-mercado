import type {
  MarketFilters as MarketFiltersState,
  AgeGroup,
} from '../types/market-filters';

interface MarketFiltersProps {
  filters: MarketFiltersState;
  onChange: (filters: MarketFiltersState) => void;
}

const ageGroups: AgeGroup[] = [
  '0-14',
  '15-24',
  '25-34',
  '35-44',
  '45-54',
  '55-64',
  '65+',
];

function MarketFilters({ filters, onChange }: MarketFiltersProps) {
  function updateFilter<K extends keyof MarketFiltersState>(
    field: K,
    value: MarketFiltersState[K],
  ) {
    onChange({
      ...filters,
      [field]: value,
    });
  }

  return (
    <section>
      <h2>Filtros</h2>

      <label>
        Estado
        <input
          type="text"
          placeholder="Ex.: PB"
          value={filters.state}
          onChange={(event) =>
            updateFilter('state', event.target.value.toUpperCase())
          }
        />
      </label>

      <label>
        Município
        <input
          type="text"
          placeholder="Ex.: João Pessoa"
          value={filters.municipality}
          onChange={(event) =>
            updateFilter('municipality', event.target.value)
          }
        />
      </label>

      <label>
        Faixa etária
        <select
          value={filters.ageGroup}
          onChange={(event) =>
            updateFilter(
              'ageGroup',
              event.target.value as MarketFiltersState['ageGroup'],
            )
          }
        >
          <option value="">Todas as faixas</option>

          {ageGroups.map((ageGroup) => (
            <option key={ageGroup} value={ageGroup}>
              {ageGroup} anos
            </option>
          ))}
        </select>
      </label>

      <label>
        Ordenar por
        <select
          value={filters.sortBy}
          onChange={(event) =>
            updateFilter(
              'sortBy',
              event.target.value as MarketFiltersState['sortBy'],
            )
          }
        >
          <option value="population">População</option>
          <option value="householdIncome">Renda</option>
        </select>
      </label>

      <label>
        Ordem
        <select
          value={filters.order}
          onChange={(event) =>
            updateFilter(
              'order',
              event.target.value as MarketFiltersState['order'],
            )
          }
        >
          <option value="desc">Maior para menor</option>
          <option value="asc">Menor para maior</option>
        </select>
      </label>
    </section>
  );
}

export default MarketFilters;