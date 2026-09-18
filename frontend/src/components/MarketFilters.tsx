import { useState } from 'react';
import type {MarketFilters as MarketFiltersState, AgeGroup,} from '../types/market-filters';
import type { Municipality } from '../types/location';
import './MarketFilters.css';

interface MarketFiltersProps {
  filters: MarketFiltersState;
  municipalities: Municipality[];
  onChange: (filters: MarketFiltersState) => void;
  onAnalyze: () => void;
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
  onAnalyze,
}: MarketFiltersProps) {
  const [municipalitySearch, setMunicipalitySearch] =
    useState(filters.municipality);

  function updateFilter<K extends keyof MarketFiltersState>(
    field: K,
    value: MarketFiltersState[K],
  ) {
    onChange({
      ...filters,
      [field]: value,
    });
  }

  function handleStateChange(state: string) {
    setMunicipalitySearch('');

    onChange({
      ...filters,
      state,
      municipality: '',
    });
  }

  function handleMunicipalitySearch(value: string) {
    setMunicipalitySearch(value);

    onChange({
      ...filters,
      municipality: '',
    });
  }

  function handleMunicipalitySelect(
    municipality: Municipality,
  ) {
    setMunicipalitySearch(municipality.name);

    updateFilter(
      'municipality',
      municipality.name,
    );
  }

  const filteredMunicipalities =
    municipalitySearch.trim()
      ? municipalities
          .filter((municipality) =>
            municipality.name
              .toLocaleLowerCase('pt-BR')
              .includes(
                municipalitySearch
                  .trim()
                  .toLocaleLowerCase('pt-BR'),
              ),
          )
          .slice(0, 20)
      : [];

  return (
    <section className="market-filters">
      <h2>Filtros</h2>

      <div className="market-filter">
        <label htmlFor="state">
          Estado
        </label>

        <select
          id="state"
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
      </div>

      <div className="market-filter">
        <label htmlFor="municipality">
          Município
        </label>

        <div className="municipality-autocomplete">
          <input
            id="municipality"
            type="text"
            value={municipalitySearch}
            disabled={
              !filters.state ||
              municipalities.length === 0
            }
            placeholder={
              filters.state
                ? 'Digite o nome do município'
                : 'Selecione um estado primeiro'
            }
            onChange={(event) =>
              handleMunicipalitySearch(
                event.target.value,
              )
            }
          />

          {filteredMunicipalities.length > 0 && (
            <div className="municipality-options">
              {filteredMunicipalities.map(
                (municipality) => (
                  <button
                    key={municipality.ibgeCode}
                    type="button"
                    className="municipality-option"
                    onClick={() =>
                      handleMunicipalitySelect(
                        municipality,
                      )
                    }
                  >
                    {municipality.name}
                  </button>
                ),
              )}
            </div>
          )}
        </div>
      </div>

      <div className="market-filter">
        <label htmlFor="age-group">
          Público
        </label>

        <select
          id="age-group"
          value={filters.ageGroup}
          onChange={(event) =>
            updateFilter(
              'ageGroup',
              event.target.value as MarketFiltersState['ageGroup'],
            )
          }
        >
          <option value="">
            Todos os Públicos
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
      </div>

      <div className="market-filter">
        <label htmlFor="sort-by">
          Ordenar por
        </label>

        <select
          id="sort-by"
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
      </div>

      <div className="market-filter">
        <label htmlFor="order">
          Ordem
        </label>

        <select
          id="order"
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
      </div>

      <button
        type="button"
        className="market-analyze-button"
        onClick={onAnalyze}
      >
        Analisar
      </button>
    </section>
  );
}

export default MarketFilters;

