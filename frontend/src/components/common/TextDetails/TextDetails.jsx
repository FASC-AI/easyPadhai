import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

import './TextDetailsOne.css';

import useTextToSpeech from '@/pages/issues/TextToSpeechHook';
import { Tooltip } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import { stringToColor } from '@/utils/Workshop.Issues.utils/issues.helper';
import { Button } from '@/components/ui/button';
const AudioPlayer = ({ audioUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);
  const progressRef = useRef(null);

  useEffect(() => {
    return () => {
      if (progressRef.current) {
        clearInterval(progressRef.current);
      }
    };
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        if (progressRef.current) {
          clearInterval(progressRef.current);
        }
      } else {
        audioRef.current.play();
        progressRef.current = setInterval(() => {
          if (audioRef.current) {
            setProgress(
              (audioRef.current.currentTime / audioRef.current.duration) * 100
            );
          }
        }, 100);
      }
      setIsPlaying(!isPlaying);
    }
  };
  return (
    <div className="relative flex items-center w-[200px] h-8 bg-blue-400 rounded-md overflow-hidden">
      <Button
        variant="ghost"
        size="sm"
        onClick={togglePlay}
        className="h-8 w-8 p-0 hover:bg-blue-700 absolute left-0 z-10"
      >
        {isPlaying ? (
          <Pause className="h-3 w-3 text-white" />
        ) : (
          <Play className="h-3 w-3 text-white" />
        )}
      </Button>
      <div className="flex items-center justify-center gap-0.5 w-full h-full px-8">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="w-0.5 bg-white"
            style={{
              height: `${Math.random() * 12 + 4}px`,
              opacity: progress > (i / 20) * 100 ? 1 : 0.3,
            }}
          />
        ))}
      </div>
      <audio
        ref={audioRef}
        src={audioUrl}
        onEnded={() => {
          setIsPlaying(false);
          setProgress(0);
          if (progressRef.current) {
            clearInterval(progressRef.current);
          }
        }}
      />
    </div>
  );
};
const TextDetailsOne = ({ details, title }) => {
  const { speak, isSpeaking } = useTextToSpeech();

  const handleSpeak = (value) => {
    speak(value);
  };

  return (
    <div className="text-details-one">
      <div className="text-details-title text-lg font-semibold text-gray-secondary">
        {title}
      </div>
      {details.map((detail, index) => {
        const names = Array.isArray(detail?.name) ? detail.name : [];

        return (
          <div className="text-detail-box" key={index}>
            <div
              className={`text-detail-box-title text-[13px] leading-5 text-gray-tertiary ${detail?.lastText ? '' : 'text-detail-box-title2'
                }`}
            >
              {detail?.title}
            </div>
            <div
              className={`text-detail-box-name flex justify-between text-[13px] leading-5 text-gray-secondary ${detail?.lastText ? '' : 'text-detail-box-name2'
                }`}
            >
              {!detail?.title.includes('Recording') && !detail?.title.includes('Watcher') && detail?.name}

              {detail?.title.includes('Watcher') && (
                <div className="cursor-pointer">
                  <Tooltip title={names.map((w) => w?.name?.english).join(', ')}>
                    <AvatarGroup max={3} sx={{ overflow: 'visible' }}>
                      {names.slice(0, 3).map((watcher, index) => (
                        <Avatar
                          key={index}
                          sx={{ bgcolor: stringToColor(watcher?.name?.english ?? '-') }}
                          alt={watcher?.name?.english}
                          src="/static/images/avatar/1.jpg" // Update this based on your data if needed
                        />
                      ))}
                      {names.length > 3 && (
                        <Avatar
                          sx={{
                            bgcolor: '#e0e0e0',
                            color: '#000',
                            width: 24,
                            height: 24,
                            fontSize: '14px',
                          }}
                          alt={`+${names.length - 3} more`}
                        >
                          +{names.length - 3}
                        </Avatar>
                      )}
                    </AvatarGroup>
                  </Tooltip>
                </div>
              )}

              {detail?.title.includes('Description') && (
                <div
                  className="cursor-pointer"
                  onClick={() => handleSpeak(detail?.name)}
                  disabled={isSpeaking}
                >
                  {/* {isSpeaking ? spearkerWorking({}) : spearker({})} */}
                </div>
              )}
              {detail?.title?.includes('Recording') &&
              // detail?.name?.includes('https') ? (
                <>
                  {/* <audio controls src={detail?.name} /> */}
                  {detail?.name && <AudioPlayer audioUrl={detail?.name} />}
                </>
              // ) : null
              }
            </div>

            {detail?.lastText && (
              <div className="text-detail-box-last-text text-[13px] leading-5 text-blue-primary-200 hover:underline cursor-pointer">
                {detail?.lastText}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TextDetailsOne;
