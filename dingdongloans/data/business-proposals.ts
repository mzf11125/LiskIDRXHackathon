import type { BusinessProposal } from "@/types/business-proposal";
import { api } from "@/hooks/use-axios";

// Function to fetch business proposals from the API
export const fetchBusinessProposals = async (
	skip = 0,
	limit = 20
): Promise<BusinessProposal[]> => {
	try {
		const { data } = await api.get(
			`/proposals/?skip=${skip}&limit=${limit}`
		);

		return data.proposals.map((proposal: any) => ({
			id: proposal.id,
			company_name: proposal.company_name,
			logo: proposal.logo,
			accepted_token: proposal.accepted_token,
			total_pooled: proposal.total_pooled,
			short_description: proposal.short_description,
			full_description: proposal.full_description,
			business_plan: proposal.business_plan,
			expected_return: proposal.expected_return,
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
			wallet_analysis: proposal.wallet_analysis,
			created_at: proposal.created_at,
			updated_at: proposal.updated_at,
			tags: proposal.tags,
		}));
	} catch (error) {
		console.error("Error fetching business proposals:", error);
		return [];
	}
};

export const getBusinessProposalById = async (
	id: string
): Promise<BusinessProposal | undefined> => {
	try {
		const { data } = await api.get(`/proposals/${id}`);
		const proposal = data.proposal;

		// Convert to our type
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
			wallet_analysis: proposal.wallet_analysis,
			created_at: proposal.created_at,
			updated_at: proposal.updated_at,
			tags: proposal.tags,
		};
	} catch (error) {
		console.error("Error fetching business proposal:", error);
		return undefined;
	}
};

// export const getActiveBusinessProposals = async (): Promise<BusinessProposal[]> => {
//   const proposals = await fetchBusinessProposals();
//   return proposals.filter((proposal) => proposal.status === "active");
// };
