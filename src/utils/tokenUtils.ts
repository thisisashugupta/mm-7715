import { encodeAbiParameters, type Address } from "viem";

export const prepareERC20TokenTransferCallData = (recipient: Address, amount: bigint) => {
    const transferData = encodeAbiParameters(
        [
          { name: "recipient", type: "address" },
          { name: "amount", type: "uint256" },
        ],
        [recipient, amount]
      );

      // Prepend the function selector for the transfer function
      const transferSelector: Address = "0xa9059cbb"; // This is the selector for `transfer(address,uint256)`
      return transferSelector + transferData.slice(2) as Address;
}
