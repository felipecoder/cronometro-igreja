<template>
    <div
        class="flex flex-col items-center justify-center h-screen relative"
        :class="{
            'bg-black text-white': theme === 'dark',
            'bg-white text-black': theme === 'light',
        }"
    >
        <!-- Modo Relógio -->
        <template v-if="projectorMode === 'clock'">
            <div class="text-[10vw] font-bold uppercase">Horário</div>
            <div class="text-[20vw] font-bold font-mono">
                {{ currentTime || '--:--:--' }}
            </div>
        </template>

        <!-- Modo Cronômetro -->
        <template v-else>
            <!-- Relógio no canto superior -->
            <div
                v-if="showClock && currentTime"
                class="absolute top-4 left-4 text-[3vw] font-mono opacity-70"
            >
                {{ currentTime }}
            </div>

            <div class="text-[10vw] font-bold uppercase">{{ label }}</div>
            <div
                class="font-bold tracking-wide"
                :class="{
                    'text-red-600 animate-pulse':
                        highlight || isOvertime || formatted === 'TEMPO ESGOTADO',
                    'text-[25vw]': formatted !== 'TEMPO ESGOTADO' && !isOvertime,
                    'text-[15vw]': isOvertime,
                    'text-[9vw]': formatted === 'TEMPO ESGOTADO' && !isOvertime,
                }"
            >
                <div v-if="isOvertime" class="text-[5vw] mb-2">TEMPO EXCEDIDO</div>
                {{ formatted }}
            </div>
        </template>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useThemeStore } from "./stores/theme";

const label = ref("INICIANDO");
const formatted = ref("00:00");
const highlight = ref(false);
const isOvertime = ref(false);
const currentTime = ref("");
const showClock = ref(false);
const projectorMode = ref("timer");
const themeStore = useThemeStore();
const theme = ref(themeStore.theme);

onMounted(() => {
    window.electronAPI.onTimer((data) => {
        label.value = data.label;
        formatted.value = data.formatted;
        highlight.value = data.highlight;
        isOvertime.value = data.isOvertime || false;
        currentTime.value = data.currentTime || "";
        showClock.value = data.showClock || false;
        projectorMode.value = data.projectorMode || "timer";
    });

    window.electronAPI.onThemeChange((data) => {
        theme.value = data.theme;
    });

    window.electronAPI.onEsc(() => {
        window.electronAPI.closeProjector();
    });
});
</script>
