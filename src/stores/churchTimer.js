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
        overtime: 0, // Tempo excedido em segundos
        presets: JSON.parse(localStorage.getItem("timerPresets") || "[]"),
        currentTime: "", // Relógio atual HH:mm:ss
        showClock: localStorage.getItem("showClock") === "true",
        clockInterval: null,
        timeOffset: 0, // Diferença entre hora da internet e local
        projectorMode: localStorage.getItem("projectorMode") || "timer", // "timer" ou "clock"
    }),

    actions: {
        setLabel(val) {
            this.label = val;
            localStorage.setItem("label", val);
        },

        setTime(minutes) {
            this.totalSeconds = minutes * 60;
            this.remaining = minutes * 60;
            this.overtime = 0;
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
                    // Contagem negativa (tempo excedido)
                    this.overtime++;
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
            this.overtime = 0;
            localStorage.setItem("remaining", this.remaining);
        },

        // Predefinições de timers
        savePreset(name, minutes) {
            const preset = { id: Date.now(), name, minutes };
            this.presets.push(preset);
            localStorage.setItem("timerPresets", JSON.stringify(this.presets));
        },

        loadPreset(preset) {
            this.setLabel(preset.name);
            this.setTime(preset.minutes);
            this.overtime = 0;
        },

        deletePreset(id) {
            this.presets = this.presets.filter((p) => p.id !== id);
            localStorage.setItem("timerPresets", JSON.stringify(this.presets));
        },

        // Relógio
        toggleClock() {
            this.showClock = !this.showClock;
            localStorage.setItem("showClock", this.showClock);
            if (this.showClock) {
                this.startClock();
            } else {
                this.stopClock();
            }
        },

        async syncTimeFromInternet() {
            try {
                // Usa a API worldtimeapi para obter hora precisa
                const response = await fetch(
                    "https://worldtimeapi.org/api/ip"
                );
                const data = await response.json();
                const serverTime = new Date(data.datetime);
                const localTime = new Date();
                this.timeOffset = serverTime.getTime() - localTime.getTime();
            } catch (error) {
                console.warn(
                    "Não foi possível sincronizar com a internet, usando hora local:",
                    error
                );
                this.timeOffset = 0;
            }
        },

        startClock() {
            this.syncTimeFromInternet();
            this.updateCurrentTime();
            this.clockInterval = setInterval(() => {
                this.updateCurrentTime();
            }, 1000);
        },

        stopClock() {
            clearInterval(this.clockInterval);
            this.currentTime = "";
        },

        updateCurrentTime() {
            const now = new Date(Date.now() + this.timeOffset);
            const h = String(now.getHours()).padStart(2, "0");
            const m = String(now.getMinutes()).padStart(2, "0");
            const s = String(now.getSeconds()).padStart(2, "0");
            this.currentTime = `${h}:${m}:${s}`;
        },

        setProjectorMode(mode) {
            this.projectorMode = mode;
            localStorage.setItem("projectorMode", mode);
            if (mode === "clock" && !this.clockInterval) {
                this.startClock();
            }
        },
    },

    getters: {
        formatted() {
            // Se tempo esgotado e tem overtime, mostra contagem negativa
            if (this.remaining <= 0 && this.overtime > 0) {
                const h = Math.floor(this.overtime / 3600);
                const m = Math.floor((this.overtime % 3600) / 60);
                const s = this.overtime % 60;
                const hh = h > 0 ? String(h).padStart(2, "0") + ":" : "";
                return `-${hh}${String(m).padStart(2, "0")}:${String(s).padStart(
                    2,
                    "0"
                )}`;
            }

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

        isOvertime() {
            return this.remaining <= 0 && this.overtime > 0;
        },
    },
});
