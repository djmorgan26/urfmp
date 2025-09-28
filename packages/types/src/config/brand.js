"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBrandConfig = exports.defaultBrandConfig = void 0;
exports.defaultBrandConfig = {
    companyName: 'URFMP',
    companyNameShort: 'URFMP',
    productName: 'URFMP',
    productFullName: 'Universal Robot Fleet Management Platform',
    tagline: 'The Stripe of Robotics',
    description: 'Monitor any robot in 7 lines of code'
};
// Environment variable override support
const getBrandConfig = () => {
    if (typeof process !== 'undefined' && process.env) {
        return {
            companyName: process.env.VITE_COMPANY_NAME || process.env.COMPANY_NAME || exports.defaultBrandConfig.companyName,
            companyNameShort: process.env.VITE_COMPANY_NAME_SHORT || process.env.COMPANY_NAME_SHORT || exports.defaultBrandConfig.companyNameShort,
            productName: process.env.VITE_PRODUCT_NAME || process.env.PRODUCT_NAME || exports.defaultBrandConfig.productName,
            productFullName: process.env.VITE_PRODUCT_FULL_NAME || process.env.PRODUCT_FULL_NAME || exports.defaultBrandConfig.productFullName,
            tagline: process.env.VITE_TAGLINE || process.env.TAGLINE || exports.defaultBrandConfig.tagline,
            description: process.env.VITE_DESCRIPTION || process.env.DESCRIPTION || exports.defaultBrandConfig.description
        };
    }
    return exports.defaultBrandConfig;
};
exports.getBrandConfig = getBrandConfig;
//# sourceMappingURL=brand.js.map