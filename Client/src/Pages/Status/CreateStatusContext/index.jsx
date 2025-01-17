import { createContext, React } from "react";

const StatusFormContext = createContext({
	form: {},
	setForm: () => {},
	errors: {},
	setErrors: () => {},
	handleBlur: () => {},
	handleChange: () => {},
	handelCheckboxChange: () =>{}
});

const StatusFormProvider = ({
	form,
	setForm,
	errors,
	setErrors,
	handleBlur,
	handleChange,
	handelCheckboxChange,
	children,
}) => {
	return (
		<StatusFormContext.Provider
			value={{
				form,
				setForm,
				errors,
				setErrors,
				handleBlur,
				handleChange,
				handelCheckboxChange,
			}}
		>
			{children}
		</StatusFormContext.Provider>
	);
};

export { StatusFormContext, StatusFormProvider };
