import routes from './routes.js';

export const store = Vue.reactive({
    dark: (() => {
        try {
            const value = localStorage.getItem('dark');
            return value === null ? false : JSON.parse(value);
        } catch {
            return false;
        }
    })(),
    toggleDark() {
        this.dark = !this.dark;
        localStorage.setItem('dark', JSON.stringify(this.dark));
    },
});

const app = Vue.createApp({
    data: () => ({ store }),
});
const router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
    routes,
});

app.use(router);

app.mount('#app');
