<template>
  <a :href="url" target="_blank">
    <div
      class="card max-lg:card-compact rounded-2xl shadow-xl w-full max-sm:aspect-[2/1] md:aspect-[2/1] lg:w-[26rem] lg:h-[12rem] mb-8"
      :class="[bgStyle, textStyle]">
      <div class="p-10 rounded-2xl hover:glass">
        <p class="font-bold text-2xl whitespace-nowrap">{{ title }}</p>
        <p>{{ desc }}</p>
        <div class="card-actions justify-end">
          <button :class="[btnStyle, btnTextStyle]" class="btn btn-sm rounded-xl border-0 p-2">
            {{ btnText }}
          </button>
        </div>
      </div>
    </div>
  </a>
</template>

<script setup>
defineProps({
  title: String,
  desc: String,
  url: String,
  btnText: String,
  bgStyle: String,
  textStyle: String,
  btnStyle: String,
  btnTextStyle: String,
});
</script>
<style scoped>
.card-actions {
  position: relative ;
  bottom: -30px;
  left: 80%;
}
</style>