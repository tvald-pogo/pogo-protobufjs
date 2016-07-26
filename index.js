let walk = require('walk').walkSync;
let Protobuf = require('protobufjs');
let fs = require('fs');

let src = './POGOProtos/src';

let builder = Protobuf.newBuilder();
builder.importRoot = src;

// add all types to the builder
walk(src, { listeners: {
  file: (root, stats, next) => {
    if (stats.name.endsWith('.proto'))
      Protobuf.loadProtoFile(`${root}/${stats.name}`, builder);
    next();
  },
}});

// build types
let types = builder.build();

// walk type structure to build up list of type names
let typeMap = {};
let typeNames = [];

let walk_types = (name, obj) => {
  switch(typeof(obj))
  {
    case 'function':
      if (obj.hasOwnProperty('encode') && obj.hasOwnProperty('decode'))
      {
        console.log(name);
        typeMap[name] = obj;
        typeNames.push(name);
      }
    case 'object':
      Object.keys(obj).forEach(childName => {
        if (!childName.startsWith('encode') && !childName.startsWith('decode'))
          walk_types(`${name}.${childName}`, obj[childName]);
      });
      break;
  }
};
walk_types('POGOProtos', types.POGOProtos);

// export API
exports.types = types;

exports.resolve = (type) => {
  if (typeMap[type]) return typeMap[type];
  throw new Error(`Failed to resolve type ${type}`);
};

exports.parse = (buffer, type) => {
  return exports.resolve(type).decode(buffer);
};

exports.serialize = (data, type) => {
  return exports.resolve(type).encode(data);
};

exports.info = () => typeNames;
