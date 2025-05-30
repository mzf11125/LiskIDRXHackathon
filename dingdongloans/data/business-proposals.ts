import type { BusinessProposal } from "@/types/business-proposal";
import { api } from "@/hooks/use-axios";
import { getOrAnalyzeWallet, getUserProfile } from "@/data/wallet-analysis-api";

// Function to fetch business proposals from the API
export const fetchBusinessProposals = async (
  skip = 0,
  limit = 20
): Promise<BusinessProposal[]> => {
  try {
    const { data } = await api.get(`/proposals/?skip=${skip}&limit=${limit}`);

    // Fetch wallet analysis for each proposal
    const proposalsWithAnalysis = await Promise.all(
      data.proposals.map(async (proposal: any) => {
        try {
          const walletAnalysis = await getOrAnalyzeWallet(
            proposal.proposer_wallet
          );
          return {
            id: proposal.id,
            company_name: proposal.company_name,
            logo: proposal.logo,
            accepted_token: proposal.accepted_token,
            total_pooled: proposal.total_pooled,
            short_description: proposal.short_description,
            full_description: proposal.full_description,
            business_plan: proposal.business_plan,
            expected_return: proposal.expected_return,
            duration: proposal.duration,
            minimum_investment: proposal.minimum_investment,
            maximum_investment: proposal.maximum_investment,
            proposer_wallet: proposal.proposer_wallet,
            proposed_at: proposal.proposed_at,
            deadline: proposal.deadline,
            status: proposal.status,
            current_funding: proposal.current_funding,
            target_funding: proposal.target_funding,
            investor_count: proposal.investor_count,
            website: proposal.website,
            social_media: proposal.social_media,
            documents: proposal.documents.map((doc: any) => ({
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
            wallet_analysis: walletAnalysis,
            created_at: proposal.created_at,
            updated_at: proposal.updated_at,
            tags: proposal.tags,
          };
        } catch (error) {
          console.error(
            `Failed to get wallet analysis for ${proposal.proposer_wallet}:`,
            error
          );
          return {
            id: proposal.id,
            company_name: proposal.company_name,
            logo: proposal.logo,
            accepted_token: proposal.accepted_token,
            total_pooled: proposal.total_pooled,
            short_description: proposal.short_description,
            full_description: proposal.full_description,
            business_plan: proposal.business_plan,
            expected_return: proposal.expected_return,
            duration: proposal.duration,
            minimum_investment: proposal.minimum_investment,
            maximum_investment: proposal.maximum_investment,
            proposer_wallet: proposal.proposer_wallet,
            proposed_at: proposal.proposed_at,
            deadline: proposal.deadline,
            status: proposal.status,
            current_funding: proposal.current_funding,
            target_funding: proposal.target_funding,
            investor_count: proposal.investor_count,
            website: proposal.website,
            social_media: proposal.social_media,
            documents: proposal.documents.map((doc: any) => ({
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
            wallet_analysis: undefined,
            created_at: proposal.created_at,
            updated_at: proposal.updated_at,
            tags: proposal.tags,
          };
        }
      })
    );

    return proposalsWithAnalysis;
  } catch (error) {
    console.error("Error fetching business proposals:", error);
    throw error;
  }
};

export const getBusinessProposalById = async (
  id: string
): Promise<BusinessProposal | null> => {
  try {
    const { data } = await api.get(`/proposals/${id}`);

    // Add wallet analysis to the individual proposal
    const walletAnalysis = await getOrAnalyzeWallet(data.proposer_wallet);

    return {
      ...data,
      wallet_analysis: walletAnalysis,
    };
  } catch (error) {
    console.error("Error fetching business proposal:", error);
    return null;
  }
};

export const checkProfileCompletion = async (): Promise<{
  complete: boolean;
  missingFields: string[];
}> => {
  try {
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

    return {
      complete: missingFields.length === 0,
      missingFields,
    };
  } catch (error) {
    return {
      complete: false,
      missingFields: [
        "display_name",
        "email",
        "company_name",
        "company_position",
        "company_website",
        "company_description",
      ],
    };
  }
};

// Add function to get user's own proposals
export const getUserProposals = async (): Promise<BusinessProposal[]> => {
  try {
    const { data } = await api.get("/proposals/me");

    // Fetch wallet analysis for each proposal
    const proposalsWithAnalysis = await Promise.all(
      data.proposals.map(async (proposal: any) => {
        try {
          const walletAnalysis = await getOrAnalyzeWallet(
            proposal.proposer_wallet
          );
          return {
            ...proposal,
            wallet_analysis: walletAnalysis,
          };
        } catch (error) {
          console.error(
            `Failed to get wallet analysis for ${proposal.proposer_wallet}:`,
            error
          );
          return {
            ...proposal,
            wallet_analysis: undefined,
          };
        }
      })
    );

    return proposalsWithAnalysis;
  } catch (error) {
    console.error("Error fetching user proposals:", error);
    throw error;
  }
};

// export const getActiveBusinessProposals = async (): Promise<BusinessProposal[]> => {
//   const proposals = await fetchBusinessProposals();
//   return proposals.filter((proposal) => proposal.status === "active");
// };
