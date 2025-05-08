import { Address, createWalletClient, custom, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia as chain } from "viem/chains";
import { erc7715ProviderActions } from "@metamask/delegation-toolkit/experimental";
import { toMetaMaskSmartAccount, Implementation } from "@metamask/delegation-toolkit";
import { publicClient } from './client'

const privateKey = process.env.NEXT_PUBLIC_SESSION_OWNER_PRIVATE_KEY as Address;
if (!privateKey) {
  throw new Error("NEXT_PUBLIC_SESSION_OWNER_PRIVATE_KEY is not defined");
}

const account = privateKeyToAccount(privateKey);

console.log("session account owner:", account.address);

export const sessionAccount = await toMetaMaskSmartAccount({
  client: publicClient,
  implementation: Implementation.Hybrid,
  deployParams: [account.address, [], [], []],
  deploySalt: "0x",
  signatory: { account },
});

console.log("session account:", sessionAccount.address);

let walletClient;

if (typeof window === "undefined") {
    walletClient = createWalletClient({
      transport: http(),
      chain: chain,
    }).extend(erc7715ProviderActions());
} else {
    walletClient = createWalletClient({
        transport: custom(window?.ethereum),
        chain: chain,
      }).extend(erc7715ProviderActions());      
}

export { walletClient }