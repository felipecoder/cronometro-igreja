import { defineStore } from "pinia";

export const useThemeStore = defineStore("theme", {
    state: () => ({
        theme: localStorage.getItem("theme") || "dark",
    }),
    actions: {
        setTheme(t) {
            this.theme = t;
            localStorage.setItem("theme", t);
            this.applyTheme();
        },
        applyTheme() {
            let dark = false;
            if (this.theme === "system") {
                dark = window.matchMedia(
                    "(prefers-color-scheme: dark)"
                ).matches;
            } else {
                dark = this.theme === "dark";
            }

            document.documentElement.classList.toggle("dark", dark);
        },
    },
});
