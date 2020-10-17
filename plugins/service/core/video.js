class Video {
  constructor(http) {
    this.http = http;
    return this;
  }

  /**
   * 获取视频内容
   * @param {String} videoId 
   */
  find(videoId) {
    return this.http.get({
      name: 'video.view',
      params: {
        id: videoId
      }
    })
  }
}

module.exports = function(http) {
  return new Video(http)
}