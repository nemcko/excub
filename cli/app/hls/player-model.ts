import { PlayerSource, PlayerState, PlayerControls } from './index';

interface IPlayerModel {
  id?: string;
  type: string;
  controls?: PlayerControls;
  autoplay?: boolean;
  width?: number;
  height?: number;
  errorMessage?: string;
  source?: any[];
}

export class PlayerModel {
  id: string;
  type: string;
  controls: PlayerControls;
  autoplay: boolean;
  width: number;
  height: number;
  errorMessage: string;
  state: PlayerState;
  source: PlayerSource;

  constructor(obj?: IPlayerModel) {
    this.id = obj && obj.id || '';
    this.type = obj && obj.type || null;
    this.controls = obj && new PlayerControls(obj.controls) || new PlayerControls();
    this.autoplay = obj && obj.autoplay || false;
    this.width = obj && obj.width || 240;
    this.height = obj && obj.height || 135;
    this.errorMessage = obj && obj.errorMessage || `To view this video please enable JavaScript,
    and consider upgrading to a web browser that
    <a href='http://videojs.com/html5-video-support/' target='_blank'>supports HTML5 video</a>`;
    this.state = null;
    this.source = obj && new PlayerSource(obj.source) || new PlayerSource();
  }
}
