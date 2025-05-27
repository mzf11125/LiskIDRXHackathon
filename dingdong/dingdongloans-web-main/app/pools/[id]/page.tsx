import { getAllPools, getPoolById } from "@/data/mock-data";
import { PoolType } from "@/types/platform";
import PoolDetailClient from "./client-page";

export async function generateStaticParams() {
	const pools = getAllPools();
	return pools.map((pool: PoolType) => ({
		id: pool.id,
	}));
}

export default function PoolDetailPage({ params }: { params: { id: string } }) {
	const pool = getPoolById(params.id);
	return <PoolDetailClient params={params} initialPool={pool} />;
}
