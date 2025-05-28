import type { BusinessProposal } from "@/types/business-proposal";
import {
	businessProposals,
	getBusinessProposalById,
} from "@/data/business-proposals";
import BusinessProposalClientPage from "./client-page";

export async function generateStaticParams() {
	return businessProposals.map((proposal: BusinessProposal) => ({
		id: proposal.id,
	}));
}

export default function BusinessProposalPage({
	params,
}: {
	params: { id: string };
}) {
	const proposal = getBusinessProposalById(params.id);
	return (
		<BusinessProposalClientPage
			params={params}
			initialProposal={proposal}
		/>
	);
}
