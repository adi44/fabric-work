import { http, createConfig} from '@wagmi/core';
import { mainnet, sepolia } from '@wagmi/core/chains';
import { createWalletClient } from 'viem';

export const wagmiConfig = createConfig({
    chains: [mainnet, sepolia],
    transports: {
        [mainnet.id]: http('https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID'),
        [sepolia.id]: http('https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID'),
    },
});
