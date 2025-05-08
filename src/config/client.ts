import { createPublicClient, http } from "viem";
import { sepolia as chain } from "viem/chains";
import { createBundlerClient } from "viem/account-abstraction";
import { createPimlicoClient } from "permissionless/clients/pimlico";
import { erc7710BundlerActions } from "@metamask/delegation-toolkit/experimental";

const pimlicoKey = process.env.NEXT_PUBLIC_PIMLICO_API_KEY;
if (!pimlicoKey) {
    throw new Error("Pimlico API key is not set");
}
const pimlicoUrl = `https://api.pimlico.io/v2/${chain.id}/rpc?apikey=${pimlicoKey}`;

export const publicClient = createPublicClient({
  chain: chain,
  transport: http(),
});

export const bundlerClient = createBundlerClient({
  transport: http(pimlicoUrl),
  // Allows you to use the same Bundler Client as paymaster.
  paymaster: true
}).extend(erc7710BundlerActions());

export const pimlicoClient = createPimlicoClient({
  transport: http(pimlicoUrl),
});