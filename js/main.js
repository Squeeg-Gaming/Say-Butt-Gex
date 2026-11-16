import routes from './routes.js';
import { setRandomTextFontsEnabled } from './randomFonts.js';

const initialSiteTitle =
    Math.random() < 1 / 33 ? 'I LOVE TOM PEARL' : 'The Poop List';
document.title = initialSiteTitle;

export const store = Vue.reactive({
    musicPlaying: false,
    easterEggEnabled: false,
    siteTitle: initialSiteTitle,
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
    toggleEasterEgg() {
        this.easterEggEnabled = !this.easterEggEnabled;
        setRandomTextFontsEnabled(this.easterEggEnabled);
        this.siteTitle = this.easterEggEnabled
            ? 'I LOVE TOM PEARL'
            : initialSiteTitle;
        document.title = this.siteTitle;
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

const music = document.getElementById('background-music');
if (music) {
    music.loop = true;
    music.muted = false;

    const removeInteractionListeners = () => {
        document.removeEventListener('pointerdown', startMusic);
        document.removeEventListener('keydown', startMusic);
    };
    const startMusic = (event) => {
        if (event && event.target.closest && event.target.closest('#music-toggle')) {
            return;
        }

        music.play().then(() => {
            store.musicPlaying = true;
            removeInteractionListeners();
        }).catch((error) => {
            store.musicPlaying = false;
            if (error.name !== 'NotAllowedError') {
                console.error('Unable to play background music.', error);
            }
        });
    };

    document.addEventListener('pointerdown', startMusic);
    document.addEventListener('keydown', startMusic);
    window.setTimeout(startMusic, 2000);
}
