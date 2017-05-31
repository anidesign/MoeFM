/**
 * @author: Est <codeest.dev@gmail.com>
 * @date: 2017/5/19
 * @description:
 */

let Sound = require('react-native-sound');

//actions
const ADD_SONG = 'ADD_SONG';        //增加歌曲
const ADD_SONGS = 'ADD_SONGS';      //批量增加歌曲
const PUSH_SONG = 'PUSH_SONG';      //新增歌曲并播放
const DELETE_SONG = 'DELETE_SONG';  //删除歌曲
const CLEAR_SONGS = 'CLEAR_SONGS';  //清空歌曲
const FINISH_SONG = 'FINISH_SONG';  //当前歌曲结束，自动播放下一首
const CUT_SONG = 'CUT_SONG';        //切到指定歌曲
const NEXT_SONG = 'NEXT_SONG';      //上一首歌
const LAST_SONG = 'LAST_SONG';      //下一首歌
const PAUSE = 'PAUSE';              //暂停、恢复
const SWITCH_MODE = 'SWITCH_MODE';  //切换播放模式
const PROGRESS = 'PROGRESS';            //当前进度
const SEEK_PROGRESS = 'SEEK_PROGRESS';  //指定进度

let storeInstance;

const playerMiddleware = store => next => action => {
    storeInstance = store;
    const thisState = store.getState();
    const result = next(action);
    const newState = store.getState();
    const actionType = String(action.type);

    switch (actionType) {
        case CUT_SONG:
            init(newState.playList[newState.currentIndex].url);
            break;
        case PUSH_SONG:
            init(action.song.url);
            break;
        case NEXT_SONG:
            init(newState.playList[newState.currentIndex].url);
            break;
        case LAST_SONG:
            init(newState.playList[newState.currentIndex].url);
            break;
        case PAUSE:
            play(newState.isPlaying);
            break;
        case SWITCH_MODE:
            //记录播放模式
            break;
        case SEEK_PROGRESS:
            seek(newState.progressTime);
            break;
    }
    return result;
};

export default playerMiddleware;

let singletonSong = null;
let progressCountDown;

const init = (url) => {
    if (singletonSong !== null) {
        release();
    }
    singletonSong = new Sound(url, '', (e) => {
        if (e) {
            console.log('failed to load the sound', e);
            return;
        }
        setTimeout(play(false), 200);
        startProgress();
    });
};

const play = (isPlaying) => {
    if (isPlaying) {
        singletonSong.pause();
        stopProgress();
    } else {
        singletonSong.play(release);
        startProgress();
    }
};

const release = () => {
    //自然播放结束
    singletonSong.release();
    stopProgress();
};

const seek = (time) => {
    singletonSong.setCurrentTime(time);
};

const startProgress = () => {
    if (singletonSong !== null) {
        progressCountDown = setInterval(() => {
            singletonSong.getCurrentTime((seconds) => storeInstance.dispatch({type: PROGRESS, time: seconds}));
        },1000);
    }
};

const stopProgress = () => {
    if (singletonSong !== null) {
        clearInterval(progressCountDown);
    }
};