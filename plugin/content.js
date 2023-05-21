// 创建MutationObserver
var observer = new MutationObserver(function(mutations) {
    // 查找video元素
    var video = document.getElementById('mrcLivePreviewPlayer');
  
    // 如果找到了video元素
    if (video) {

        console.log('监听成功');
      // 为video元素添加点击事件监听器
      video.addEventListener('click', function(e) {
  
        // 计算点击位置相对于视频元素的坐标
        var rect = video.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
  
        // 将点击位置保存到localStorage
        localStorage.setItem('clickedPosition', JSON.stringify({x: x, y: y}));
  
        // 打印点击位置
        console.log('Clicked position:', {x: x, y: y});
      }, true);
  
      // video元素已找到并处理，停止观察
      observer.disconnect();
    }
  });
  
  // 开始观察整个文档
  observer.observe(document, {childList: true, subtree: true});
  console.log('插件已加载');
  