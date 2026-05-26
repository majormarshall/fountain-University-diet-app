const app = require('../../backend/index');

export const config = {
  api: {
    bodyParser: false, // Let Express parse the body
    externalResolver: true, // Tell Next.js that an external resolver (Express) is handling the response
  },
};

export default function handler(req, res) {
  return app(req, res);
}
