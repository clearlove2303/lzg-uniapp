const dateFormat = require('dateformat');

export default {
  /**
   * 格式化时间戳为字符串
   * @param  {Number} timestamp unix时间戳
   * @param  {String} format    格式化字符串，仅支持关键字母：YmdHis
   * @return {String}
   *
  * 格式文档： https://www.npmjs.com/package/dateformat
   */
  formatTime: (timestamp, format) => {
    if (typeof(timestamp) !== 'number') {
      return '';
    }

    const date = new Date();
    return dateFormat(new Date(timestamp * 1000 + date.getTimezoneOffset() * 60 * 1000 + 8 * 60 * 60 * 1000), format);
  },

  formatFileSize: (file) => {
    let fileSize = null;
    if (typeof(file) == 'object') {
      if (!file) {
        return '0B';
      }
      fileSize = file.file_size;
    } else {
      if (typeof(file) != 'number') {
        return file;
      }
      fileSize = file;
    }

    fileSize = parseInt(fileSize, 10);
    const units = ['B', 'KB', 'MB', 'GB'];
    let index = 0;

    while (fileSize > 1024) {
      fileSize = Math.round(fileSize / 1024 * 100) / 100.00;
      index += 1;
    }

    return `${fileSize}${units[index]}`;
  },

  /**
   * 省略字符串，中间加...
   * @param  {String} source 源字符串
   * @param  {Number} length 保留的长度
   * @return {String}
   */
  omitString: (source, length) => {
    if (source.length <= length) {
      return source;
    } else {
      return source.substr(0, length) + '...';
    }
  },

  /**
   * 个位数补0...
   * @param  {Number} num
   * @return {Number}
   */
  addPreZero: (num) => {
    if (num < 10){
      return '0' + num;
    } else {
      return num;
    }
  },

  handleImgUrl: (url, width, height) => {
    return `${url}?x-oss-process=image/resize,w_${width},h_${height}`
  }
};
