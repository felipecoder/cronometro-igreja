<template>
    <div
        class="min-h-screen flex flex-col items-center justify-center p-6"
        :class="{
            'bg-black text-white': themeStore.theme === 'dark',
            'bg-white text-black': themeStore.theme === 'light',
        }"
    >
        <div class="text-[12vh] font-bold uppercase">{{ timer.label }}</div>

        <div
            class="text-[20vh] font-extrabold mb-6 transition-all"
            :class="{
                'text-red-600 animate-pulse':
                    timer.remaining <= 0 || timer.isHighlight,
            }"
        >
            {{ timer.formatted }}
        </div>

        <div class="flex gap-3">
            <button
                @click="timer.start"
                class="px-4 py-2 bg-green-600 text-white rounded-lg"
            >
                Iniciar
            </button>
            <button
                @click="timer.stop"
                class="px-4 py-2 bg-yellow-500 text-black rounded-lg"
            >
                Pausar
            </button>
            <button
                @click="timer.reset"
                class="px-4 py-2 bg-red-600 text-white rounded-lg"
            >
                Reiniciar
            </button>
        </div>
        <button
            @click="openProjector"
            class="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
            Tela de Projeção
        </button>

        <!-- Configuração -->
        <div class="mt-8 flex gap-3 text-center">
            <input
                v-model="timer.label"
                @change="timer.setLabel(timer.label)"
                class="border p-2 rounded text-black"
                placeholder="Nome do contador"
            />

            <input
                type="number"
                min="1"
                @change="timer.setTime($event.target.value)"
                class="border p-2 rounded text-black"
                placeholder="Minutos (Ex: 20)"
            />

            <input
                type="number"
                min="1"
                @change="timer.setHighlight($event.target.value)"
                class="border p-2 rounded text-black"
                placeholder="Min. antes p/ vermelho (Ex: 3)"
            />
        </div>

        <div class="mt-4 space-y-2 text-center">
            <select
                v-model="themeStore.theme"
                @change="themeStore.setTheme(themeStore.theme)"
                class="border p-2 rounded text-black"
            >
                <option value="light">Claro</option>
                <option value="dark">Escuro</option>
            </select>
        </div>
    </div>
</template>

<script setup>
import { watch, onMounted } from "vue";
import { useChurchTimer } from "./stores/churchTimer";
import { useThemeStore } from "./stores/theme";

const timer = useChurchTimer();
const themeStore = useThemeStore();
themeStore.applyTheme();

watch(
    () => timer.remaining,
    () => {
        window.electronAPI.sendTimer({
            label: timer.label,
            formatted: timer.formatted,
            highlight: timer.isHighlight,
        });
    }
);

watch(
    () => themeStore.theme,
    () => {
        window.electronAPI.sendTheme({
            theme: themeStore.theme
        });
    }
);

const isElectron = !!window.electronAPI;

const openProjector = () => {
    if (isElectron) {
        window.electronAPI.openProjector();
    } else {
        console.log("Modo Dev: Tela de projeção não disponível.");
    }
};

onMounted(() => {
    window.electronAPI.onEsc(() => {
        window.electronAPI.closeProjector();
    });
});
</script>
