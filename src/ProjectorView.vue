<template>
    <div
        class="flex flex-col items-center justify-center h-screen"
        :class="{
            'bg-black text-white': theme === 'dark',
            'bg-white text-black': theme === 'light',
        }"
    >
        <div class="text-[10vw] font-bold uppercase">{{ label }}</div>
        <div
            class="font-bold tracking-wide"
            :class="{
                'text-red-600 animate-pulse':
                    highlight || formatted === 'TEMPO ESGOTADO',
                'text-[25vw]': formatted !== 'TEMPO ESGOTADO',
                'text-[9vw]': formatted === 'TEMPO ESGOTADO',
            }"
        >
            {{ formatted }}
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useThemeStore } from "./stores/theme";

const label = ref("INICIANDO");
const formatted = ref("00:00");
const highlight = ref(false);
const themeStore = useThemeStore();
const theme = ref(themeStore.theme);

onMounted(() => {
    window.electronAPI.onTimer((data) => {
        label.value = data.label;
        formatted.value = data.formatted;
        highlight.value = data.highlight;
    });

    window.electronAPI.onThemeChange((data) => {
        theme.value = data.theme;
    });

    window.electronAPI.onEsc(() => {
        window.electronAPI.closeProjector();
    });
});
</script>
