import { Stack } from "@mui/material";
import { useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
	UnsafeBurnerWalletAdapter,
	PhantomWalletAdapter,
} from "@solana/wallet-adapter-wallets";

import {
	WalletModalProvider,
	WalletMultiButton,
	WalletDisconnectButton,
} from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";

// Default styles that can be overridden by your app
import "@solana/wallet-adapter-react-ui/styles.css";

export const Wallet = () => {
	// The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
	const network = WalletAdapterNetwork.Devnet;

	// You can also provide a custom RPC endpoint.
	const endpoint = useMemo(() => clusterApiUrl(network), [network]);

	const wallets = useMemo(
		() => [new UnsafeBurnerWalletAdapter(), new PhantomWalletAdapter()],
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[network]
	);

	return (
		<ConnectionProvider endpoint={endpoint}>
			<WalletProvider
				wallets={wallets}
				autoConnect
			>
				<WalletModalProvider>
					<Stack
						direction="row"
						spacing={2}
					>
						<WalletMultiButton />
						<WalletDisconnectButton />
					</Stack>
					{/* Your app's components go here, nested within the context providers. */}
				</WalletModalProvider>
			</WalletProvider>
		</ConnectionProvider>
	);
};

export default Wallet;
