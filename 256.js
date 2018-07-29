const crypto = require('crypto');

var string = 'HelloWorld';

function Hash(string) {

    var hexHash = crypto.createHash('sha256');
    var binHash = crypto.createHash('sha256');
    var b64Hash = crypto.createHash('sha256');

    hexHash.update(string);
    binHash.update(string);
    b64Hash.update(string);

    var post = {
      "String": string,
      "Hex": hexHash.digest('hex'),
      "Binary": binHash.digest('binary'),
      "Base64": b64Hash.digest('base64')
    }
    return post;

}



for (let p = 0; p<7; p++) {
  console.log(JSON.stringify(Hash(''+p+'')));
}
