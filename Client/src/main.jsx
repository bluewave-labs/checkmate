import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter as Router } from "react-router-dom";
import { Provider } from "react-redux";
import { persistor, store } from "./store";
import { PersistGate } from "redux-persist/integration/react";
import NetworkServiceProvider from "./Utils/NetworkServiceProvider.jsx";
import { networkService } from "./Utils/NetworkService";
import { TolgeeProvider, DevTools } from "@tolgee/react";
import tolgee from "./Utils/tolgee";

export { networkService };

ReactDOM.createRoot(document.getElementById("root")).render(
	<Provider store={store}>
		<PersistGate
			loading={null}
			persistor={persistor}
		>
			<Router>
				<NetworkServiceProvider>
					<TolgeeProvider
						tolgee={tolgee}
						options={{
							useSuspense: false,
							preloadData: true,
						}}
					>
						<App />
						{import.meta.env.DEV && <DevTools />}
					</TolgeeProvider>
				</NetworkServiceProvider>
			</Router>
		</PersistGate>
	</Provider>
);
