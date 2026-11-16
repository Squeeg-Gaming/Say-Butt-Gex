import routes from './routes.js';
import { enableRandomTextFonts } from './randomFonts.js';

export const store = Vue.reactive({
    musicPlaying: false,
    dark: (() => {
        try {
            const value = localStorage.getItem('dark');
            return value === null ? true : JSON.parse(value);
        } catch {
            return true;
        }
    })(),
    toggleDark() {
        this.dark = !this.dark;
        localStorage.setItem('dark', JSON.stringify(this.dark));
    },
    async toggleMusic() {
        const music = document.getElementById('background-music');
        if (this.musicPlaying) {
            music.pause();
            this.musicPlaying = false;
            return;
        }

        try {
            await music.play();
            this.musicPlaying = true;
        } catch (error) {
            if (error.name !== 'NotAllowedError') {
                console.error('Unable to play background music.', error);
            }
        }
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
enableRandomTextFonts();
