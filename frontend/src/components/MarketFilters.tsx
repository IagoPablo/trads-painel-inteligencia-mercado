import { useEffect, useRef, useState } from 'react';
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

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR');
}

function MarketFilters({
  filters,
  municipalities,
  onChange,
  onAnalyze,
}: MarketFiltersProps) {
  const [municipalitySearch, setMunicipalitySearch] =
    useState(filters.municipality);

  const [isMunicipalitySearching, setIsMunicipalitySearching] =
    useState(false);

  const municipalityRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
  function handleClickOutside(event: MouseEvent) {
    if (
      municipalityRef.current &&
      !municipalityRef.current.contains(
        event.target as Node,
      )
    ) {
      setIsMunicipalitySearching(false);
    }
  }

  document.addEventListener(
    'mousedown',
    handleClickOutside,
  );

  return () => {
    document.removeEventListener(
      'mousedown',
      handleClickOutside,
    );
  };
}, []);

useEffect(() => {
  setMunicipalitySearch(filters.municipality);
}, [filters.municipality]);

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
    setIsMunicipalitySearching(false);

    onChange({
      ...filters,
      state,
      municipality: '',
    });
  }

  function handleMunicipalitySearch(value: string) {
    setMunicipalitySearch(value);
    setIsMunicipalitySearching(true);

    onChange({
      ...filters,
      municipality: '',
    });
  }

  function handleMunicipalityFocus() {
    if (filters.state) {
      setIsMunicipalitySearching(true);
    }
  }

  function handleMunicipalitySelect(
    municipality: Municipality,
  ) {
    setMunicipalitySearch(municipality.name);
    setIsMunicipalitySearching(false);

    updateFilter(
      'municipality',
      municipality.name,
    );
  }

  function handleMunicipalityClear() {
    setMunicipalitySearch('');
    setIsMunicipalitySearching(false);

    updateFilter(
      'municipality',
      '',
    );
  }

  const normalizedSearch =
    normalizeText(municipalitySearch.trim());

  const filteredMunicipalities = municipalities
    .filter((municipality) =>
      normalizeText(municipality.name).includes(
        normalizedSearch,
      ),
    )
    .slice(0, 20);

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

        <div
          className="municipality-autocomplete"
          ref={municipalityRef}
        >
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
                ? 'Todos os municípios'
                : 'Selecione um estado primeiro'
            }
            onFocus={handleMunicipalityFocus}
            onChange={(event) =>
              handleMunicipalitySearch(
                event.target.value,
              )
            }
          />

          {municipalitySearch && (
            <button
              type="button"
              className="municipality-clear"
              onClick={handleMunicipalityClear}
              aria-label="Limpar município"
            >
              ×
            </button>
          )}

          {isMunicipalitySearching &&
            filteredMunicipalities.length > 0 && (
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
            Todos os públicos
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