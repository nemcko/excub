/// <reference path="../../typings/hlsjs.d.ts" />
import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { PlayerService, PlayerModel, PlayerState, PlayerSource } from './index';

@Component({

  selector: 'hls-player',
  template: `
<video #video controls width="360" height="202" [ngSwitch]="fileext">
    <source *ngSwitchCase="mp4" src="{{playerService.playerModel.source.url}}" type="video/mp4">
    <source *ngSwitchCase="webm" src="{{playerService.playerModel.source.url}}" type="video/webm">
    <source *ngSwitchCase="mov" src="{{playerService.playerModel.source.url}}" type="video/quicktime">
    <source *ngSwitchCase="ogv" src="{{playerService.playerModel.source.url}}" type="video/ogg">
    <source *ngSwitchCase="mpg" src="{{playerService.playerModel.source.url}}" type='video/mp4; codecs="avc1.42E01E, mp4a.40.2"'>
    <source *ngSwitchCase="mpeg" src="{{playerService.playerModel.source.url}}" type='video/mp4; codecs="mp4v.20.8, mp4a.40.2"'>
    <source *ngSwitchDefault src="{{playerService.playerModel.source.url}}">
</video>
`
})
export class HlsPlayerComponent implements OnInit {
  protected fileext: string;
  @Input() processed: boolean = false;
  @Input() config: PlayerModel;
  @Input() width: number;
  @Input() height: number;
  @ViewChild('video') video: HTMLVideoElement;

  private hls: Hls;

  constructor(public playerService: PlayerService) { }

  ngOnInit() {
    this.video = this.video['nativeElement'];
    this.hls = new Hls();
    this.hls.attachMedia(this.video);

    this.playerService.playerModel = this.config;

    if (this.playerService.playerModel.source.url && this.processed && this.playerService.playerModel.source.url.lastIndexOf(".") >= 0) {
        this.playerService.playerModel.source.url = this.playerService.playerModel.source.url.substr(0, this.playerService.playerModel.source.url.lastIndexOf("."))
            + '-processed' + this.playerService.playerModel.source.url.substr(this.playerService.playerModel.source.url.lastIndexOf("."));
    }

    this.fileext = this.playerService.playerModel.source.url.substr(this.playerService.playerModel.source.url.lastIndexOf('.') + 1);

    this.initSubscribers();
    this.setVideoListeners();
    this.setHlsPlayerListeners();
  }

  loadSrc(src: PlayerSource): void {
    if (src) {
      this.hls.loadSource(src.url);
    }
  }

  play(): void {
    this.video.play();
  }

  pause(): void {
    this.video.pause();
  }

  private initSubscribers(): void {
    this.playerService.currentSrc
      .subscribe(this.loadSrc.bind(this));
  }

  private setHlsPlayerListeners(): void {
    this.hls.on(Hls.Events.MEDIA_ATTACHED, () => {
      console.log('$$$ Hls::MEDIA_ATTACHED');
      this.playerService.setPlayerState(PlayerState.INITIALIZED);
      if (this.config.source && this.config.source.url !== '') {
        this.loadSrc(this.config.source);
      }
      });
      this.hls.on(Hls.Events.MANIFEST_PARSED, (event: any, data:any) => {
      console.log(`$$$ hls::MANIFEST_PARSED::QualityLevels: ${data.levels.length}`);
      this.playerService.setPlayerState(PlayerState.PAUSED);
      this.play();
    });
    this.hls.on(Hls.Events.ERROR, this.onHlsError.bind(this));
  }

  private setVideoListeners(): void {
    this.video.addEventListener('playing', () => {
      this.playerService.setPlayerState(PlayerState.PLAYING);
    });
    this.video.addEventListener('pause', () => {
      this.playerService.setPlayerState(PlayerState.PAUSED);
    });
    this.video.addEventListener('seeked', () => {
      console.log('$$$ videoElement::seeked');
    });
    this.video.addEventListener('seeking', () => {
      console.log('$$$ videoElement::seeking');
    });
    this.video.addEventListener('durationchange', () => {
      this.playerService.setTotalTime(this.video.duration);
    });
    this.video.addEventListener('timeupdate', () => {
      this.playerService.setCurrentTime(this.video.currentTime);
    });
  }

  private onHlsError(event: any, data: any): void {
    const errorType: string = data.type;
    const errorDetails: string = data.details;
    const errorFatal: boolean = data.fatal;

    console.log(`$$$ hls::ERROR::Type: ${errorType} Details: ${errorDetails} Fatal: ${errorFatal}`);

    if (errorFatal) {
      switch (errorType) {
        case Hls.ErrorTypes.NETWORK_ERROR:
          console.log('$$$ hls::fatal network error encountered, try to recover');
          this.hls.startLoad();
          break;
        case Hls.ErrorTypes.MEDIA_ERROR:
          console.log('$$$ hls::fatal media error encountered, try to recover');
          this.hls.recoverMediaError();
          break;
        default:
          console.log('$$$ hls::non-recoverable error encountered, destroying');
          this.hls.destroy();
          break;
      }
    }
  }
}
