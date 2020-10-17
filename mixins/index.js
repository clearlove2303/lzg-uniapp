export default {
  methods: {
    getUrl(fileName) {
      return getApp().globalData.CDN + fileName;
    },

    goLogin() {
      if (this.$store.hasLogin) {
        return;
      }

      this.$loc.open('login/login');
    },

    handleAscii(options) {
      let indexes = [];
      for (var i = 0; i < options.length; i++){
        indexes.push(String.fromCharCode(i+65));
      }
      return indexes;
    },

    /**
     * 将题目文本变更为nodes
     * @param {String} text
     * @returns Array
     */
    convertTestText(text) {
      if (typeof (text) !== 'string') {
        return '';
      }

      // fix issue #3065
      const pattern = /\[https?\:\/\/[^(\[|\])]+\.(jpg|gif|png|jpeg)\]/g;
      const matches = text.match(pattern);

      const nodes = [];

      if (matches === null) {
        nodes.push({type: 'text', text});

        return nodes;
      }

      let tempText = text;
      for (let i = 0; i < matches.length; i++) {
        const match = matches[i];

        const index = tempText.indexOf(match);
        if (index > 0) {
          nodes.push({ type: 'text', text: tempText.substr(0, index)});
        }

        nodes.push({
          type: 'node',
          name: 'img',
          attrs: {
            src: match.substr(1, match.length - 2),
            style: 'max-width: 100%; height: auto;',
          },
        });

        tempText = tempText.substr(index + match.length);
      }

      if (tempText !== '') {
        nodes.push({type: 'text', text: tempText});
      }

      return nodes;
    },

    setTitle(title) {
      uni.setNavigationBarTitle({
        title,
      });
    },

    showLoading() {
      uni.showLoading({
        title: '加载中...',
        mask: true,
      });
    },

    hideLoading() {
      uni.hideLoading();
    },

    /**
     * 
     * @param {Object} cacheOptions // cache对应接口key值
     * {
     *   key: 缓存数据的键
     *   params: 键里面的参数
     *   afterLoad: 缓存加载后的回调
     *   beforeCache: 缓存前的回调  只处理要缓存的数据
     * }
     * @param {function} query // 对应接口
     * @param {String} dataName // 要缓存的data变量
     */
    loadCacheData(cacheOptions, query, dataName) {
      const cache = Object.assign({
        params: [],
        afterLoad: null,
        beforeCache: null,
      }, cacheOptions);

      const cacheValue = this.$cache.get(cache.key, ...cache.params);
      if (cacheValue) {
        this[dataName] = cacheValue;

        if (cache.afterLoad) {
          cache.afterLoad(cacheValue);
        }
      }
      return new Promise((resolve, reject) => {
        let response;
        query.then(res => {
          this.$cache.remove(cache.key, ...cache.params)
          if (cache.beforeCache) {
            response = cache.beforeCache(res.data);
          } else {
            // 如果没有items则要有beforeCache
            response = res.data.items;
          }
          this[dataName] = response;
          this.$cache.set(cache.key, response, ...cache.params);
          resolve(res);
        }).catch(err => {
          reject(err);
        });
      })
    }
  },
};
