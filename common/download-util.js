/**
 * 下载任务管理类
 *
 * 使用方法:
 * import DownloadUtil from '@/common/download-util';
 * DownloadUtil.createTask('https://m.baidu.com/1.txt', { filename: '_doc/temp/1.txt', stateChange: () => {}})
 */
import {
  DownloadStatus
} from './constants';

// 同时进行的任务数
const CONCURRECNT_DOWNLOAD_TASKS = 3;

// 下载任务队列
let taskQueue = [];
// 正在进行的下载任务数
let runningCount = 0;
// 要暂停的任务数
let pauseQueue = [];
// 要删除的任务数
let removeQueue = [];

function promise(time = 0) {
  let promise = new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve()
    }, time)
  })
  return promise
}

function DownloadUtil() {}


/**
 * 注册statechanged事件
 * @param {Object} task
 * @param {Function} stateChanged
 */
DownloadUtil.prototype.attachEvent = function (task, stateChanged) {
  let start = 0;
  let downloaded = 0;
  let speed = 0;

  task.obj.addEventListener('statechanged', (download, status) => {
    let now = Math.floor((new Date()).getTime() / 1000);
    if (now > start) {
      if (start > 0) {
        speed = (download.downloadedSize - downloaded) / (now - start);
      }

      start = now;
      downloaded = download.downloadedSize;
    }

    const currentStatus = this.getStatus(download);
    // 待下载任务由待下载转为正在下载
    if (currentStatus === DownloadStatus.DOWNLOADING && task.status === DownloadStatus.TODOWNLOAD) {
      task.status = DownloadStatus.DOWNLOADING;
    }

    // 待暂停任务转为已暂停
    if (currentStatus === DownloadStatus.PAUSED && task.status === DownloadStatus.TOPAUSE) {
      task.status = DownloadStatus.PAUSED;
    }

    // 如果删除和暂停的任务已下载完成，则更新为已删除和已暂停的状态
    if (currentStatus === DownloadStatus.DOWNLOADED) {
      task.status = DownloadStatus.DOWNLOADED;
    }

    const result = {
      id: download.id,
      filename: download.filename,
      downloadedSize: download.downloadedSize,
      status: task.status,
      totalSize: download.totalSize,
      progress: Math.round(download.downloadedSize * 100 / download.totalSize),
      speed,
    }

    stateChanged(result, status);

    if (this.isDownloaded(task) && status == 200) {
      this.removeTask(task.id, false);
    }
  });
}

/**
 *
 * @param {String} url 下载地址
 * @param {Object} options 选项
 * {
 *   filename: 下载文件保存路径
 *   stateChanged: 进度更新的回调函数
 * }
 */
DownloadUtil.prototype.createTask = function (url, options) {
  // 检查下载地址是否已存在，如果存在直接添加监听并返回
  // fix issue #3403 by ltan
  let task = this.hasTask(url);
  if (task !== false) {
    if (options.stateChanged) {
      this.attachEvent(task, options.stateChanged);
    }
    return task;
  }

  task = plus.downloader.createDownload(url, Object.assign({
    retry: 3, // 重试次数
    retryInterval: 5, // 重试间隔
    timeout: 10,
  }, {
    filename: options.filename
  }));

  const newTask = {
    id: task.id,
    status: DownloadStatus.TODOWNLOAD,
    obj: task,
  };

  if (options.stateChanged) {
    this.attachEvent(newTask, options.stateChanged);
  }

  // 超过下载任务数，仅加入队列
  if (this.isOverLoading()) {
    taskQueue.push(newTask);
    return newTask;
  }

  task.start();
  newTask.status = DownloadStatus.DOWNLOADING;
  runningCount++;
  taskQueue.unshift(newTask);
  return newTask;
}

/**
 * 寻找下一个任务并继续
 */
DownloadUtil.prototype.continueNext = function () {
  if (taskQueue.length <= 0) {
    return;
  }

  let task = taskQueue.find(task => this.isNotStarted(task) && !pauseQueue.includes(task.id) && !removeQueue.includes(task.id));
  if (task === undefined) {
    return;
  }

  task.obj.start();
  // fix issue #3578 by ltan
  task.status = DownloadStatus.DOWNLOADING;
  runningCount++;
}

/**
 * 根据任务id查找任务
 * @param {String} taskId
 */
DownloadUtil.prototype.getTask = function (taskId) {
  return taskQueue.find(task => task.id === taskId);
}

/**
 * 暂停指定的任务
 * @param {String|Object} task 下载任务id或任务对象
 * @param {Number} index 任务在队列中的索引
 * @returns {Object} 操作成功返回任务对象，否则返回null
 */
DownloadUtil.prototype.pauseTask = function (task, index) {
  if (!this.isDownloading(task) && !this.isNotStarted(task)) {
    return null;
  }

  const self = this;

  // 暂停任务
  function pause(task, index) {

    if (self.isDownloading(task)) {
      task.obj.pause();
      task.status = DownloadStatus.TOPAUSE;
      runningCount--;
      self.continueNext();
    } else {
      task.status = DownloadStatus.PAUSED;
    }

    // 暂停的任务移到队尾
    taskQueue.splice(index, 1);
    taskQueue.push(task);
    self.saveQueue();
    return task;
  }

  if (typeof task === 'object') {
    return pause(task, index);
  }

  let oTask = task;
  taskQueue.every((task, index) => {
    if (task.id === oTask) {
      oTask = pause(task, index);
      return false;
    }
    return true;
  });

  return oTask;
}

/**
 * 批量暂停下载任务
 * @param {Array} taskIds
 */
DownloadUtil.prototype.pauseTasks = function (taskIds) {
  let oTasks = [];
  pauseQueue = taskIds;
  taskIds.forEach(taskId => {
    taskQueue.every((task, index) => {
      if (task.id === taskId && (this.isDownloading(task) || this.isNotStarted(task))) {
        let oTask = this.pauseTask(task, index);
        oTasks.push(oTask);
        return false;
      }

      return true;
    });
  });
  pauseQueue = [];
  return oTasks;
}

/**
 * 继续暂停的任务
 * @param {String|Object} task 下载任务id或任务对象
 * @param {Number} index 任务在队列中的索引
 * @returns {Object} 操作成功返回任务对象，否则返回null
 */
DownloadUtil.prototype.resumeTask = function (task, index) {
  if (!this.isPaused(task)) {
    return null;
  }

  const self = this;

  // 继续任务
  function resume(task, index) {
    task.status = DownloadStatus.TODOWNLOAD;

    if (self.isOverLoading()) {
      return task;
    }

    task.obj.resume();
    task.status = DownloadStatus.DOWNLOADING;
    runningCount++

    // 继续的任务移到队首
    taskQueue.splice(index, 1);
    taskQueue.unshift(task);
    self.saveQueue();
    return task;
  }

  if (typeof task === 'object') {
    return resume(task, index);
  }

  let oTask = task;
  taskQueue.every((task, index) => {
    if (task.id === oTask) {
      oTask = resume(task, index);
      return false;
    }
    return true;
  });

  return oTask;
}

/**
 * 批量继续暂停的任务
 * @param {Array} taskIds
 */
DownloadUtil.prototype.resumeTasks = function (taskIds) {
  let oTasks = [];
  taskIds.forEach(taskId => {
    taskQueue.every((task, index) => {
      if (task.id === taskId) {
        let oTask = this.resumeTask(task, index);
        oTasks.push(oTask);
        return false;
      }

      return true;
    });
  });
  return oTasks;
}

/**
 * 暂停或继续任务
 * @param {String} taskId 任务id
 * @returns {Object} 操作成功返回任务对象，否则返回null
 */
DownloadUtil.prototype.toggleTask = function (taskId) {
  let oTask = null;
  taskQueue.every((task, index) => {
    if (task.id === taskId) {
      oTask = task;
      if (this.isDownloading(task) || this.isNotStarted(task)) {
        this.pauseTask(task, index);
        return false;
      }

      if (this.isPaused(task)) {
        this.resumeTask(task, index);
      }

      return false;
    }
    return true;
  });

  return oTask;
}

/**
 * 检查下载任务是否存在
 * @param {String} url
 * @returns {Object} 成功返回任务对象，否则返回undefined
 */
DownloadUtil.prototype.hasTask = function (url) {
  const positon = url.indexOf('?');
  let task = taskQueue.find(task => task.obj.url.slice(0, positon) == url.slice(0, positon))
  if (task === undefined) {
    return false;
  }
  return task;
}

/**
 * 批量移除指定的下载任务
 * @param {Array} taskIds
 */
DownloadUtil.prototype.removeTasks = function (taskIds) {
  let oTasks = [];
  removeQueue = taskIds;
  taskIds.forEach(taskId => {
    taskQueue.every((task) => {
      if (task.id === taskId) {
        let oTask = this.removeTask(taskId);
        oTasks.push(oTask);
        return false;
      }

      return true;
    });
  });
  removeQueue = [];
  return oTasks;
}

/**
 * 移除指定的下载任务
 * @param {String} taskId 任务id
 * @param {Boolean} isManual 是否手动触发
 * @returns {Object} 下载任务对象
 */
DownloadUtil.prototype.removeTask = function (taskId, isManual = true) {
  let task = taskQueue.find((task, index) => {
    if (task.id === taskId) {
      if (this.isDownloading(task) || !isManual) {
        runningCount--;
        this.continueNext();
      }
      if (!this.isDownloaded(task)) {
        task.status = DownloadStatus.TOABORT;
        task.obj.abort();
      } else {
        if (isManual) {
          task.status = DownloadStatus.ABORTED;
        }

        taskQueue.splice(index, 1)
      }

      this.saveQueue();

      return true;
    }

    return false;
  });

  // 返回要删除的对象，通知调用方任务已经删除
  if (task === undefined) {
    task = {
      id: taskId,
      status: DownloadStatus.ABORTED,
    };
  }

  return task;
}


/**
 * 暂停所有正在下载的任务
 */
DownloadUtil.prototype.pauseAll = function () {
  plus.downloader.enumerate((tasks) => {
    tasks.forEach((task) => {
      task.pause();
    });
    runningCount = 0;
  });
}

/**
 * 移除所有下载任务
 */
DownloadUtil.prototype.removeAll = function () {
  this.pauseAll(); // 首先暂停所有任务
  plus.downloader.clear();
  runningCount = 0;
}

// 初始化下载队列
DownloadUtil.prototype.initQueue = function () {
  // 从缓存中读取下载列表
  taskQueue = uni.getStorageSync('downloads');
  if (!taskQueue) {
    taskQueue = [];
  }

  plus.downloader.enumerate((downloads) => {
    // 检查任务队列中不存在的任务
    downloads.forEach(download => {
      let tempTask = taskQueue.find(task => task.id === download.id);
      if (tempTask) {
        tempTask.obj = download;

        // 暂停所有的下载任务
        if (tempTask.status === DownloadStatus.DOWNLOADING) {
          tempTask.status = DownloadStatus.TODOWNLOAD;
          download.start();
          runningCount++;
        }

        return;
      }

      tempTask = {
        id: download.id,
        status: this.getStatus(download),
        obj: download,
      }

      // 暂停所有的下载任务
      if (tempTask.status === DownloadStatus.DOWNLOADING) {
        tempTask.status = DownloadStatus.TODOWNLOAD;
        download.start();
        runningCount++;
      }

      taskQueue.push(tempTask);
    });

    // 检查下载队列中已经存在的任务
    taskQueue.forEach(async (task, index) => {
      const download = downloads.find(download => download.id === task.id);
      if (download === undefined) {
        task.status = DownloadStatus.ABORTED;
        return;
      }

      const tempTask = {
        id: download.id,
        status: task.status,
        obj: download,
      };

      const currentStatus = this.getStatus(download);
      if (currentStatus === DownloadStatus.DOWNLOADING) {
        if (tempTask.status === DownloadStatus.TOABORT) {
          // 如果保存的任务状态是待删除状态，但是任务还在下载，则终止任务
          download.start();
          await promise(1000);
          download.abort();
        } else if (tempTask.status === DownloadStatus.DOWNLOADING) {
          // 如果任务正在进行，则继续继续
          tempTask.status = DownloadStatus.TODOWNLOAD;
          download.start();
          runningCount++;
        } else if (tempTask.status === DownloadStatus.TOPAUSE) {
          // 如果任务待暂停，则继续暂停
          download.start();
          await promise(1000);
          download.pause();
        } else {
          // nothing to do
        }
      }

      // 如果下载任务已暂停则更新状态
      if (currentStatus === DownloadStatus.PAUSED) {
        tempTask.status = currentStatus;
      }

      // 如果删除和暂停的任务已下载完成，则更新为已删除和已暂停的状态
      if (currentStatus === DownloadStatus.DOWNLOADED) {
        if (tempTask.status === DownloadStatus.TOABORT) {
          tempTask.status = DownloadStatus.ABORTED;
        }

        if (tempTask.status === DownloadStatus.TOPAUSE) {
          tempTask.status = DownloadStatus.PAUSED;
        }
      }

      // 更新任务
      taskQueue.splice(index, 1, tempTask);
    })

    this.saveQueue();
  });
}

// 保存下载队列
DownloadUtil.prototype.saveQueue = function () {
  uni.setStorage({
    key: 'downloads',
    data: taskQueue,
    fail: (e) => {
      console.log('保存下载队列失败：', e);
    },
  });
}

/**
 * 监听指定的下载任务
 * @param {Array} downloads
 * [
 *   {
 *     id: 下载id,
 *     stateChanged: 回调函数,
 *   }
 * ]
 *
 * @returns {Promise}
 */
DownloadUtil.prototype.watchTasks = async function (downloads) {
  const watchedTasks = [];
  for (let i = taskQueue.length - 1; i >= 0; i--) {
    const task = taskQueue[i];
    const download = downloads.find(download => download.id === task.id);
    if (download) {
      watchedTasks.push(task);

      if (task.status === DownloadStatus.TOPAUSE && this.getStatus(task.obj) === DownloadStatus.PAUSED) {
        task.status = DownloadStatus.PAUSED;
      }

      if (task.status === DownloadStatus.TOABORT) {
        try {
          let fileExists = await this.hasFile(task.obj.filename);

          if (fileExists === false) {
            task.status = DownloadStatus.ABORTED;
            taskQueue.splice(i, 1);
          }
        } catch (e) {
          console.log(e);
        }
        continue;
      }

      if (task.status === DownloadStatus.ABORTED) {
        taskQueue.splice(i, 1);
        continue;
      }

      this.attachEvent(task, download.stateChanged);
    }
  }

  this.saveQueue();
  return watchedTasks;
}

// 获取任务状态
DownloadUtil.prototype.getStatus = function (task) {
  let status = DownloadStatus.TODOWNLOAD;
  switch (task.state) {
    case 0:
    case 1:
    case 2:
    case 3:
      status = DownloadStatus.DOWNLOADING;
      break;
    case 4:
      status = DownloadStatus.DOWNLOADED;
      break;
    case 5:
      status = DownloadStatus.PAUSED;
      break;
    default:
      status = DownloadStatus.TODOWNLOAD;
      break;
  }

  return status;
}

/**
 * 任务是否还未开始
 *
 * @param {String|Object} task 任务id或任务对象
 * @returns {Boolean}
 */
DownloadUtil.prototype.isNotStarted = function (task) {
  let oTask = task;
  if (typeof task === 'string') {
    oTask = this.getTask(task);
    if (oTask === undefined) {
      throw new Error('Task it not found.');
    }
  }

  return oTask.status == DownloadStatus.TODOWNLOAD;
}

/**
 * 任务是否正在下载
 *
 * @param {String|Object} task 任务id或任务对象
 * @returns {Boolean}
 */
DownloadUtil.prototype.isDownloading = function (task) {
  let oTask = task;
  if (typeof task === 'string') {
    oTask = this.getTask(task);
    if (oTask === undefined) {
      throw new Error('Task it not found.');
    }
  }

  return oTask.status == DownloadStatus.DOWNLOADING;
}

/**
 * 任务是否下载完成
 *
 * @param {String|Object} task 任务id或任务对象
 * @returns {Boolean}
 */
DownloadUtil.prototype.isDownloaded = function (task) {
  let oTask = task;
  if (typeof task === 'string') {
    oTask = this.getTask(task);
    if (oTask === undefined) {
      throw new Error('Task it not found.');
    }
  }

  return oTask.status == DownloadStatus.DOWNLOADED;
}

/**
 * 任务是否暂停
 *
 * @param {String|Object} task 任务id或任务对象
 * @returns {Boolean}
 */
DownloadUtil.prototype.isPaused = function (task) {
  let oTask = task;
  if (typeof task === 'string') {
    oTask = this.getTask(task);
    if (oTask === undefined) {
      throw new Error('Task it not found.');
    }
  }

  return oTask.status == DownloadStatus.PAUSED;
}

/**
 * 任务是否已终止
 * @param {String} taskId
 */
DownloadUtil.prototype.isAborted = async function (taskId) {
  let aborted = false;
  for (let i = 0; i < taskQueue.length; i++) {
    const task = taskQueue[i];

    if (task.id === taskId) {
      try {
        let isExists = await this.hasFile(task.obj.filename);
        if (isExists === false) {
          aborted = true;
          taskQueue.splice(i, 1);
        }
      } catch (error) {
        console.log(error);
      }

      break;
    }
  }

  return aborted;
}

/**
 * 检查下载任务是否超载
 */
DownloadUtil.prototype.isOverLoading = function () {
  return runningCount >= CONCURRECNT_DOWNLOAD_TASKS;
}

/**
 * 检查文件是否存在
 * @param {String} filename
 */
DownloadUtil.prototype.hasFile = function (filename) {
  return new Promise((resolve) => {
    plus.io.resolveLocalFileSystemURL(filename, () => {
      resolve(true);
    }, () => {
      resolve(false);
    })
  })
}

export default new DownloadUtil();
