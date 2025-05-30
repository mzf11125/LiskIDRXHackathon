"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getBusinessProposalById } from "@/data/business-proposals";
import { BusinessProposal } from "@/types/business-proposal";
import BusinessProposalClientPage from "./client-page";


export default function Page() {
    const params = useParams();
    const [proposal, setProposal] = useState<BusinessProposal | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchProposal() {
            try {
                setLoading(true);
                const data = await getBusinessProposalById(params.id as string);
                setProposal(data);
            } catch (err) {
                console.error("Error loading business proposal:", err);
                setError("Failed to load proposal");
            } finally {
                setLoading(false);
            }
        }

        if (params.id) {
            fetchProposal();
        }
    }, [params.id]);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
                <h1 className="text-2xl font-bold mb-4">Loading Proposal...</h1>
                <p className="text-slate-400">Please wait while we fetch the proposal details.</p>
            </div>
        );
    }

    if (error || !proposal) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h1 className="text-2xl font-bold mb-4">Proposal Not Found</h1>
                <p className="text-slate-400">{error || "The requested business proposal could not be found."}</p>
            </div>
        );
    }

    return <BusinessProposalClientPage params={params} initialProposal={proposal} />;
}