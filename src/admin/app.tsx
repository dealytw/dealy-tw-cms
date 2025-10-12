import type { StrapiApp } from '@strapi/strapi/admin';

export default {
  config: {
    locales: [
      // 'ar',
      // 'fr',
      // 'cs',
      // 'de',
      // 'dk',
      // 'es',
      // 'he',
      // 'id',
      // 'it',
      // 'ja',
      // 'ko',
      // 'ms',
      // 'nl',
      // 'no',
      // 'pl',
      // 'pt-BR',
      // 'pt',
      // 'ru',
      // 'sk',
      // 'sv',
      // 'th',
      // 'tr',
      // 'uk',
      // 'vi',
      // 'zh-Hans',
      // 'zh',
    ],
       theme: {
         light: {
           colors: {
             // Soft milk tea primary colors
             primary100: '#f5f5dc',
             primary200: '#e6d3a3',
             primary500: '#d2b48c',
             primary600: '#bc9a6a',
             primary700: '#8b7355',
             
             // Soft status colors
             danger700: '#dc2626',
             success600: '#059669',
             warning600: '#d97706',
             
             // Milk tea buttons
             buttonPrimary600: '#d2b48c',
             buttonPrimary500: '#e6d3a3',
             
             // Pale brown background colors
             neutral0: '#f7f3f0',
             neutral100: '#ede7e3',
             neutral200: '#e6d3a3',
             neutral300: '#d2b48c',
             neutral400: '#bc9a6a',
             neutral500: '#8b7355',
             neutral600: '#6b5b47',
             neutral700: '#5a4a3a',
             neutral800: '#4a3a2e',
             neutral900: '#3a2a22',
           },
         },
         dark: {
           colors: {
             // Soft milk tea primary colors
             primary100: '#f5f5dc',
             primary200: '#e6d3a3',
             primary500: '#d2b48c',
             primary600: '#bc9a6a',
             primary700: '#8b7355',
             
             // Soft status colors
             danger700: '#dc2626',
             success600: '#059669',
             warning600: '#d97706',
             
             // Milk tea buttons
             buttonPrimary600: '#d2b48c',
             buttonPrimary500: '#e6d3a3',
             
             // Pale brown background colors
             neutral0: '#f7f3f0',
             neutral100: '#ede7e3',
             neutral200: '#e6d3a3',
             neutral300: '#d2b48c',
             neutral400: '#bc9a6a',
             neutral500: '#8b7355',
             neutral600: '#6b5b47',
             neutral700: '#5a4a3a',
             neutral800: '#4a3a2e',
             neutral900: '#3a2a22',
           },
         },
       },
  },
  bootstrap(app: StrapiApp) {
    console.log('Admin app initialized');
  },
};
