import "./Utils/i18n";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter as Router } from "react-router-dom";
import { Provider } from "react-redux";
import { persistor, store } from "./store";
import { PersistGate } from "redux-persist/integration/react";
import NetworkServiceProvider from "./Utils/NetworkServiceProvider.jsx";
import { networkService } from "./Utils/NetworkService";
import { Suspense } from "react";
export { networkService };

ReactDOM.createRoot(document.getElementById("root")).render(
	<Provider store={store}>
		<PersistGate
			loading={null}
			persistor={persistor}
		>
			<Router>
				<NetworkServiceProvider>
					<Suspense fallback="Loading...">
						<App />
					</Suspense>
				</NetworkServiceProvider>
			</Router>
		</PersistGate>
	</Provider>
);
