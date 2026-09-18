import type {
  MarketFilters as MarketFiltersState,
  AgeGroup,
} from '../types/market-filters';

import type { Municipality } from '../types/location';

interface MarketFiltersProps {
  filters: MarketFiltersState;
  municipalities: Municipality[];
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

function MarketFilters({
  filters,
  municipalities,
  onChange,
}: MarketFiltersProps) {
  function updateFilter<K extends keyof MarketFiltersState>(
    field: K,
    value: MarketFiltersState[K],
  ) {
    onChange({
      ...filters,
      [field]: value,
    });
  }

  function handleStateChange(
    state: string,
  ) {
    onChange({
      ...filters,
      state,
      municipality: '',
    });
  }

  return (
    <section>
      <h2>Filtros</h2>

      <label>
        Estado

        <select
          value={filters.state}
          onChange={(event) =>
            handleStateChange(event.target.value)
          }
        >
          <option value="">
            Todos os estados
          </option>

          <option value="AC">Acre</option>
          <option value="AL">Alagoas</option>
          <option value="AP">Amapá</option>
          <option value="AM">Amazonas</option>
          <option value="BA">Bahia</option>
          <option value="CE">Ceará</option>
          <option value="DF">Distrito Federal</option>
          <option value="ES">Espírito Santo</option>
          <option value="GO">Goiás</option>
          <option value="MA">Maranhão</option>
          <option value="MT">Mato Grosso</option>
          <option value="MS">Mato Grosso do Sul</option>
          <option value="MG">Minas Gerais</option>
          <option value="PA">Pará</option>
          <option value="PB">Paraíba</option>
          <option value="PR">Paraná</option>
          <option value="PE">Pernambuco</option>
          <option value="PI">Piauí</option>
          <option value="RJ">Rio de Janeiro</option>
          <option value="RN">Rio Grande do Norte</option>
          <option value="RS">Rio Grande do Sul</option>
          <option value="RO">Rondônia</option>
          <option value="RR">Roraima</option>
          <option value="SC">Santa Catarina</option>
          <option value="SP">São Paulo</option>
          <option value="SE">Sergipe</option>
          <option value="TO">Tocantins</option>
        </select>
      </label>

      <label>
        Município

        <select
          value={filters.municipality}
          disabled={
            !filters.state ||
            municipalities.length === 0
          }
          onChange={(event) =>
            updateFilter(
              'municipality',
              event.target.value,
            )
          }
        >
          <option value="">
            {filters.state
              ? 'Todos os municípios'
              : 'Selecione um estado primeiro'}
          </option>

          {municipalities.map((municipality) => (
            <option
              key={municipality.ibgeCode}
              value={municipality.name}
            >
              {municipality.name}
            </option>
          ))}
        </select>
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
          <option value="">
            Todas as faixas
          </option>

          {ageGroups.map((ageGroup) => (
            <option
              key={ageGroup}
              value={ageGroup}
            >
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
          <option value="population">
            População
          </option>

          <option value="householdIncome">
            Renda
          </option>
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
          <option value="desc">
            Maior para menor
          </option>

          <option value="asc">
            Menor para maior
          </option>
        </select>
      </label>
    </section>
  );
}

export default MarketFilters;