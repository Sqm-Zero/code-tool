<template>
  <div
    class="card max-lg:card-compact rounded-2xl shadow-xl shadow-accent bg-white hover:shadow-gray-500 bg-primary w-full lg:w-[54rem] min-h-[26rem] mb-8">
    <div class="card-body flex flex-col items-center">
      <div class="pt-8"></div>

      <div class="flex justify-around items-center p-2 bg-gray-100 rounded-xl max-sm:py-2 w-11/12">
        <div class="max-sm:px-2 text-xl font-bold sm:tab-lg" v-for="(articleList, index) in articlesList"
          :key="articleList.title"
          :class="tabIndex == index ? 'bg-white text-black p-2 rounded-xl ' : 'text-gray-400 hover:text-black'"
          @click="changeIndex(index)">
          {{ articleList.title }}
        </div>
      </div>

      <div class="pt-1"></div>

      <!-- <div
          v-for="article in articlesList[tabIndex].articles"
          :key="article"
          tabindex="0"
          class="collapse collapse-arrow rounded-xl bg-base-200"
        >
          <div class="collapse-title md:text-xl sm:flex sm:justify-between">
            {{ article.title }}
            <div class="inline-block float-right text-gray-500">2020.06.11</div>
          </div>
          <div class="collapse-content">
            <p></p>
          </div>
        </div> -->

      <a :key="article" v-for="article in articlesList[tabIndex].articles"
        class="card card-compact w-11/12 rounded-xl bg-base-200 mt-3" :href="article.url" target="_blank">
        <div class="card-body p-4 bg-gray-100">
          <div class="text-base font-bold md:text-xl sm:flex sm:justify-between">
            {{ article.title }}
            <div class="inline-block float-right text-gray-500">
              {{ article.time }}
            </div>
          </div>
        </div>
      </a>

      <div class="pt-1"></div>

      <div class="card-actions justify-end p-3 font-bold text-xl">
        <a class="btn btn-md btn-wide rounded-xl capitalize border-0 max-w-full" :href="articlesList[tabIndex].url"
          target="_blank">
          查看更多
        </a>
      </div>
    </div>
  </div>
</template>

<script>
const articlesList = [
  {
    title: "最新",
    url: "https://idealclover.top/articles.html",
    articles: /* [
        {
          title: "2021-2023年终总结：跃入人海，潮起潮落",
          url: "https://idealclover.top/archives/637",
          time: "2024.02.23",
        },
        {
          title: "用AI为Typecho博客文章生成摘要吧！",
          url: "https://idealclover.top/archives/636",
          time: "2023.12.03",
        },
        {
          title: "Caritas APP 2.0 版本发布",
          url: "https://idealclover.top/archives/635",
          time: "2022.08.21",
        },
        {
          title: "友链屋 - 建个网站订阅友链们的更新～",
          url: "https://idealclover.top/archives/634",
          time: "2022.05.22",
        },
        {
          title: "为博客添加 COVID-19 疫情地图",
          url: "https://idealclover.top/archives/632",
          time: "2022.05.04",
        },
      ] */
      [
        {
          "title": "基于MD5分块哈希的前端图片重复检测方案",
          "time": '2025.03.06',
          "url": "https://blog.csdn.net/iku_n/article/details/146078012"
        },
        {
          "title": "Scala 编程实验报告",
          "time": '2025.03.06',
          "url": "https://blog.csdn.net/iku_n/article/details/146072929"
        },
        {
          "title": "MyBatis-Plus驼峰映射配置：告别手动映射的繁琐",
          "time": '2025.02.28',
          "url": "https://blog.csdn.net/iku_n/article/details/145930761"
        },
        {
          "title": "解决Spring Boot中LocalDateTime返回前端数据为数组结构的问题",
          "time": '2025.02.26',
          "url": "https://blog.csdn.net/iku_n/article/details/145886662"
        },
        {
          "title": "宝可梦图鉴App：专为宝可梦粉丝打造的便捷查询工具",
          "time": "2025.02.24",
          "url": "https://blog.csdn.net/iku_n/article/details/145828108"
        }
      ]

    ,
  },
  {
    title: "技术",
    url: "https://idealclover.top/category/blog",
    articles: [
      {
        "title": "基于MD5分块哈希的前端图片重复检测方案",
        "time": '2025.03.06',
        "url": "https://blog.csdn.net/iku_n/article/details/146078012"
      },
      {
        "title": "Scala 编程实验报告",
        "time": '2025.03.06',
        "url": "https://blog.csdn.net/iku_n/article/details/146072929"
      },
      {
        "title": "MyBatis-Plus驼峰映射配置：告别手动映射的繁琐",
        "time": '2025.02.28',
        "url": "https://blog.csdn.net/iku_n/article/details/145930761"
      },
      {
        "title": "解决Spring Boot中LocalDateTime返回前端数据为数组结构的问题",
        "time": '2025.02.26',
        "url": "https://blog.csdn.net/iku_n/article/details/145886662"
      },
      {
        "title": "宝可梦图鉴App：专为宝可梦粉丝打造的便捷查询工具",
        "time": "2025.02.24",
        "url": "https://blog.csdn.net/iku_n/article/details/145828108"
      }
    ],
  },
  {
    title: "生活",
    url: "https://idealclover.top/category/life",
    articles: [
      {
        title: "2021-2023年终总结：跃入人海，潮起潮落",
        url: "https://idealclover.top/archives/637",
        time: "2024.02.23",
      },
      {
        title: "再见了，大小周",
        url: "https://idealclover.top/archives/629",
        time: "2021.11.07",
      },
      {
        title: "2020 年年终总结：致即将 22 岁的自己",
        url: "https://idealclover.top/archives/627",
        time: "2021.05.01",
      },
      {
        title: "Hello&bye, days",
        url: "https://idealclover.top/archives/626",
        time: "2020.10.01",
      },
      {
        title: "南哪课表的钱捐哪了",
        url: "https://idealclover.top/archives/609",
        time: "2020.02.29",
      },
    ],
  },
  {
    title: "随想",
    url: "https://idealclover.top/category/thinking",
    articles: [
      {
        title: "2021-2023年终总结：跃入人海，潮起潮落",
        url: "https://idealclover.top/archives/637",
        time: "2024.02.23",
      },
      {
        title: "2020 年年终总结：致即将 22 岁的自己",
        url: "https://idealclover.top/archives/627",
        time: "2021.05.01",
      },
      {
        title: "idealclover@科技 X",
        url: "https://idealclover.top/archives/624",
        time: "2020.05.26",
      },
      {
        title: "关于《后浪》，随便写点什么",
        url: "https://idealclover.top/archives/621",
        time: "2020.05.04",
      },
      {
        title: "我看好 Fluent Design，但不看好微软",
        url: "https://idealclover.top/archives/615",
        time: "2020.04.12",
      },
    ],
  },

  {
    title: "测评",
    url: "https://idealclover.top/category/testing",
    articles: [
      {
        title: "Pico Neo 3 开箱体验 - XR 或许已经走出了最低谷",
        url: "https://idealclover.top/archives/630",
        time: "2022.02.04",
      },
      {
        title: "iPhone SE 2020 测评：我用爽了，但也许你并不需要",
        url: "https://idealclover.top/archives/620",
        time: "2020.04.30",
      },
      {
        title: "9102 年都快过了，这 iPhone SE 还香吗？",
        url: "https://idealclover.top/archives/595",
        time: "2019.12.26",
      },
      {
        title: "开箱一份字节跳动校招生大礼包！",
        url: "https://idealclover.top/archives/594",
        time: "2019.12.19",
      },
      {
        title: "开箱一只初音趴趴！",
        url: "https://idealclover.top/archives/593",
        time: "2019.12.16",
      },
    ],
  },
];

export default {
  data() {
    return {
      articlesList: articlesList,
      tabIndex: 0,
    };
  },
  methods: {
    changeIndex(index) {
      this.tabIndex = index;
      // console.log(this.tabIndex)
    },
  },
};
</script>