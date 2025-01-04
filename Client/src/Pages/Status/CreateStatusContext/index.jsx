import { createContext, React } from "react";

const StatusFormContext = createContext({
	form: {},
	setForm: () => {},
	errors: {},
	setErrors: () => {},
});

const StatusFormProvider = ({ form, setForm, errors, setErrors, children }) => {
	return (
		<StatusFormContext.Provider value={{ form, setForm, errors, setErrors }}>
			{children}
		</StatusFormContext.Provider>
	);
};

export { StatusFormContext, StatusFormProvider };
