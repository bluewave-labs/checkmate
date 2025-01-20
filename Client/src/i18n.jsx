import i18n from "i18next"
import { initReactI18next } from "react-i18next"

i18n.use(initReactI18next).init({
    debug: process.env.NODE_ENV === 'development',
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
                Profile: "Profile1",
                Password: "Password1",
                Team: "Team1",
                Support: "Support",
                Discussions: "Discussion",
                Docs: "Docs",
                Changelog: "Changelog",
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
                Other: "Otro",
                Profile: "Perfil",
                Password: "Contraseña",
                Team: "Equipo",
                Support: "Apoyo",
                Discussions: "Discusión",
                Docs: "Documentos",
                Changelog: "Registro de cambios",
            }
        }
    }
})

export default i18n