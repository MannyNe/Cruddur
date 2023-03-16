import Fastify from 'fastify'
import cors from '@fastify/cors'
import * as fasAxios from 'fastify-axios'
import { CognitoJwtVerifier } from "aws-jwt-verify";
import { JwtExpiredError } from "aws-jwt-verify/error";

// LOG REQUESTS
const fastify = Fastify({
  logger: true
})
await fastify.register(fasAxios, {
  baseURL: process.env.BACKEND_URL,
  headers: {
    "Access-Control-Allow-Origin": "*"
  }
})
await fastify.register(cors, {
  origin: '*',
  credentials: true
})

// CREATE OBJECT OF COGNITO JWT VERIFIER BY PROVIDING MANDATORY
// OPTIONS
const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.AWS_COGNITO_USER_POOL_ID,
  tokenUse: process.env.AWS_TOKEN_USE,
  clientId: process.env.AWS_COGNITO_USER_POOL_CLIENT_ID,
});

fastify.get('/api/*', async (req, res) => {
  const { data, status } = await fastify.axios.get(req.url)
  res.send(data)
})

fastify.post('/api/*', async (req, res) => {
  const { data, status } = await fastify.axios.get(req.url)
  res.send(data)
})

// GET AUTHORIZATION BY SENDING TOKENS
fastify.get('/api/activities/home', async (req, res) => {
  if (req.headers.authorization) {
    let token = req.headers.authorization.substring(req.headers.authorization.indexOf(' ') + 1);
    if (token !== null || token !== 'null') {
      try {
        const payload = await verifier.verify(token)
        console.log(payload)
        //res.send({ payload })
        const { data, status } = await fastify.axios.get(req.url, { headers: { 'x-claims': JSON.stringify(payload) } })
        res.send(data)
      } catch (err) {
        // An error is thrown, so the JWT is not valid
        // Use `instanceof` to test for specific error cases:
        if (err instanceof JwtExpiredError) {
          console.error("JWT expired!");
        }
        const { data, status } = await fastify.axios.get(req.url)
        res.send(data)
        throw err;
      }
    }
    else {
      const { data, status } = await fastify.axios.get(req.url)
      res.send(data)
    }
  }
  else {
    const { data, status } = await fastify.axios.get(req.url)
    res.send(data)
  }
})

// LISTEN TO REQUESTS COMING THROUGH PORT 6000
fastify.listen({ port: 6000, host: '0.0.0.0' }, (err) => {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
})