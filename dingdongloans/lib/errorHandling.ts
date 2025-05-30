// Map of contract error names to user-friendly messages
const ERROR_MESSAGES: Record<string, string> = {
	// Lending Contract Custom Errors
	Lending__InvalidAddress: "Invalid address provided (e.g., zero address)",
	Lending__AccessDenied:
		"Access denied - You cannot access another user's sensitive information",
	Lending__MustBeMoreThanZero: "The provided value must be greater than zero",
	Lending__AmountExceedsLimit: "The amount exceeds the allowed limit",
	Lending__InsufficientLiquidity:
		"Insufficient liquidity in the contract for this operation",
	Lending__InsufficientCollateral:
		"Insufficient collateral balance for this operation",
	Lending__OutstandingDebt: "Cannot proceed - You have outstanding debt",
	Lending__LTVViolation:
		"Loan-to-Value ratio violation - The requested amount exceeds the allowed borrowing limit",
	Lending__TokenNotSupported: "This token is not supported as collateral",
	Lending__TokenAlreadySupported:
		"This token is already registered as supported collateral",
	Lending__PriceFeedNotAvailable: "Price feed not available for this token",
	Lending__NotLiquidatable:
		"This position cannot be liquidated - Debt is still in safe range",
	Lending__CollateralRaisingAlreadyOpen:
		"A collateral raising round is already in progress",
	Lending__CollateralRaisingAlreadyClosed:
		"The collateral raising round is already closed",
	Lending__CollateralRaisingTargetReached:
		"Cannot fund - Collateral raising target has been reached",
	Lending__CollateralRaisingTargetNotMet:
		"Cannot close - Collateral raising target has not been met",
	Lending__UnsettledDebt:
		"Cannot proceed - You have unsettled debt to funders (collateral or interest)",
};

/**
 * Converts contract error names to user-friendly messages
 */
export function getUserFriendlyError(errorName: string): string {
	return ERROR_MESSAGES[errorName] || `Operation failed: ${errorName}`;
}

/**
 * Parses common transaction errors into user-friendly messages
 */
export function getTransactionError(error: string): string {
	if (error.includes("user rejected")) {
		return "Transaction was rejected by the user";
	}
	if (error.includes("insufficient funds")) {
		return "Insufficient funds to complete the transaction";
	}
	if (error.includes("gas required exceeds")) {
		return "Transaction would exceed gas limits";
	}
	if (error.includes("nonce too low")) {
		return "Transaction nonce is invalid, please try again";
	}
	// Add more common error cases as needed

	return "Transaction failed. Please try again.";
}
