import {
  StellarWalletsKit,
  FREIGHTER_ID,
  FreighterModule,
  AlbedoModule,
  LobstrModule,
  xBullModule,
  HanaModule,
  WalletNetwork,
  ISupportedWallet,
} from "@creit.tech/stellar-wallets-kit";

const INJECTED_WALLETS = ["freighter", "albedo", "lobstr"] as unknown as string[];
const RAW_NETWORK = (process.env.NEXT_PUBLIC_STELLAR_NETWORK || "testnet").toLowerCase();
const KIT_NETWORK =
  RAW_NETWORK === "mainnet" || RAW_NETWORK === "public"
    ? WalletNetwork.PUBLIC
    : WalletNetwork.TESTNET;

let kitInstance: StellarWalletsKit | null = null;

export const getKit = (): StellarWalletsKit => {
  if (typeof window === 'undefined') {
    return {} as StellarWalletsKit;
  }
  
  if (!kitInstance) {
    const modules: Array<FreighterModule | AlbedoModule | LobstrModule | xBullModule | HanaModule> = [];
    const walletList = Array.isArray(INJECTED_WALLETS) ? INJECTED_WALLETS : ['freighter', 'albedo', 'lobstr'];

    if (walletList.includes('freighter')) modules.push(new FreighterModule());
    if (walletList.includes('albedo')) modules.push(new AlbedoModule());
    if (walletList.includes('lobstr')) modules.push(new LobstrModule());
    if (walletList.includes('xbull')) modules.push(new xBullModule());
    if (walletList.includes('hana')) modules.push(new HanaModule());

    kitInstance = new StellarWalletsKit({
      network: KIT_NETWORK,
      selectedWalletId: FREIGHTER_ID,
      modules: modules.length > 0 ? modules : [new FreighterModule(), new AlbedoModule(), new LobstrModule()],
    });
  }
  
  return kitInstance;
};

export const kit = () => getKit();

interface signTransactionProps {
  unsignedTransaction: string;
  address: string;
}

export const signTransaction = async ({
  unsignedTransaction,
  address,
}: signTransactionProps): Promise<string> => {
  const { signedTxXdr } = await getKit().signTransaction(unsignedTransaction, {
    address,
  });

  return signedTxXdr;
};

interface signMessageProps {
  message: string;
  address: string;
}

/**
 * Signs an arbitrary message (not a transaction) for the backend's
 * challenge/verify wallet login flow — the backend verifies this signature
 * with `Keypair.verify(Buffer.from(message, "utf8"), signatureBase64)`.
 */
export const signMessage = async ({
  message,
  address,
}: signMessageProps): Promise<string> => {
  const { signedMessage } = await getKit().signMessage(message, {
    address,
  });

  return signedMessage;
};
