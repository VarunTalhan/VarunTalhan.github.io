export default function handler(req, res) {
  res.json({ apiKey: process.env.API_KEY });
}
