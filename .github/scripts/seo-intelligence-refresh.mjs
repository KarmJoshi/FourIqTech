import { buildOpportunitySnapshot } from './seo-opportunity-engine.mjs';
import { buildCompetitorIntelligence } from './seo-competitor-intelligence.mjs';

async function main() {
  const opportunitySnapshot = buildOpportunitySnapshot();
  const competitorSnapshot = await buildCompetitorIntelligence();
  console.log(JSON.stringify({
    recommended_department: opportunitySnapshot.recommended_department,
    competitor_queries: competitorSnapshot.queries?.length || 0,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
