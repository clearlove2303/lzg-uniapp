/**
 * 课程下载器
 *
 * @copyright 版权所有(c)上海来学网教育科技有限公司
 * @author ltan
 */
import cache from '@/plugins/cache/core';
import {
  DownloadStatus
} from "./constants";
import DownloadUtil from './download-util';

// 缓存键
const cacheKeys = {
  downloadingCourses: 'downloading-courses',
  downloadedCourses: 'downloaded-courses',
  courses: {
    downloading: 'courses-{0}-downloading',
    downloaded: 'courses-{0}-downloaded',
    downloadingSections: 'courses-{0}-downloading-sections',
    downloadedSections: 'courses-{0}-downloaded-sections',
  }
};

// 缓存数据值
const cacheData = {};

/**
 * 添加新的小节下载
 * @param {Number} courseId 要下载的小节的课程id
 * @param {Number} sectionId 要下载的小节的id
 */
function handleDownloading(courseId, sectionId, result) {
  const downloadingCourseCacheKey = cache.getCacheKey(cacheKeys.courses.downloading, courseId);
  const downloadingSectionsCacheKey = cache.getCacheKey(
    cacheKeys.courses.downloadingSections,
    courseId
  );

  if (!cacheData[downloadingSectionsCacheKey].hasOwnProperty(sectionId)) {
    return;
  }

  const section = cacheData[downloadingSectionsCacheKey][sectionId];

  if (cacheData[downloadingSectionsCacheKey].downloadedSize <= 0 && result.downloadedSize > 0) {
    cacheData[downloadingSectionsCacheKey][sectionId] = Object.assign(result, {
      title: section.title,
      cover: section.cover,
    });
    cacheData[downloadingCourseCacheKey].downloadedSize += result.downloadedSize;
    cacheData[downloadingCourseCacheKey].totalSize += result.totalSize;
    cacheData[downloadingCourseCacheKey].speed += result.speed;
    cache.set(downloadingCourseCacheKey, cacheData[downloadingCourseCacheKey]);
    return;
  }

  cacheData[downloadingCourseCacheKey].downloadedSize -= section.downloadedSize;
  cacheData[downloadingCourseCacheKey].downloadedSize += result.downloadedSize;
  cacheData[downloadingCourseCacheKey].speed -= section.speed;
  cacheData[downloadingCourseCacheKey].speed += result.speed;
  cacheData[downloadingCourseCacheKey].totalSize -= section.totalSize;
  cacheData[downloadingCourseCacheKey].totalSize += result.totalSize;
  cacheData[downloadingCourseCacheKey].progress = Math.round(cacheData[downloadingCourseCacheKey].downloadedSize * 100 / cacheData[downloadingCourseCacheKey].totalSize);
  cacheData[downloadingSectionsCacheKey][sectionId] = Object.assign(result, {
    title: section.title,
    cover: section.cover,
  });
}

/**
 * 处理下载完成的小节
 * @param {Number} courseId 下载完成的小节的课程id
 * @param {Number} sectionId 下载完成的小节的id
 */
function handleDownloaded(courseId, sectionId) {
  const downloadedSection = removeDownloadingSection(courseId, sectionId);

  // 插入下载完成数据
  const downloadedSectionsCacheKey = cache.getCacheKey(
    cacheKeys.courses.downloadedSections,
    courseId
  );
  if (cacheData[downloadedSectionsCacheKey] === undefined) {
    cacheData[downloadedSectionsCacheKey] = cache.get(downloadedSectionsCacheKey);
  }
  if (cacheData[downloadedSectionsCacheKey] === '') {
    cacheData[downloadedSectionsCacheKey] = {};
  }

  cacheData[downloadedSectionsCacheKey][sectionId] = downloadedSection;
  cache.set(downloadedSectionsCacheKey, cacheData[downloadedSectionsCacheKey]);

  const downloadedCourseCacheKey = cache.getCacheKey(
    cacheKeys.courses.downloaded,
    courseId
  );
  if (cacheData[downloadedCourseCacheKey] === undefined) {
    cacheData[downloadedCourseCacheKey] = cache.get(downloadedCourseCacheKey);
  }
  if (cacheData[downloadedCourseCacheKey] == '') {
    cacheData[downloadedCourseCacheKey] = {
      status: DownloadStatus.DOWNLOADED,
      totalSize: 0,
    }
  }
  cacheData[downloadedCourseCacheKey].totalSize += downloadedSection.totalSize;
  cache.set(downloadedCourseCacheKey, cacheData[downloadedCourseCacheKey]);

}

/**
 * 移除正在下载的小节
 * @param {Number} courseId 要移除的小节的课程id
 * @param {Number} sectionId 要移除的小节的id
 */
function removeDownloadingSection(courseId, sectionId) {
  // 从正在下载小节移除数据
  const downloadingSectionsCacheKey = cache.getCacheKey(
    cacheKeys.courses.downloadingSections,
    courseId
  );
  const removedSection = Object.assign({}, cacheData[downloadingSectionsCacheKey][sectionId]);
  console.log('removedSection------>', removedSection);
  delete cacheData[downloadingSectionsCacheKey][sectionId];

  uni.$emit('section:aborted', {
    sectionId,
    result: removedSection,
  });

  if (Object.keys(cacheData[downloadingSectionsCacheKey]).length < 1) {
    cache.remove(downloadingSectionsCacheKey);
  } else {
    cache.set(downloadingSectionsCacheKey, cacheData[downloadingSectionsCacheKey]);
  }

  if (removedSection.downloadedSize <= 0) {
    return removedSection;
  }

  // 更新正在下载的课程数据
  const downloadingCourseCacheKey = cache.getCacheKey(cacheKeys.courses.downloading, courseId);
  cacheData[downloadingCourseCacheKey].totalSize -= removedSection.downloadedSize;
  // 检查课程所有的小节是否下载完成
  if (cacheData[downloadingCourseCacheKey].totalSize <= 0) {
    // 删除课程正在下载数据
    delete cacheData[downloadingCourseCacheKey];
    cache.remove(downloadingCourseCacheKey);

    // 将课程从正在下载的课程列表中移除
    cacheData[cacheKeys.downloadingCourses] = cacheData[cacheKeys.downloadingCourses].filter(item => item !== courseId);
    cache.set(cacheKeys.downloadingCourses, cacheData[cacheKeys.downloadingCourses]);

    // 将课程加入下载完成的课程列表
    cacheData[cacheKeys.downloadedCourses].push(courseId);
    cache.set(cacheKeys.downloadedCourses, cacheData[cacheKeys.downloadedCourses]);
  } else {
    cache.set(downloadingCourseCacheKey, cacheData[downloadingCourseCacheKey]);
  }

  return removedSection;
}

/**
 * 获取stateChanged事件响应函数
 * @param {Number} courseId
 * @param {Number} sectionId
 */
function stateChangedHandler(courseId, sectionId) {
  return (task, status) => {
    const result = {
      taskId: task.id,
      filename: task.filename,
      status: task.status,
      speed: task.speed,
      progress: task.progress,
      downloadedSize: task.downloadedSize,
      totalSize: task.totalSize,
    };

    if (task.status === DownloadStatus.DOWNLOADED && status === 200) {
      handleDownloaded(courseId, sectionId);

      uni.$emit('section:downloaded', {
        sectionId,
        result,
      });
    }

    if (task.status === DownloadStatus.PAUSED) {
      uni.$emit('section:paused', {
        sectionId,
        result,
      });
    }

    handleDownloading(courseId, sectionId, result);

    // 触发下载状态更新事件
    uni.$emit('section:downloading', {
      sectionId,
      result,
    });

    const downloadingCourseCacheKey = cache.getCacheKey(cacheKeys.courses.downloading, courseId);
    uni.$emit('course:downloading', {
      courseId,
      result: cacheData[downloadingCourseCacheKey],
    });
  };
}

// 构造函数
function CourseDownloader() {}

/**
 * 下载指定的课程小节
 * @param {Number} courseId 要下载的小节的课程id
 * @param {Number} sectionId 要下载的小节的id
 * @param {String} url 下载地址
 */
CourseDownloader.prototype.download = function (courseId, section) {
  // 检查正在下载的课程列表当中当前课程是否存在
  if (cacheData[cacheKeys.downloadingCourses].findIndex(item => item === courseId) === -1) {
    cacheData[cacheKeys.downloadingCourses].push(courseId);
    cache.set(cacheKeys.downloadingCourses, cacheData[cacheKeys.downloadingCourses]);
  }

  // 初始化要下载的课程数据
  const downloadingCourseCacheKey = cache.getCacheKey(cacheKeys.courses.downloading, courseId);
  if (!cacheData.hasOwnProperty(downloadingCourseCacheKey)) {
    cacheData[downloadingCourseCacheKey] = {
      status: DownloadStatus.DOWNLOADING,
      progress: 0,
      downloadedSize: 0,
      totalSize: 0,
      speed: 0,
    };
  }

  const initData = {
    taskId: null,
    status: DownloadStatus.TODOWNLOAD,
    filename: '',
    speed: 0,
    progress: 0,
    downloadedSize: 0,
    totalSize: 0,
    title: section.title,
    cover: section.cover,
  };

  // 初始化正在下载的课程小节数据
  const downloadingSectionsCacheKey = cache.getCacheKey(
    cacheKeys.courses.downloadingSections,
    courseId
  );
  if (!cacheData[downloadingSectionsCacheKey]) {
    cacheData[downloadingSectionsCacheKey] = {};
  }

  const options = {
    filename: `_downloads/video${section.id}.mp4`,
    stateChanged: stateChangedHandler(courseId, section.id),
  }

  const task = DownloadUtil.createTask(section.play_info[0].playurl, options);

  initData.taskId = task.id;

  cacheData[downloadingSectionsCacheKey][section.id] = initData;
  cache.set(downloadingSectionsCacheKey, cacheData[downloadingSectionsCacheKey]);

  return initData;
}

/**
 * 获取正在下载的课程列表
 */
CourseDownloader.prototype.getDownloadingCourses = function () {
  if (cacheData[cacheKeys.downloadingCourses].length <= 0) {
    return {};
  }

  const downloadingCourses = {};
  cacheData[cacheKeys.downloadingCourses].forEach(courseId => {
    const downloadingCourseCacheKey = cache.getCacheKey(cacheKeys.courses.downloading, courseId);
    downloadingCourses[courseId] = cacheData[downloadingCourseCacheKey];
  });

  return downloadingCourses;
}

/**
 * 获取下载完成的课程列表
 */
CourseDownloader.prototype.getDownloadedCourses = function () {
  if (cacheData[cacheKeys.downloadedCourses].length <= 0) {
    return {};
  }

  const downloadedCourses = {};
  cacheData[cacheKeys.downloadedCourses].forEach(courseId => {
    const downloadedCourseCacheKey = cache.getCacheKey(cacheKeys.courses.downloaded, courseId);

    if (!cacheData.hasOwnProperty(downloadedCourseCacheKey)) {
      cacheData[downloadedCourseCacheKey] = cache.get(downloadedCourseCacheKey);
    }

    downloadedCourses[courseId] = cacheData[downloadedCourseCacheKey];
  });

  return downloadedCourses;
}

/**
 * 获取课程正在下载的小节
 * @param {Number} courseId
 */
CourseDownloader.prototype.getDownloadingSections = function (courseId) {
  const downloadingSectionsCacheKey = cache.getCacheKey(cacheKeys.courses.downloadingSections, courseId);

  if (!cacheData[downloadingSectionsCacheKey]) {
    return {};
  }

  return cacheData[downloadingSectionsCacheKey];
}

/**
 * 获取课程下载完成的小节
 * @param {Number} courseId
 */
CourseDownloader.prototype.getDownloadedSections = function (courseId) {
  const downloadedSectionsCacheKey = cache.getCacheKey(cacheKeys.courses.downloadedSections, courseId);
  if (!cacheData.hasOwnProperty(downloadedSectionsCacheKey)) {
    cacheData[downloadedSectionsCacheKey] = cache.get(downloadedSectionsCacheKey);
    console.log(cache.get(downloadedSectionsCacheKey))
  }

  if (!cacheData[downloadedSectionsCacheKey]) {
    return {};
  }
  return cacheData[downloadedSectionsCacheKey];
}

/**
 * 检查小节是否删除
 * @param {Number} courseId
 * @param {Number} sectionId
 */
CourseDownloader.prototype.isAborted = async function (courseId, sectionId) {
  const downloadingSectionsCacheKey = cache.getCacheKey(cacheKeys.courses.downloadingSections, courseId);

  if (!cacheData.hasOwnProperty(downloadingSectionsCacheKey) ||
    Object.keys(cacheData[downloadingSectionsCacheKey]).length <= 0) {
    return true;
  }

  const downloadingSections = cacheData[downloadingSectionsCacheKey];

  if (!downloadingSections.hasOwnProperty(sectionId)) {
    return true;
  }

  try {
    const aborted = await DownloadUtil.isAborted(downloadedSections[sectionId].taskId);
    if (aborted) {
      removeDownloadingSection(courseId, sectionId);
    }

    return aborted;
  } catch (e) {
    console.log(e);
  } finally {
    return false;
  }
}

/**
 * 暂停/继续小节下载
 * @param {Number} courseId
 * @param {Number} sectionId
 * @returns {Object} 更新后的小节对象
 */
CourseDownloader.prototype.toggle = function (courseId, sectionId) {
  const downloadingSectionsCacheKey = cache.getCacheKey(cacheKeys.courses.downloadingSections, courseId);
  const currentStatus = cacheData[downloadingSectionsCacheKey][sectionId].status;
  let sectionObject = null;
  if (currentStatus === DownloadStatus.DOWNLOADING || currentStatus === DownloadStatus.TODOWNLOAD) {
    sectionObject = this.pause(courseId, sectionId);
  }

  if (currentStatus === DownloadStatus.PAUSED) {
    sectionObject = this.resume(courseId, sectionId);
  }
  return sectionObject;
}

/**
 * 暂停小节下载
 * @param {Number} courseId
 * @param {Number} sectionId
 * @returns {Object} 更新后的小节对象
 */
CourseDownloader.prototype.pause = function (courseId, sectionId) {
  const downloadingSectionsCacheKey = cache.getCacheKey(cacheKeys.courses.downloadingSections, courseId);

  const task = DownloadUtil.pauseTask(cacheData[downloadingSectionsCacheKey][sectionId].taskId);
  if (task === null) {
    return null;
  }

  cacheData[downloadingSectionsCacheKey][sectionId].status = task.status;
  return cacheData[downloadingSectionsCacheKey][sectionId];
}

/**
 * 继续暂停的小节
 * @param {Number} courseId
 * @param {Number} sectionId
 * @returns {Object} 更新后的小节对象
 */
CourseDownloader.prototype.resume = function (courseId, sectionId) {
  const downloadingSectionsCacheKey = cache.getCacheKey(cacheKeys.courses.downloadingSections, courseId);
  
  const task = DownloadUtil.resumeTask(cacheData[downloadingSectionsCacheKey][sectionId].taskId);
  if (task === null) {
    return null;
  }

  cacheData[downloadingSectionsCacheKey][sectionId].status = task.status;
  return cacheData[downloadingSectionsCacheKey][sectionId];
}

/**
 * 删除下载任务
 * @param {Number} courseId
 * @param {Number} sectionId
 * @returns {Object} 任务对象
 */
CourseDownloader.prototype.remove = function (courseId, sectionId) {
  const downloadingSectionsCacheKey = cache.getCacheKey(cacheKeys.courses.downloadingSections, courseId);

  const task = DownloadUtil.removeTask(cacheData[downloadingSectionsCacheKey][sectionId].taskId);
  cacheData[downloadingSectionsCacheKey][sectionId].status = task.status;

  if (task.status === DownloadStatus.ABORTED) {
    console.log('0')
    removeDownloadingSection(courseId, sectionId);
  }

  return task;
}

/**
 * 删除下载完成任务
 * @param {Number} courseId
 * @param {Number} sectionId
 * @returns {Object} 任务对象
*/
CourseDownloader.prototype.removeDownloaded = function (courseId, sectionId) {
  const downloadedCourseCacheKey = cache.getCacheKey(cacheKeys.courses.downloaded, courseId);
  const downloadedSectionsCacheKey = cache.getCacheKey(cacheKeys.courses.downloadedSections, courseId);
  if (courseId && !sectionId) {
    let index = cacheData[cacheKeys.downloadedCourses].findIndex(item => item == courseId);
    if (index != -1) {
      cacheData[cacheKeys.downloadedCourses].splice(index, 1);
    }
    delete cacheData[downloadedCourseCacheKey];
    delete cacheData[downloadedSectionsCacheKey];
    
    cache.set(cacheKeys.downloadedCourses, cacheData[cacheKeys.downloadedCourses]);
    cache.remove(downloadedCourseCacheKey);
    cache.remove(downloadedSectionsCacheKey);
  }

  if (courseId && sectionId) {
    for (let i in cacheData[downloadedSectionsCacheKey]) {
      if (sectionId == i) {
        delete cacheData[downloadedSectionsCacheKey][i];
        cache.set(downloadedSectionsCacheKey, cacheData[downloadedSectionsCacheKey]);
      }

      if (Object.keys(cacheData[downloadedSectionsCacheKey]).length <= 0) {
        cache.remove(downloadedCourseCacheKey);
        cache.remove(downloadedSectionsCacheKey);
      }
    }
  }
}

/**
 * 保存数据到缓存
 * @param {Number} courseId 要保存的课程id
 */
CourseDownloader.prototype.saveCache = function (courseId) {
  if (courseId) {
    const downloadingCourseCacheKey = cache.getCacheKey(cacheKeys.courses.downloading, courseId);
    if (cacheData[downloadingCourseCacheKey]) {
      cache.set(downloadingCourseCacheKey, cacheData[downloadingCourseCacheKey]);
    }    
    const downloadedCourseCacheKey = cache.getCacheKey(cacheKeys.courses.downloaded, courseId);
    if (cacheData[downloadedCourseCacheKey]) {
      cache.set(downloadedCourseCacheKey, cacheData[downloadedCourseCacheKey]);
    }   
    const downloadingSectionsCacheKey = cache.getCacheKey(cacheKeys.courses.downloadingSections, courseId);
    if (cacheData[downloadingSectionsCacheKey]) {
      cache.set(downloadingSectionsCacheKey, cacheData[downloadingSectionsCacheKey]);
    }
    const downloadedSectionsCacheKey = cache.getCacheKey(cacheKeys.courses.downloadedSections, courseId);
    if (cacheData[downloadedSectionsCacheKey]) {
      cache.set(downloadedSectionsCacheKey, cacheData[downloadedSectionsCacheKey]);
    }  
    return;
  }

  Object.keys(cacheData).forEach(key => {
    cache.set(key, cacheData[key]);
  });
}

/**
 * 开启下载器
 */
CourseDownloader.prototype.start = function () {
  cacheData[cacheKeys.downloadingCourses] = cache.get(cacheKeys.downloadingCourses);
  cacheData[cacheKeys.downloadedCourses] = cache.get(cacheKeys.downloadedCourses);

  if (!cacheData[cacheKeys.downloadingCourses]) {
    cacheData[cacheKeys.downloadingCourses] = [];
  }

  if (!cacheData[cacheKeys.downloadedCourses]) {
    cacheData[cacheKeys.downloadedCourses] = [];
  }

  if (cacheData[cacheKeys.downloadingCourses].length <= 0) {
    return;
  }

  cacheData[cacheKeys.downloadingCourses].forEach((courseId, cIndex) => {
    const downloadingCourseCacheKey = cache.getCacheKey(cacheKeys.courses.downloading, courseId);
    cacheData[downloadingCourseCacheKey] = cache.get(downloadingCourseCacheKey);
    if (!cacheData[downloadingCourseCacheKey]) {
      cacheData[downloadingCourseCacheKey] = {};
    }

    const downloadingSectionsCacheKey = cache.getCacheKey(cacheKeys.courses.downloadingSections, courseId);
    const downloadingSections = cache.get(downloadingSectionsCacheKey);
    if (!downloadingSections) {
      delete cacheData[downloadingCourseCacheKey];
      cacheData[cacheKeys.downloadingCourses].splice(cIndex, 1);
      return;
    }

    // 组装监听数据
    const downloads = [];
    for (let sectionId in downloadingSections) {
      downloads.push({
        id: downloadingSections[sectionId].taskId,
        stateChanged: stateChangedHandler(courseId, sectionId),
      });
    }

    DownloadUtil.watchTasks(downloads).then(watchedTasks => {
      // 移除已删除的任务
      for (let sectionId in downloadingSections) {
        const task = watchedTasks.find(task => task.id === downloadingSections[sectionId].taskId);
        if (!task) {
          delete downloadingSections[sectionId];
          continue;
        }

        downloadingSections[sectionId].status = task.status;
      }

      cacheData[downloadingSectionsCacheKey] = downloadingSections;
    }).catch(e => {
      console.log(e);
    });
  });
}

export default new CourseDownloader();
