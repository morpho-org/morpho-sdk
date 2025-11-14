import { fetchAccrualVaultV2, fetchVaultV2 } from "@morpho-org/blue-sdk-viem";
import type { Address } from "viem";
import {
  vaultV2Deposit,
  getRequirements,
  vaultV2Redeem,
  vaultV2Withdraw,
} from "../../actions";
import { withTelemetry } from "../../telemetry/wrapper";
import type {
  ERC20ApprovalAction,
  MorphoClient,
  Transaction,
  VaultV2DepositAction,
  VaultV2RedeemAction,
  VaultV2WithdrawAction,
} from "../../types";
import { MissingAddressError, MissingChainIdError } from "../../types";

export interface VaultV2Actions {
  getData: () => Promise<Awaited<ReturnType<typeof fetchAccrualVaultV2>>>;
  deposit: (params: { assets: bigint }) => Promise<{
    tx: Readonly<Transaction<VaultV2DepositAction>>;
    getRequirements: () => Promise<
      Readonly<Transaction<ERC20ApprovalAction>[]>
    >;
  }>;
  withdraw: (params: { assets: bigint }) => {
    tx: Readonly<Transaction<VaultV2WithdrawAction>>;
  };
  redeem: (params: { shares: bigint }) => {
    tx: Readonly<Transaction<VaultV2RedeemAction>>;
  };
}

export class VaultV2 implements VaultV2Actions {
  private readonly client: MorphoClient;
  private readonly vault: Address;

  constructor(client: MorphoClient, vault: Address) {
    this.client = client;
    this.vault = vault;
  }

  private get userAddress(): Address {
    const address = this.client.walletClient.account?.address;
    if (!address) {
      throw new MissingAddressError();
    }
    return address;
  }

  private get chainId(): number {
    const id = this.client.walletClient.chain?.id;
    if (!id) {
      throw new MissingChainIdError();
    }
    return id;
  }

  getData = withTelemetry("vaultV2.getData", async () =>
    fetchAccrualVaultV2(this.vault, this.client.walletClient)
  );

  deposit = async ({ assets }: { assets: bigint }) => {
    const vaultData = await fetchVaultV2(this.vault, this.client.walletClient);

    return {
      tx: vaultV2Deposit({
        vault: {
          chainId: this.chainId,
          asset: vaultData.asset,
          address: this.vault,
        },
        args: {
          assets,
          shares: vaultData.toShares(assets),
          recipient: this.userAddress,
        },
        metadata: this.client.metadata,
      }),
      getRequirements: async () =>
        getRequirements(this.client, {
          address: vaultData.asset,
          args: { amount: assets, from: this.userAddress },
        }),
    };
  };

  withdraw = ({ assets }: { assets: bigint }) => {
    return {
      tx: vaultV2Withdraw({
        vault: { address: this.vault },
        args: {
          assets,
          recipient: this.userAddress,
          onBehalf: this.userAddress,
        },
        metadata: this.client.metadata,
      }),
    };
  };

  redeem = ({ shares }: { shares: bigint }) => {
    return {
      tx: vaultV2Redeem({
        vault: { address: this.vault },
        args: {
          shares,
          recipient: this.userAddress,
          onBehalf: this.userAddress,
        },
        metadata: this.client.metadata,
      }),
    };
  };
}

export const instantiateVaultV2 = withTelemetry(
  "vaultV2.instantiate",
  (client: MorphoClient, vault: Address) => new VaultV2(client, vault)
);
