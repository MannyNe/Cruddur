import Fastify from 'fastify'
import * as fasAxios from 'fastify-axios'
import { CognitoJwtVerifier } from "aws-jwt-verify";
import { JwtExpiredError } from "aws-jwt-verify/error";

// LOG REQUESTS
const fastify = Fastify({
  logger: true
})
fastify.register(fasAxios, {
  baseURL: process.env.BACKEND_URL
})

// CREATE OBJECT OF COGNITO JWT VERIFIER BY PROVIDING MANDATORY
// OPTIONS
const verifier = CognitoJwtVerifier.create({
    userPoolId: process.env.AWS_COGNITO_USER_POOL_ID,
    tokenUse: process.env.AWS_TOKEN_USE,
    clientId: process.env.AWS_COGNITO_USER_POOL_CLIENT_ID,
});

fastify.get('/*', async (req,res) => {
  const { data, status } = await fastify.axios.get(req.url)
  res.send({ data, status })
})

fastify.post('/*', async (req,res) => {
  const { data, status } = await fastify.axios.get(req.url)
  res.send({ data, status })
})

// GET AUTHORIZATION BY SENDING TOKENS
fastify.post('/verify-token', async (req, res) => {
    try {
        console.log(data)
        console.log(req.url)
        const payload = await verifier.verify(req.body.token);
        res.send({ payload })
    } catch (err) {
        // An error is thrown, so the JWT is not valid
        // Use `instanceof` to test for specific error cases:
        if (err instanceof JwtExpiredError) {
          console.error("JWT expired!");
        }
        throw err;
    }
})

// LISTEN TO REQUESTS COMING THROUGH PORT 6000
fastify.listen({ port: 6000, host: '0.0.0.0' }, (err) => {
    if (err) {
      fastify.log.error(err)
      process.exit(1)
    }
})