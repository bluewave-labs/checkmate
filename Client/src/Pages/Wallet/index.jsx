import {
	WalletNotConnectedError,
	WalletAdapterNetwork,
} from "@solana/wallet-adapter-base";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { clusterApiUrl } from "@solana/web3.js";
import { useMemo, useEffect } from "react";
import {
	UnsafeBurnerWalletAdapter,
	PhantomWalletAdapter,
} from "@solana/wallet-adapter-wallets";
const Wallet = () => {
	const { connection } = useConnection();
	const { publicKey, sendTransaction } = useWallet();

	useEffect(() => {
		try {
			if (!publicKey) return;
			const getBalance = async () => {
				const balance = await connection.getBalance(publicKey);
				console.log({ balance });
			};
			getBalance();
		} catch (error) {
			console.log(error);
		}
	}, [connection, publicKey]);
	return <div>Wallet</div>;
};

const Provider = () => {
	const network = WalletAdapterNetwork.Devnet;
	const wallets = useMemo(
		() => [new UnsafeBurnerWalletAdapter(), new PhantomWalletAdapter()],
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[network]
	);
	const endpoint = useMemo(() => clusterApiUrl(network), [network]);

	return (
		<ConnectionProvider endpoint={endpoint}>
			<WalletProvider
				wallets={wallets}
				autoConnect
			>
				<Wallet />
			</WalletProvider>
		</ConnectionProvider>
	);
};

export default Provider;
