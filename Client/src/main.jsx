import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter as Router } from "react-router-dom";
import { Provider } from "react-redux";
import { persistor, store } from "./store";
import { PersistGate } from "redux-persist/integration/react";
import NetworkServiceProvider from "./Utils/NetworkServiceProvider.jsx";
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { networkService } from "./Utils/NetworkService";
export { networkService };

ReactDOM.createRoot(document.getElementById("root")).render(
	<Provider store={store}>
		<PersistGate
			loading={null}
			persistor={persistor}
		>
			<Router>
				<NetworkServiceProvider>
					<DndProvider backend={HTML5Backend}>
						<App />
					</DndProvider>
				</NetworkServiceProvider>
			</Router>
		</PersistGate>
	</Provider>
);
