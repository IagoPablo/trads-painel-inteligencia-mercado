import type { MarketAnalysis } from "../types/market-data";
import type { AgeGroup } from "../types/market-filters";

interface MarketAnalysisSummaryProps {
  data: MarketAnalysis;
  ageGroup: AgeGroup | "";
  ageGroupPopulation: number | null;
}

function MarketAnalysisSummary({
  data,
  ageGroup,
  ageGroupPopulation,
}: MarketAnalysisSummaryProps) {
  const { municipality, ibge, ans, insights } = data;

  return (
    <section className="market-analysis-summary">
      <div className="market-analysis-header">
        <div>
          <h2>{municipality.name}</h2>
          <p>{municipality.state.name} · análise integrada de mercado</p>
        </div>
      </div>

      <div className="market-analysis-cards">
        <article className="analysis-card">
          <span>População</span>
          <strong>{ibge.population?.toLocaleString("pt-BR") ?? "—"}</strong>
          <small>IBGE · {ibge.referencePeriod}</small>
        </article>

        <article className="analysis-card">
          <span>Renda domiciliar per capita média</span>
          <strong>
            {ibge.householdIncome !== null
              ? ibge.householdIncome.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })
              : "—"}
          </strong>
          <small>IBGE · {ibge.referencePeriod}</small>
        </article>

        <article className="analysis-card">
          <span>Beneficiários de planos médicos</span>
          <strong>{ans.beneficiaries.medical.toLocaleString("pt-BR")}</strong>
          <small>ANS · {ans.referencePeriod}</small>
        </article>

        <article className="analysis-card">
          <span>Beneficiários de planos odontológicos</span>
          <strong>{ans.beneficiaries.dental.toLocaleString("pt-BR")}</strong>
          <small>ANS · {ans.referencePeriod}</small>
        </article>
      </div>

      <div className="market-analysis-insights">
        <h3>Principais concentrações</h3>

        <div className="market-analysis-insight-grid">
          <article className="analysis-insight">
            <span>Maior faixa populacional</span>
            <strong>{insights.largestPopulationAgeGroup.ageGroup}</strong>
            <small>
              {insights.largestPopulationAgeGroup.population.toLocaleString(
                "pt-BR",
              )}{" "}
              pessoas · IBGE
            </small>
          </article>

          <article className="analysis-insight">
            <span>Maior faixa de beneficiários</span>
            <strong>
              {insights.largestBeneficiaryAgeGroup?.ageGroup ?? "—"}
            </strong>
            <small>
              {insights.largestBeneficiaryAgeGroup
                ? `${insights.largestBeneficiaryAgeGroup.beneficiaries.toLocaleString(
                    "pt-BR",
                  )} beneficiários · ANS`
                : "Dados indisponíveis"}
            </small>
          </article>

          <article className="analysis-insight">
            <span>Maior faixa médica</span>
            <strong>{insights.largestMedicalAgeGroup?.ageGroup ?? "—"}</strong>
            <small>
              {insights.largestMedicalAgeGroup
                ? `${insights.largestMedicalAgeGroup.beneficiaries.toLocaleString(
                    "pt-BR",
                  )} beneficiários · ANS`
                : "Dados indisponíveis"}
            </small>
          </article>

          <article className="analysis-insight">
            <span>Maior faixa odontológica</span>
            <strong>{insights.largestDentalAgeGroup?.ageGroup ?? "—"}</strong>
            <small>
              {insights.largestDentalAgeGroup
                ? `${insights.largestDentalAgeGroup.beneficiaries.toLocaleString(
                    "pt-BR",
                  )} beneficiários · ANS`
                : "Dados indisponíveis"}
            </small>
          </article>
          <article className="analysis-card">
            <span>
              {ageGroup ? `População ${ageGroup} anos` : "População por faixa"}
            </span>

            <strong>
              {ageGroup && ageGroupPopulation !== null
                ? ageGroupPopulation.toLocaleString("pt-BR")
                : "Todas as faixas"}
            </strong>

            <small>IBGE · {ibge.referencePeriod}</small>
          </article>
        </div>
      </div>
    </section>
  );
}

export default MarketAnalysisSummary;
