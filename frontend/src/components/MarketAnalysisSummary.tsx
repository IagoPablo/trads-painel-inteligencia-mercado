import type { MarketAnalysis } from "../types/market-data";

interface MarketAnalysisSummaryProps {
  data: MarketAnalysis;
}

function MarketAnalysisSummary({ data }: MarketAnalysisSummaryProps) {
  const { municipality, ibge, ans } = data;

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
    </section>
  );
}

export default MarketAnalysisSummary;
