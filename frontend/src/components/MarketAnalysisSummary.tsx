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
          <span className="analysis-eyebrow">Análise municipal</span>

          <h2>{municipality.name}</h2>

          <p>{municipality.state.name} · análise integrada de mercado</p>
        </div>

        <div className="analysis-reference">
          <span>Fontes</span>
          <strong>
            IBGE {ibge.referencePeriod} · ANS {ans.referencePeriod}
          </strong>
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

      {ageGroup && ageGroupPopulation !== null && (
        <div className="selected-age-group">
          <div>
            <span className="selected-age-group-label">
              Público selecionado
            </span>

            <strong>{ageGroup} anos</strong>

            <small>População residente · IBGE {ibge.referencePeriod}</small>
          </div>

          <strong className="selected-age-group-value">
            {ageGroupPopulation.toLocaleString("pt-BR")}
          </strong>
        </div>
      )}

      <div className="market-analysis-insights">
        <div className="section-heading">
          <div>
            <span className="section-eyebrow">Perfil do mercado</span>

            <h3>Principais concentrações</h3>
          </div>

          <p>Faixas com maior concentração de população e beneficiários.</p>
        </div>

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
        </div>
      </div>
    </section>
  );
}

export default MarketAnalysisSummary;
