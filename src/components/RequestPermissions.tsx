import { sepolia as chain } from "viem/chains";
import { sessionAccount, walletClient } from "../config/session-account";
import { bundlerClient, publicClient, pimlicoClient } from "@/config/client";
import { prepareERC20TokenTransferCallData } from "@/utils/tokenUtils";
import { Hex, parseUnits, toHex } from "viem";

const expiry = Math.floor(Date.now() / 1000 + 604_800); // 1 week from now.
const currentTime = Math.floor(Date.now() / 1000); // now

const recipient: Hex = '0x0FaAcdc46CcE444BFDd63Cde4EE3E5D987E59c97';
const nativeTokenValue = parseUnits('0.001', 18); // 0.001 ETH
const tokenAddress: Hex = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'; // USDC
const tokenAllowance = BigInt(1_500_000); // 1.5 USDC

const nativeTokenStreamPermission = {
    type: "native-token-stream",
    data: {
        initialAmount: nativeTokenValue, // 0.001 ETH
        amountPerSecond: BigInt(1), // 1 wei per second
        maxAmount: parseUnits('0.002', 18), // 0.002 ETH
        startTime: currentTime,
        justification: "Payment for 0.002 ETH",
    },
}

const nativeTokenTransferPermission = {
    type: 'native-token-transfer',
    data: {
        allowance: toHex(nativeTokenValue), // 0.001 ETH
    }
  }

const erc20TokenTransferPermission = {
    type: "erc20-token-transfer",
    data: {
      address: tokenAddress, // erc20 contract
      allowance: toHex(tokenAllowance), // hex value
      justification: `${Number(tokenAllowance)/1e6} USDC spend alowance`,
    },
}

const nativeTokenTransferCall = {
    to: recipient,
    data: '0x' as Hex,
    value: nativeTokenValue,
}

const erc20TokenTransferCall = {
    to: tokenAddress,
    data: prepareERC20TokenTransferCallData('0x0FaAcdc46CcE444BFDd63Cde4EE3E5D987E59c97', BigInt(500_000)) as Hex,
    value: BigInt(0),
}

const getGrantedPermissions = async () => {

    // Get the permissions -- off-chain
    const permissionsResponse = await walletClient.grantPermissions([{
        chainId: chain.id,
        expiry,
        signer: {
            type: "account",
            data: {
                address: sessionAccount.address,
            },
        },
        permission: nativeTokenStreamPermission,
    }]);


    // Extract relevant data
    const permissionsContext = permissionsResponse[0].context;
    console.log('permissionsContext', permissionsContext);
    localStorage.setItem("permissionsContext", permissionsContext);
    const delegationManager = permissionsResponse[0]?.signerMeta?.delegationManager;
    console.log('delegationManager', delegationManager);
    // accountMeta is only present when the smart contract account (whose owner is connected ethereum wallet) is not deployed.
    const accountMetadata = permissionsResponse[0].accountMeta;
    console.log('accountMetadata', accountMetadata);

    const { fast: fee } = await pimlicoClient.getUserOperationGasPrice();
    console.log('fee', fee);

    // Calls without permissionsContext and delegationManager will be executed 
    // as a normal user operation.

    const userOperationHash = await bundlerClient.sendUserOperationWithDelegation({
    publicClient,
    account: sessionAccount, // userOp sender
    calls: [
        {
        ...nativeTokenTransferCall,
        permissionsContext,
        delegationManager: delegationManager!,
        },
    ],
    ...fee,
    // verificationGasLimit: BigInt(100_000),
    // accountMetadata: accountMetadata,
    });

    console.log('userOperationHash', userOperationHash);

    return permissionsResponse;
}

export default function RequestPermissions() {
    return <button
            className="bg-blue-500 text-white font-bold py-2 px-4 rounded"
            onClick={async () => {
                const permissions = await getGrantedPermissions();
                localStorage.setItem("permissions", JSON.stringify(permissions));
                console.log(permissions);
            }}
        >
            Request Permissions
        </button>
}

const pCtx = "0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000020000000000000000000000000324d1f3ce0d3d48153b037775a5b5c34039bd12600000000000000000000000029dcabcfed2f3abdd8d097521032df9f9936dc4fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff00000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003c00000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000001800000000000000000000000000000000000000000000000000000000000000220000000000000000000000000d10b97905a320b13a0608f7e9cc506b56747df1900000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000038d7ea4c6800000000000000000000000000000000000000000000000000000071afd498d0000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000681bf400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000099f2e9bf15ce5ec84685604836f71ab835dbbded00000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001046bb45c8d673d4ea75321280db34899413c069000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000068252e80000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000414d81347ee4aaf040db4e7de793190c577f4bd3cc9fb19379b96434a54b1828f418ecc2a7d7afe42aa39029a9ecd052d015fb98bad5334ead79210ee60c2192f01b00000000000000000000000000000000000000000000000000000000000000"