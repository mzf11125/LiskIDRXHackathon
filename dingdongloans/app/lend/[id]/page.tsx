import { Suspense } from "react";
import lendingOpportunityPage from "./client-page"; // Import the client component
import { getLendingProposalById } from "@/data/lending-proposal";

// Server Component - handles data fetching
export default async function Page({ params }: { params: { id: string } }) {
	const opportunity = await getLendingProposalById(params.id);

	return (
		<Suspense fallback={<div>Loading...</div>}>
			<LendingOpportunityPage opportunity={opportunity} />
		</Suspense>
	);
}

