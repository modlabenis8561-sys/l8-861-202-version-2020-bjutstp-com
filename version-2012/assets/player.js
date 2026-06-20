import { H as Hls } from './hls-dru42stk.js';

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.player-shell').forEach((shell) => {
        setupPlayer(shell);
    });
});

function setupPlayer(shell) {
    const video = shell.querySelector('video');
    const source = shell.dataset.src;
    const playButtons = shell.querySelectorAll('.js-play-toggle');
    const muteButton = shell.querySelector('.js-mute-toggle');
    const fullscreenButton = shell.querySelector('.js-fullscreen-toggle');
    const errorNode = shell.querySelector('.player-error');

    if (!video || !source) {
        showError(shell, errorNode, '播放源不可用');
        return;
    }

    const markReady = () => {
        shell.classList.add('is-ready');
    };

    const markPlaying = () => {
        shell.classList.toggle('is-playing', !video.paused);
    };

    if (Hls.isSupported()) {
        const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, markReady);
        hls.on(Hls.Events.ERROR, (_, data) => {
            if (data && data.fatal) {
                showError(shell, errorNode, '视频加载失败，请稍后重试');
            }
        });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', markReady, { once: true });
        video.addEventListener('error', () => {
            showError(shell, errorNode, '视频加载失败，请稍后重试');
        });
    } else {
        showError(shell, errorNode, '您的浏览器不支持 HLS 视频播放');
    }

    playButtons.forEach((button) => {
        button.addEventListener('click', () => {
            togglePlayback(video, shell, errorNode);
        });
    });

    video.addEventListener('click', () => {
        togglePlayback(video, shell, errorNode);
    });
    video.addEventListener('play', markPlaying);
    video.addEventListener('pause', markPlaying);
    video.addEventListener('loadedmetadata', markReady);
    video.addEventListener('canplay', markReady);

    if (muteButton) {
        muteButton.addEventListener('click', () => {
            video.muted = !video.muted;
            muteButton.textContent = video.muted ? '取消静音' : '静音';
        });
    }

    if (fullscreenButton) {
        fullscreenButton.addEventListener('click', () => {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                shell.requestFullscreen();
            }
        });
    }
}

function togglePlayback(video, shell, errorNode) {
    if (video.paused) {
        video.play().then(() => {
            shell.classList.add('is-playing');
        }).catch(() => {
            showError(shell, errorNode, '浏览器阻止了自动播放，请再次点击播放按钮');
        });
    } else {
        video.pause();
        shell.classList.remove('is-playing');
    }
}

function showError(shell, errorNode, message) {
    shell.classList.add('is-ready');
    if (errorNode) {
        errorNode.textContent = message;
        errorNode.hidden = false;
    }
}
