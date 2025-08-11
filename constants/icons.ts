/**
 * 숨숨 프로젝트 커스텀 SVG 아이콘 매핑 (역할별 분리)
 * - 공통 아이콘: assets/icons
 * - 내비게이션 탭 아이콘: assets/icons/navigation/bottomNavigation
 */
import { SvgProps } from 'react-native-svg';
import React from 'react';
import PlayBarPlayIcon from '../assets/icons/play/playBar/circled/play.svg';
import PlayBarPauseIcon from '../assets/icons/play/playBar/circled/pause.svg';
import PlayBarForwardIcon from '../assets/icons/play/playBar/naked/play_pass_right.svg';
import PlayBarBackwardIcon from '../assets/icons/play/playBar/naked/play_pass_left.svg';
import PlayBarSpeedIcon from '../assets/icons/play/playBar/naked/speed.svg';
import PlayBarRepeatIcon from '../assets/icons/play/playBar/naked/repeat.svg';

export const playIcons = {
  circleed: {
    play: PlayBarPlayIcon,
    pause: PlayBarPauseIcon,
  },
  naked: {
    forward: PlayBarForwardIcon,
    backward: PlayBarBackwardIcon,
    speed: PlayBarSpeedIcon,
    repeat: PlayBarRepeatIcon,
  },
} as const;

export type PlayIcon = React.FC<SvgProps>;