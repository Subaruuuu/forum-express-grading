const imgur = require('imgur')

function ensureAuthenticated(req) {
  return req.isAuthenticated();
}

function getUser(req) {
  return req.user;
}

const imgurUploadPromise = (file, clientId) => {
  return new Promise((resolve, reject) => {
    imgur.setClientId(clientId)
    imgur.uploadFile(file.path)
      .then(img => {
        return resolve(img)
      })
      .catch(err => reject('error'))
  })
}

module.exports = {
  ensureAuthenticated,
  getUser,
  imgurUploadPromise
};