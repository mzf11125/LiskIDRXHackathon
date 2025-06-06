import { BusinessProposal } from "@/types/business-proposal";
import { api } from "@/hooks/use-axios";
import { getOrAnalyzeWallet, getUserProfile } from "@/data/wallet-analysis-api";

export const getLendingProposalById = async (
  id: string
): Promise<BusinessProposal> => {
  try {
    const { data } = await api.get(`/proposals/${id}`);

    // Fetch wallet analysis from API
    const walletAnalysis = await getOrAnalyzeWallet(data.proposer_wallet);

    return {
      id: data.id,
      company_name: data.company_name,
      logo: data.logo,
      accepted_token: data.accepted_token,
      total_pooled: data.total_pooled,
      short_description: data.short_description,
      full_description: data.full_description,
      business_plan: data.business_plan,
      expected_return: data.expected_return,
      duration: data.duration,
      minimum_investment: data.minimum_investment,
      maximum_investment: data.maximum_investment,
      proposer_wallet: data.proposer_wallet,
      proposed_at: data.proposed_at,
      deadline: data.deadline,
      status: data.status,
      current_funding: data.current_funding,
      target_funding: data.target_funding,
      investor_count: data.investor_count,
      website: data.website,
      social_media: data.social_media,
      documents: data.documents.map((doc: any) => ({
        id: doc.id,
        proposal_id: doc.proposal_id,
        title: doc.title,
        type: doc.type,
        url: doc.url,
        uploaded_at: doc.uploaded_at,
        created_at: doc.created_at,
        updated_at: doc.updated_at,
        size: doc.size,
      })),
      wallet_analysis: walletAnalysis, // Use API analysis
      created_at: data.created_at,
      updated_at: data.updated_at,
      tags: data.tags,
    };
  } catch (error) {
    console.error("Error fetching lending proposal:", error);
    throw error;
  }
};

export const createBusinessProposal = async (
  proposalData: Partial<BusinessProposal>
): Promise<BusinessProposal> => {
  try {
    // Check if user has a complete profile first
    const profile = await getUserProfile();
    const requiredFields = [
      "display_name",
      "email",
      "company_name",
      "company_position",
      "company_website",
      "company_description",
    ];
    const missingFields = requiredFields.filter(
      (field) => !profile[field as keyof typeof profile]
    );

    if (missingFields.length > 0) {
      throw new Error(
        `Please complete your profile first. Missing fields: ${missingFields.join(
          ", "
        )}`
      );
    }

    const { data } = await api.post("/proposals/", proposalData);
    return data;
  } catch (error) {
    console.error("Error creating business proposal:", error);
    throw error;
  }
};
