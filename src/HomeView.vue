<template>
    <div
        class="min-h-screen flex flex-col items-center justify-center p-6"
        :class="{
            'bg-black text-white': themeStore.theme === 'dark',
            'bg-white text-black': themeStore.theme === 'light',
        }"
    >
        <!-- Relógio -->
        <div v-if="timer.showClock" class="text-[5vh] font-mono mb-2 opacity-70">
            {{ timer.currentTime }}
        </div>

        <div class="text-[12vh] font-bold uppercase">{{ timer.label }}</div>

        <div
            class="text-[20vh] font-extrabold mb-6 transition-all"
            :class="{
                'text-red-600 animate-pulse':
                    timer.remaining <= 0 || timer.isHighlight || timer.isOvertime,
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
        <div class="mt-6 flex gap-3 flex-wrap justify-center">
            <button
                @click="openProjector"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
                Abrir Projeção
            </button>
            <button
                v-if="projectorOpen"
                @click="closeProjector"
                class="px-4 py-2 bg-red-600 text-white rounded-lg"
            >
                Fechar Projeção
            </button>
        </div>

        <!-- Modo de Projeção -->
        <div class="mt-4 flex gap-2 justify-center">
            <button
                @click="timer.setProjectorMode('timer')"
                class="px-4 py-2 rounded-lg transition-colors"
                :class="{
                    'bg-blue-600 text-white': timer.projectorMode === 'timer',
                    'bg-gray-300 text-black': timer.projectorMode !== 'timer',
                }"
            >
                ⏱️ Cronômetro
            </button>
            <button
                @click="timer.setProjectorMode('clock')"
                class="px-4 py-2 rounded-lg transition-colors"
                :class="{
                    'bg-blue-600 text-white': timer.projectorMode === 'clock',
                    'bg-gray-300 text-black': timer.projectorMode !== 'clock',
                }"
            >
                🕐 Relógio
            </button>
        </div>

        <!-- Configuração -->
        <div class="mt-8 flex gap-3 text-center flex-wrap justify-center">
            <!-- Select de predefinições + Input personalizado -->
            <div class="flex gap-2 items-center">
                <select
                    v-model="selectedPreset"
                    @change="onPresetChange"
                    class="border p-2 rounded text-black"
                >
                    <option value="custom">✏️ Personalizado</option>
                    <option
                        v-for="preset in timer.presets"
                        :key="preset.id"
                        :value="preset.id"
                    >
                        {{ preset.name }} ({{ preset.minutes }}min)
                    </option>
                </select>
                <input
                    v-if="selectedPreset === 'custom'"
                    v-model="customLabel"
                    @change="timer.setLabel(customLabel)"
                    class="border p-2 rounded text-black"
                    placeholder="Nome do contador"
                />
            </div>

            <input
                type="number"
                min="1"
                v-model.number="inputMinutes"
                @change="timer.setTime(inputMinutes)"
                class="border p-2 rounded text-black w-32"
                placeholder="Minutos (Ex: 20)"
            />

            <input
                type="number"
                min="1"
                @change="timer.setHighlight($event.target.value)"
                class="border p-2 rounded text-black w-40"
                placeholder="Min. p/ vermelho"
            />
        </div>

        <!-- Salvar nova predefinição -->
        <div class="mt-4 flex gap-2 justify-center flex-wrap items-center">
            <span class="text-sm opacity-70">Salvar atual:</span>
            <input
                v-model="newPresetName"
                class="border p-2 rounded text-black w-36"
                placeholder="Nome"
            />
            <button
                @click="saveCurrentAsPreset"
                class="px-3 py-2 bg-purple-600 text-white rounded-lg text-sm"
                :disabled="!newPresetName"
            >
                💾 Salvar
            </button>
            <button
                v-if="selectedPreset !== 'custom'"
                @click="deleteSelectedPreset"
                class="px-3 py-2 bg-red-600 text-white rounded-lg text-sm"
            >
                🗑️ Excluir
            </button>
        </div>

        <div class="mt-4 space-y-2 text-center flex gap-3 flex-wrap justify-center">
            <select
                v-model="themeStore.theme"
                @change="themeStore.setTheme(themeStore.theme)"
                class="border p-2 rounded text-black"
            >
                <option value="light">Claro</option>
                <option value="dark">Escuro</option>
            </select>

            <button
                @click="timer.toggleClock"
                class="px-4 py-2 rounded-lg transition-colors"
                :class="{
                    'bg-green-600 text-white': timer.showClock,
                    'bg-gray-400 text-black': !timer.showClock,
                }"
            >
                {{ timer.showClock ? '🕐 Relógio ON' : '🕐 Relógio OFF' }}
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { useChurchTimer } from "./stores/churchTimer";
import { useThemeStore } from "./stores/theme";

const timer = useChurchTimer();
const themeStore = useThemeStore();
themeStore.applyTheme();

// Predefinições
const selectedPreset = ref("custom");
const customLabel = ref(timer.label);
const inputMinutes = ref(Math.floor(timer.totalSeconds / 60));
const newPresetName = ref("");

// Estado do projetor
const projectorOpen = ref(false);

const onPresetChange = () => {
    if (selectedPreset.value === "custom") {
        return;
    }
    const preset = timer.presets.find((p) => p.id === selectedPreset.value);
    if (preset) {
        timer.loadPreset(preset);
        inputMinutes.value = preset.minutes;
    }
};

const saveCurrentAsPreset = () => {
    if (newPresetName.value && inputMinutes.value > 0) {
        timer.savePreset(newPresetName.value, inputMinutes.value);
        newPresetName.value = "";
    }
};

const deleteSelectedPreset = () => {
    if (selectedPreset.value !== "custom") {
        timer.deletePreset(selectedPreset.value);
        selectedPreset.value = "custom";
    }
};

// Iniciar relógio se estava ativo
onMounted(() => {
    if (timer.showClock) {
        timer.startClock();
    }
});

watch(
    () => [timer.remaining, timer.overtime, timer.projectorMode],
    () => {
        window.electronAPI.sendTimer({
            label: timer.label,
            formatted: timer.formatted,
            highlight: timer.isHighlight,
            isOvertime: timer.isOvertime,
            currentTime: timer.currentTime,
            showClock: timer.showClock,
            projectorMode: timer.projectorMode,
        });
    }
);

watch(
    () => timer.currentTime,
    () => {
        if (timer.showClock || timer.projectorMode === 'clock') {
            window.electronAPI.sendTimer({
                label: timer.label,
                formatted: timer.formatted,
                highlight: timer.isHighlight,
                isOvertime: timer.isOvertime,
                currentTime: timer.currentTime,
                showClock: timer.showClock,
                projectorMode: timer.projectorMode,
            });
        }
    }
);

watch(
    () => themeStore.theme,
    () => {
		console.log("atualizou")
        window.electronAPI.sendTheme({
            theme: themeStore.theme
        });
    }
);

const isElectron = !!window.electronAPI;

const openProjector = () => {
    if (isElectron) {
        window.electronAPI.openProjector();
        projectorOpen.value = true;
    } else {
        console.log("Modo Dev: Tela de projeção não disponível.");
    }
};

const closeProjector = () => {
    if (isElectron) {
        window.electronAPI.closeProjector();
        projectorOpen.value = false;
    }
};

onMounted(() => {
    window.electronAPI.onEsc(() => {
        window.electronAPI.closeProjector();
        projectorOpen.value = false;
    });

    window.electronAPI.onProjectorClosed(() => {
        projectorOpen.value = false;
    });
});
</script>
