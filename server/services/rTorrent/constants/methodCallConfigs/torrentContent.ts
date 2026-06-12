import {base64PathComponentsTransformer, numberTransformer, stringTransformer} from '../../util/rTorrentMethodCallUtil';

const torrentContentMethodCallConfigs = {
  path: {
    methodCall: 'f.path=',
    preferredMethodCalls: [
      {
        methodCall: 'f.path_components.base64=',
        transformValue: base64PathComponentsTransformer,
      },
    ],
    transformValue: stringTransformer,
  },
  priority: {
    methodCall: 'f.priority=',
    transformValue: numberTransformer,
  },
  sizeBytes: {
    methodCall: 'f.size_bytes=',
    transformValue: numberTransformer,
  },
  sizeChunks: {
    methodCall: 'f.size_chunks=',
    transformValue: numberTransformer,
  },
  completedChunks: {
    methodCall: 'f.completed_chunks=',
    transformValue: numberTransformer,
  },
} as const;

export default torrentContentMethodCallConfigs;
