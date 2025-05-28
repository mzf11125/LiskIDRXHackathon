import { ShieldCheck, TrendingUp, Users, Zap, Target, Briefcase, BrainCircuit } from 'lucide-react';

export default function AboutPage() {
    return(
        <div className="container mx-auto px-4 py-12 md:py-20">
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-8 gradient-text">About Dingdong.loans</h1>
            <p className="text-lg md:text-xl text-foreground text-center max-w-3xl mx-auto mb-12">
                Dingdong.loans is a decentralized finance (DeFi) application built on the Lisk blockchain. We connect lenders and borrowers in a secure, transparent, and efficient environment, with special support for the IDRX token.
            </p>

            <div className="mb-16">
                <h2 className="text-3xl font-semibold text-center mb-8 gradient-text">Our Mission</h2>
                <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto">
                    Our mission is to revolutionize the lending industry by providing a decentralized platform that empowers individuals. We aim to give users full control over their financial assets, enabling them to lend, borrow, and invest with confidence and transparency. We believe in the power of blockchain technology to create a more equitable and accessible financial future for everyone.
                </p>
            </div>

            <div>
                <h2 className="text-3xl font-semibold text-center mb-12 gradient-text">Key Features</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[
                        {
                            title: "Lending Pools",
                            description: "Supply your digital assets to liquidity pools and earn competitive interest rates.",
                            icon: <TrendingUp className="h-10 w-10 text-primary" />,
                        },
                        {
                            title: "Secure Borrowing",
                            description: "Borrow crypto assets by providing collateral, with transparent terms and fair rates.",
                            icon: <ShieldCheck className="h-10 w-10 text-primary" />,
                        },
                        {
                            title: "Business Funding",
                            description: "Create or invest in business proposals with detailed risk analysis and community backing.",
                            icon: <Briefcase className="h-10 w-10 text-primary" />,
                        },
                        {
                            title: "AI-Powered Risk Assessment",
                            description: "Our advanced AI analyzes wallet history and transaction patterns to evaluate borrower creditworthiness, enhancing security for lenders.",
                            icon: <BrainCircuit className="h-10 w-10 text-primary" />,
                        },
                        {
                            title: "Pool Governance",
                            description: "Participate in the platform's future by voting on key parameters for lending pools.",
                            icon: <Users className="h-10 w-10 text-primary" />,
                        },
                        {
                            title: "Multi-Asset Support",
                            description: "We support a variety of cryptocurrencies, including IDRX, LSK, and more, offering diverse investment opportunities.",
                            icon: <Zap className="h-10 w-10 text-primary" />,
                        },
                    ].map((feature, index) => (
                        <div key={index} className="web3-card p-6 rounded-lg shadow-lg bg-secondary/50 border border-border hover:shadow-primary/50 transition-shadow duration-300">
                            <div className="flex items-center justify-center mb-4 bg-muted rounded-full h-16 w-16 mx-auto">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-semibold mb-2 text-center gradient-text">{feature.title}</h3>
                            <p className="text-muted-foreground text-sm text-center">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-16 text-center">
                <h2 className="text-3xl font-semibold mb-8 gradient-text">Join Our Journey</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                    We are committed to building a robust and user-friendly platform. Join us as we leverage the Lisk blockchain to create a new era of decentralized finance. Whether you're looking to earn interest on your assets or need funding for your next venture, DINGDONG.loans is here to support your financial goals.
                </p>
                {/* Possible Call to Action Button Here if needed */}
            </div>
        </div>
    );
}