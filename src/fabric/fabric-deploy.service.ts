// src/fabric/fabric-deploy.service.ts
import { Injectable } from '@nestjs/common';
import { DeployParams, prepareDeployment } from '@withfabric/protocol-sdks/stpv2';
import { createPublicClient, http, zeroAddress } from 'viem';
import { configureFabricSDK } from '@withfabric/protocol-sdks';
import { connect, createConfig, getAccount, getConnectorClient } from '@wagmi/core';
import { mainnet, sepolia } from '@wagmi/core/chains';
import { privateKeyToAccount } from 'viem/accounts';

import { createConnector } from '@wagmi/core'
import { createWalletClient } from 'viem'

/**
 * Replace with your actual private key and desired chain.
 * NEVER commit real private keys to source control!
 */
const PRIVATE_KEY = "0x2e12ce2516445babcb474f2e472676e8d3fc9a30e9c71022e2f0a4ca3f981b10"; // Example private key
const CHAIN = sepolia

// Create Viem account and wallet client
const account = privateKeyToAccount(PRIVATE_KEY)
const walletClient = createWalletClient({
  account,
  chain: CHAIN,
  transport: http('https://rpc.ankr.com/eth_sepolia/d06cf2398a0e67b4f164a6871e37a068c5b3c710cf0be16b3254d7d558b07182'),
})

const publicClient = createPublicClient({
    chain: CHAIN,
    transport: http('https://rpc.ankr.com/eth_sepolia/d06cf2398a0e67b4f164a6871e37a068c5b3c710cf0be16b3254d7d558b07182'),
  })
/**
 * Viem Private Key Connector for wagmi/core.
 */
export const viemConnector = createConnector(() => ({
  id: 'viem',
  name: 'Viem Private Key',
  type: 'custom',

  // Called when "connecting" the connector
  async connect() {
    return {
      accounts: [account.address],
      chainId: sepolia.id,
    }
  },

  // Called when "disconnecting" the connector
  async disconnect() {
    // No-op for backend
  },

  // Returns the account address
  async getAccounts() {
    return [account.address]
  },

  // Returns the chain ID
  async getChainId() {
    return CHAIN.id
  },

  // get provider for viem
  async getProvider() {
    return walletClient // ✅ fix here
  },

  // Returns the wallet client for wagmi
  async getWalletClient() {
    return walletClient
  },

  // Optional: implement if you want to support chain switching
  //@ts-ignore
  async switchChain(chainId: number) {
    // Not implemented for this simple connector
    throw new Error('Chain switching not supported in ViemConnector')
  },

  // Optional: implement if you want to support message signing
  async signMessage({ message }: { message: string }) {
    return walletClient.signMessage({ account, message }) // ✅ fix here
  },

  async signTransaction({ transaction }: any) {
    return walletClient.signTransaction({ account, ...transaction, chain: CHAIN  })
  },

  async sendTransaction({ transaction }: any) {
    return walletClient.sendTransaction({ account, ...transaction, chain: CHAIN  }) // ✅ fix here
  },
}))

@Injectable()
export class FabricDeployService {
    async deploySubscription() {
        const wagmiConfig = createConfig({
            chains: [sepolia],
            connectors: [
              viemConnector,
            ],
            transports: {
                [sepolia.id]: http('https://rpc.ankr.com/eth_sepolia/d06cf2398a0e67b4f164a6871e37a068c5b3c710cf0be16b3254d7d558b07182'),
            },
        });
        const config = await connect(wagmiConfig, { connector: viemConnector });
        configureFabricSDK({
          //@ts-ignore
            wagmiConfig,
        });
        const account = getAccount(wagmiConfig)
        console.log('Connected account:', account)
        const params: DeployParams  = {
            clientFeeBps: 1000, // 10%
            clientReferralShareBps: 0, // 0%
            clientFeeRecipient: '0xB9Ca1c71b2e59BE9a262F73a482326B206195a20',
            deployKey: '0x6c652d6d656f772d31676f6a3371746e7263687330',
            initParams: {
                name: 'My Subscription',
                symbol: 'SUB',
                contractUri: 'https://example.com/contract-metadata.json',
                owner: '0xB9Ca1c71b2e59BE9a262F73a482326B206195a20',
                currencyAddress: "0x0000000000000000000000000000000000000000", // Native currency
                globalSupplyCap: BigInt(1000), // 1000 tokens
            },
            rewardParams: {
                slashable: false,
                slashGracePeriod: 3600, // 1 hour in seconds
            },
            curveParams: {
                numPeriods: 20,
                formulaBase: 2,
                periodSeconds: 3600, // 1 hour in seconds
                startTimestamp: 0,
                minMultiplier: 1,
            },
            tierParams: {
                periodDurationSeconds: 3600, // 1 hour in seconds
                maxSupply: 1000,
                maxCommitmentSeconds: 31536000, // 1 year in seconds
                startTimestamp: 0,
                endTimestamp: 0,
                paused: false,
                transferrable: true,
                initialMintPrice: BigInt(1000000000000000), // 0.001 ETH
                pricePerPeriod: BigInt(10000000000000), // 0.00001 ETH
                rewardCurveId: 0,
                rewardBasisPoints: 1000, // 10%
                gate: {
                    gateType: 0,
                    contractAddress: zeroAddress,
                    componentId: BigInt(0),
                    balanceMin: BigInt(0),
                }
            }
        }

        connect
        const deploy = await prepareDeployment(params);

        // Execute the deployment
        const {receipt, contractAddress} = await deploy()

        return {
            receipt, contractAddress
        }
    }
}