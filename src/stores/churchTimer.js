import { defineStore } from "pinia";

export const useChurchTimer = defineStore("churchTimer", {
    state: () => ({
        label: localStorage.getItem("label") || "Oferta",
        totalSeconds: Number(localStorage.getItem("totalSeconds")) || 20 * 60,
        remaining: Number(localStorage.getItem("remaining")) || 20 * 60,
        highlightSeconds:
            Number(localStorage.getItem("highlightSeconds")) || 3 * 60,
        running: false,
        interval: null,
    }),

    actions: {
        setLabel(val) {
            this.label = val;
            localStorage.setItem("label", val);
        },

        setTime(minutes) {
            this.totalSeconds = minutes * 60;
            this.remaining = minutes * 60;
            localStorage.setItem("totalSeconds", this.totalSeconds);
            localStorage.setItem("remaining", this.remaining);
        },

        setHighlight(minutes) {
            this.highlightSeconds = minutes * 60;
            localStorage.setItem("highlightSeconds", this.highlightSeconds);
        },

        start() {
            if (this.running) return;
            this.running = true;
            this.interval = setInterval(() => {
                if (this.remaining > 0) {
                    this.remaining--;
                    localStorage.setItem("remaining", this.remaining);
                } else {
                    this.stop();
                }
            }, 1000);
        },

        stop() {
            this.running = false;
            clearInterval(this.interval);
        },

        reset() {
            this.stop();
            this.remaining = this.totalSeconds;
            localStorage.setItem("remaining", this.remaining);
        },
    },

    getters: {
        formatted() {
            if (this.remaining <= 0) return "TEMPO ESGOTADO";

            const h = Math.floor(this.remaining / 3600);
            const m = Math.floor((this.remaining % 3600) / 60);
            const s = this.remaining % 60;

            const hh = h > 0 ? String(h).padStart(2, "0") + ":" : "";
            return `${hh}${String(m).padStart(2, "0")}:${String(s).padStart(
                2,
                "0"
            )}`;
        },

        isHighlight() {
            return (
                this.remaining <= this.highlightSeconds && this.remaining > 0
            );
        },
    },
});
