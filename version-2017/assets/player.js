(function () {
    window.setupPlayer = function (sourceUrl) {
        var video = document.getElementById("movie-player");
        var overlay = document.querySelector("[data-play-overlay]");
        var message = document.querySelector("[data-player-message]");
        var hls = null;
        var attached = false;

        if (!video || !sourceUrl) {
            return;
        }

        function setMessage(text) {
            if (!message) {
                return;
            }

            message.textContent = text || "";
            message.classList.toggle("is-visible", Boolean(text));
        }

        function attachSource() {
            if (attached) {
                return;
            }

            attached = true;

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(sourceUrl);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal || !hls) {
                        return;
                    }

                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        setMessage("播放暂时不可用");
                    }
                });
            } else {
                video.src = sourceUrl;
            }
        }

        function hideOverlay() {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        }

        function playVideo() {
            attachSource();
            hideOverlay();
            setMessage("");

            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {
                    setMessage("请再次点击播放");
                });
            }
        }

        if (overlay) {
            overlay.addEventListener("click", playVideo);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                playVideo();
            }
        });

        video.addEventListener("play", hideOverlay);
        video.addEventListener("error", function () {
            setMessage("播放暂时不可用");
        });

        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    };
})();
