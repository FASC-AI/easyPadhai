// import 'package:flutter_sound/flutter_sound.dart';

// class AudioPlayer {
//   final FlutterSoundPlayer _player = FlutterSoundPlayer();

//   Future<void> play(String filePath) async {
//     if (!_player.isPlaying) {
//       await _player.startPlayer(
//         fromURI: filePath,
//         codec: Codec.mp3,
//       );
//     }
//   }

//   Future<void> pause() async {
//     if (_player.isPlaying) {
//       await _player.pausePlayer();
//     }
//   }

//   Future<void> resume() async {
//     if (!_player.isPaused) {
//       await _player.resumePlayer();
//     }
//   }

//   Future<void> stop() async {
//     if (_player.isPlaying) {
//       await _player.stopPlayer();
//     }
//   }
// }
