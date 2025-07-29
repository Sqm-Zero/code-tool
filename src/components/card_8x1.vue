<template>
    <div
      class="card bg-white max-lg:card-compact rounded-xl flex justify-center items-center shadow-xl shadow-accent bg-primary w-full lg:w-[54rem] lg:h-[5rem] mb-8"
    >
      <div>
        <h2 class="font-black text-xl">{{ title }}</h2>
      </div>
    </div>
  </template>
  
  <script setup>
  defineProps({
    title: String,
  });
  </script>