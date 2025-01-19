import i18n from "i18next"
import { initReactI18next } from "react-i18next"

i18n.use(initReactI18next).init({
    debug: true,
    fallbackLng: "en",

    resources: {
        en: {
            translation: {
                Menu: "MENU",
                Uptime: "Uptime",
                Pagespeed: "Pagespeed",
                Infrastructure: "Infrastructure",
                Incidents: "Incidents",
                Maintenance: "Maintenance",
                Account: "Account",
                Settings: "Settings",
                Other: "Other",
            },
        },
        es: {
            translation: {
                Menu: "MENÚ",
                Uptime: "Tiempo de actividad",
                Pagespeed: "Velocidad de la página",
                Infrastructure: "Infraestructura",
                Incidents: "Incidentes",
                Maintenance: "Mantenimiento",
                Account: "Cuenta",
                Settings: "Ajuste",
                Other: "Otro"
            }
        }
    }
})

export default i18n