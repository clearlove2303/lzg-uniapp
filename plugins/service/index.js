import user from './core/user';
import tool from './core/tool';
import message from './core/message';
import article from './core/article';
import document from './core/document';
import category from './core/category';

const services = {
    user,
    tool,
    message,
    article,
    document,
    category,
}

services.install = function (Vue) {
    Vue.prototype.$services = services;
};

export default services;