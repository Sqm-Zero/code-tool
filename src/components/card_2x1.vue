<template>
  <a :href="url" target="_blank">
    <div :class="bgStyle"
      class="card max-lg:card-compact rounded-xl flex justify-center items-center shadow-xl shadow-accent w-full lg:w-[26rem] md:h-[4.25rem] lg:h-[5rem] mb-8 hover:shadow-[#0275D2]">
      <div class="card-body">
        <div class="flex">
          <!-- <img :src="iconUrl" class="w-8 h-8 mr-2" :alt="title" /> -->
        <!--   <div class="w-8 h-8 mr-2" :class="iconClass"></div> -->
          <h2 class="card-title font-bold text-lg max-lg:text-sm whitespace-nowrap" :class="textStyle">
            {{ title }}
          </h2>
        </div>
      </div>
    </div>
  </a>
</template>

<script setup>
defineProps({
  title: String,
  url: String,
  imgUrl: String,
  iconUrl: String,
  iconClass: String,
  bgStyle: String,
  textStyle: String,
});
</script>