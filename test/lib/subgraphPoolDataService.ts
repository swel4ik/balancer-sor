import fetch from 'isomorphic-fetch';
import { PoolDataService, SubgraphPoolBase } from '../../src';
import { getOnChainBalances } from './onchainData';
import { Provider } from '@ethersproject/providers';

const queryWithLinear = `
      {
        pool0: pools(
          first: 1000,
          where: { swapEnabled: true, totalShares_gt: "0.000000000001" },
          orderBy: totalLiquidity,
          orderDirection: desc
        ) {
          id
          address
          poolType
          swapFee
          totalShares
          tokens (orderBy: index) {
            address
            balance
            decimals
            weight
            priceRate
          }
          tokensList
          totalWeight
          amp
          expiryTime
          unitSeconds
          principalToken
          baseToken
          swapEnabled
          wrappedIndex
          mainIndex
          lowerTarget
          upperTarget
          sqrtAlpha
          sqrtBeta
          root3Alpha
          alpha
          beta
          c
          s
          lambda
          tauAlphaX
          tauAlphaY
          tauBetaX
          tauBetaY
          u
          v
          w
          z
          dSq
        }
        pool1000: pools(
          first: 1000,
          skip: 1000,
          where: { swapEnabled: true, totalShares_gt: "0.000000000001" },
          orderBy: totalLiquidity,
          orderDirection: desc
        ) {
          id
          address
          poolType
          swapFee
          totalShares
          tokens (orderBy: index) {
            address
            balance
            decimals
            weight
            priceRate
          }
          tokensList
          totalWeight
          amp
          expiryTime
          unitSeconds
          principalToken
          baseToken
          swapEnabled
          wrappedIndex
          mainIndex
          lowerTarget
          upperTarget
          sqrtAlpha
          sqrtBeta
          root3Alpha
          alpha
          beta
          c
          s
          lambda
          tauAlphaX
          tauAlphaY
          tauBetaX
          tauBetaY
          u
          v
          w
          z
          dSq
        }
      }
    `;

export const Query: { [chainId: number]: string } = {
    1: queryWithLinear,
    3: queryWithLinear,
    4: queryWithLinear,
    5: queryWithLinear,
    42: queryWithLinear,
    137: queryWithLinear,
    42161: queryWithLinear,
    100: queryWithLinear,
};

export class SubgraphPoolDataService implements PoolDataService {
    constructor(
        private readonly config: {
            chainId: number;
            multiAddress: string;
            vaultAddress: string;
            subgraphUrl: string;
            provider: Provider;
            onchain: boolean;
        }
    ) {}

    public async getPools(): Promise<SubgraphPoolBase[]> {
        const response = await fetch(this.config.subgraphUrl, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: Query[this.config.chainId] }),
        });

        const { data } = await response.json();

        const pools = [...data.pool0, ...data.pool1000];

        if (this.config.onchain) {
            return getOnChainBalances(
                pools ?? [],
                this.config.multiAddress,
                this.config.vaultAddress,
                this.config.provider
            );
        }

        return pools ?? [];
    }
}
