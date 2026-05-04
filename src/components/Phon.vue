<script setup lang="ts">
import { computed, shallowRef } from "vue";

type Theme = "light" | "dark";

const theme = shallowRef<Theme>("light");

const buttonText = computed(() =>
    theme.value === "dark" ? "Light mode" : "Dark mode",
);

function toggleTheme() {
    theme.value = theme.value === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = theme.value;
}
</script>

<template>
    <button type="button" @click="toggleTheme">{{ buttonText }}</button>

    <div>Hello</div>
</template>
