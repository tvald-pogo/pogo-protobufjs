let walk = require('walk').walkSync;
let Protobuf = require('protobufjs');
let fs = require('fs');

let src = './POGOProtos/src/POGOProtos';

let builder = Protobuf.newBuilder();
builder.importRoot = src;

walk(src, { listeners: {
  file: (root, stats, next) => {
    let path = `${root}/${stats.name}`;
    if (stats.name.endsWith('.proto'))
    {
      console.log(`load ${path}`);
      Protobuf.loadProtoFile(path, builder);
      next();
    }
    else {
      console.log(`skip ${path}`);
      next();
    }
  },
}});

console.log('COMPLETE!');

exports = builder.build();
console.log(exports);
