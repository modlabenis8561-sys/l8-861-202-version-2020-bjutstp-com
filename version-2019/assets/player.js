(function () {
  window.initMoviePlayer = function (streamUrl) {
    var video = document.getElementById("movie-video");
    var trigger = document.getElementById("player-trigger");
    var layer = document.getElementById("player-layer");
    var message = document.getElementById("player-message");
    var hlsInstance = null;
    var ready = false;

    function showMessage(text) {
      if (message) {
        message.textContent = text;
        message.hidden = false;
      }
    }

    function prepare() {
      if (!video || ready) {
        return;
      }
      ready = true;
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            showMessage("当前网络暂时无法播放，请稍后重试。");
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else {
        showMessage("当前浏览器暂时无法播放该影片。");
      }
    }

    function playMovie() {
      prepare();
      if (!video) {
        return;
      }
      if (layer) {
        layer.classList.add("is-hidden");
      }
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          if (layer) {
            layer.classList.remove("is-hidden");
          }
        });
      }
    }

    if (!video) {
      return;
    }

    prepare();

    if (trigger) {
      trigger.addEventListener("click", playMovie);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        playMovie();
      }
    });

    video.addEventListener("play", function () {
      if (layer) {
        layer.classList.add("is-hidden");
      }
    });

    video.addEventListener("pause", function () {
      if (video.currentTime === 0 && layer) {
        layer.classList.remove("is-hidden");
      }
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
