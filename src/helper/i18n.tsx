import i18n, { InitOptions } from 'i18next';
import { initReactI18next } from 'react-i18next';

import Backend, { HttpBackendOptions } from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

const be_opt: HttpBackendOptions = {
    loadPath: '/i18n/{{lng}}/{{ns}}.json',
    addPath: '/api/i18n/{{lng}}/{{ns}}/create',
    crossDomain: true
}

const i18n_opt: InitOptions = {
    supportedLngs: ['en', 'id'],
    fallbackLng: 'en',
    backend: be_opt,
    debug: true,
    saveMissing:true
}

const i18n_c = i18n
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init(i18n_opt)

export default i18n_c